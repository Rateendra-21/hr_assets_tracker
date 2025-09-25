from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.asset_lifecycle import RepairRequest, RepairStatus, AssetStatus, AssetLifecycle
from app.models.user import User, UserRole
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation, AllocationStatus
from app.schemas.repair_request import RepairRequestCreate, RepairRequestResponse, RepairRequestUpdate
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/repair-requests",
    tags=["repair-requests"]
)

# Employee creates repair request
@router.post("/", response_model=RepairRequestResponse)
def create_repair_request(
    request: RepairRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if asset exists
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Check if asset is assigned to the requesting employee
    allocation = db.query(AssetAllocation).filter(
        AssetAllocation.asset_id == request.asset_id,
        AssetAllocation.employee_id == current_user.id,
        AssetAllocation.status == AllocationStatus.assigned
    ).first()
    
    if not allocation:
        raise HTTPException(status_code=403, detail="You can only request repairs for assets assigned to you")
    
    # Create repair request
    repair_request = RepairRequest(
        asset_id=request.asset_id,
        requested_by=current_user.id,
        issue_description=request.issue_description
    )
    
    db.add(repair_request)
    db.commit()
    db.refresh(repair_request)
    
    return repair_request

# Get all repair requests (Admin/Super Admin)
@router.get("/", response_model=List[RepairRequestResponse])
def get_repair_requests(
    status: RepairStatus = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.EMPLOYEE:
        # Employees can only see their own requests
        query = db.query(RepairRequest).filter(RepairRequest.requested_by == current_user.id)
    else:
        # Admins and Super Admins can see all requests
        query = db.query(RepairRequest)
    
    if status:
        query = query.filter(RepairRequest.status == status)
    
    return query.all()

# Get specific repair request
@router.get("/{request_id}", response_model=RepairRequestResponse)
def get_repair_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repair_request = db.query(RepairRequest).filter(RepairRequest.id == request_id).first()
    if not repair_request:
        raise HTTPException(status_code=404, detail="Repair request not found")
    
    # Check permissions
    if current_user.role == UserRole.EMPLOYEE and repair_request.requested_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this repair request")
    
    return repair_request

# Update repair request (Admin/Super Admin)
@router.put("/{request_id}", response_model=RepairRequestResponse)
def update_repair_request(
    request_id: int,
    request_update: RepairRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only admins can update repair requests
    if current_user.role == UserRole.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Not authorized to update repair requests")
    
    repair_request = db.query(RepairRequest).filter(RepairRequest.id == request_id).first()
    if not repair_request:
        raise HTTPException(status_code=404, detail="Repair request not found")
    
    # Update fields
    if request_update.status:
        repair_request.status = request_update.status
    
    if request_update.assigned_to:
        repair_request.assigned_to = request_update.assigned_to
    
    if request_update.resolution_notes:
        repair_request.resolution_notes = request_update.resolution_notes
        
    if request_update.status == RepairStatus.COMPLETED:
        from datetime import datetime
        repair_request.resolution_date = datetime.utcnow()
        
        # Update asset status back to available
        asset = db.query(Asset).filter(Asset.id == repair_request.asset_id).first()
        if asset:
            asset.status = AssetStatus.AVAILABLE
            
            # Create lifecycle event
            from app.models.asset_lifecycle import AssetLifecycle, AssetStatus
            lifecycle_event = AssetLifecycle(
                asset_id=asset.id,
                previous_status=AssetStatus.UNDER_REPAIR,
                current_status=AssetStatus.AVAILABLE,
                updated_by=current_user.id,
                notes=f"Repair completed: {request_update.resolution_notes}"
            )
            db.add(lifecycle_event)
    
    db.commit()
    db.refresh(repair_request)
    
    return repair_request