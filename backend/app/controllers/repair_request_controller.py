from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.asset_lifecycle import RepairRequest, RepairStatus, AssetStatus, AssetLifecycle
from app.models.user import User, UserRole
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation, AllocationStatus
from app.schemas.repair_request import RepairRequestCreate, RepairRequestResponse, RepairRequestUpdate
from datetime import datetime

router = APIRouter(
    prefix="/repair-requests",
    tags=["repair-requests"]
)

# Employee creates repair request
@router.post("/", response_model=RepairRequestResponse)
def create_repair_request(
    request: RepairRequestCreate,
    db: Session = Depends(get_db)
):
    # Check if asset exists
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Create repair request with a default user ID (1 for admin)
    repair_request = RepairRequest(
        asset_id=request.asset_id,
        requested_by=1,  # Using default admin ID
        issue_description=request.issue_description
    )
    
    # Update asset status to under repair
    asset.status = AssetStatus.UNDER_REPAIR.value
    
    # Create asset lifecycle entry to track the repair request
    lifecycle_event = AssetLifecycle(
        asset_id=asset.id,
        previous_status=asset.status,
        current_status=AssetStatus.UNDER_REPAIR.value,
        updated_by=1,  # Default admin ID
        notes=f"Repair requested: {request.issue_description}"
    )
    db.add(lifecycle_event)
    
    db.add(repair_request)
    db.commit()
    db.refresh(repair_request)
    
    return repair_request

# Create repair request for an asset
@router.post("/create-repair", response_model=RepairRequestResponse)
def create_repair(
    request: RepairRequestCreate,
    db: Session = Depends(get_db)
):
    # Check if asset exists
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Create repair request
    repair_request = RepairRequest(
        asset_id=request.asset_id,
        requested_by=1,  # Default to admin/system user
        issue_description=request.issue_description
    )
    
    # Update asset status to under repair
    asset.status = AssetStatus.UNDER_REPAIR.value
    
    db.add(repair_request)
    db.commit()
    db.refresh(repair_request)
    
    return repair_request

# Get all repair requests
@router.get("/", response_model=List[RepairRequestResponse])
def get_repair_requests(
    status: RepairStatus = None,
    db: Session = Depends(get_db)
):
    # Show all requests without authentication
    query = db.query(RepairRequest)
    
    if status:
        query = query.filter(RepairRequest.status == status)
    
    return query.all()

# Get specific repair request
@router.get("/{request_id}", response_model=RepairRequestResponse)
def get_repair_request(
    request_id: int,
    db: Session = Depends(get_db)
):
    repair_request = db.query(RepairRequest).filter(RepairRequest.id == request_id).first()
    if not repair_request:
        raise HTTPException(status_code=404, detail="Repair request not found")
    
    return repair_request

# Update repair request
@router.put("/{request_id}", response_model=RepairRequestResponse)
def update_repair_request(
    request_id: int,
    request_update: RepairRequestUpdate,
    db: Session = Depends(get_db)
):
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
                updated_by=1,  # Default admin ID
                notes=f"Repair completed: {request_update.resolution_notes}"
            )
            db.add(lifecycle_event)
    
    db.commit()
    db.refresh(repair_request)
    
    return repair_request