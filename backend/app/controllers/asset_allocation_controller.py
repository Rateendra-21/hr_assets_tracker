from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Any
from datetime import datetime

from app.database import get_db
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation, AssetAllocationStatus
from app.models.asset_lifecycle_event import AssetLifecycleEvent, AssetEventType
from app.models.user import User
from app.schemas.asset_allocation import (
    BulkAssetAllocationRequest,
    AssetAllocationResponse,
    AssignedAssetResponse,
    ReturnAssetRequest
)

router = APIRouter(
    tags=["asset-allocations"]
)

# ---------------------------
# Bulk Asset Allocation
# ---------------------------
@router.post("/assignasset", response_model=List[AssetAllocationResponse])
def bulk_allocate_assets(payload: BulkAssetAllocationRequest, db: Session = Depends(get_db)):
    """
    Assign multiple assets to a single employee.
    """
    employee_id = payload.employee_id
    asset_ids = payload.asset_ids
    user_id = payload.user_id  

    if not asset_ids:
        raise HTTPException(status_code=400, detail="No asset IDs provided")

    allocations = []

    for asset_id in asset_ids:
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
        if asset.status == "ASSIGNED":
            raise HTTPException(status_code=400, detail=f"Asset {asset_id} is already assigned")

        # Update asset status
        asset.status = "ASSIGNED"
        db.add(asset)

        # Create allocation record
        allocation = AssetAllocation(
            asset_id=asset_id,
            employee_id=employee_id,
            allocated_by=user_id
        )
        db.add(allocation)
        db.flush()
        allocations.append(allocation)

        # Create lifecycle event
        event = AssetLifecycleEvent(
            asset_id=asset_id,
            event_type=AssetEventType.ALLOCATED,
            user_id=user_id,
            remarks=f"Allocated to employee {employee_id}"
        )
        db.add(event)

    db.commit()
    return allocations

# ---------------------------
# Assigned Assets Fetch
# ---------------------------
@router.get("/assigned", response_model=List[AssignedAssetResponse])
def get_assigned_assets(db: Session = Depends(get_db)):
    """
    Get all assigned assets with employee and allocator details
    """
    allocations = (
        db.query(AssetAllocation)
        .options(
            joinedload(AssetAllocation.asset),
            joinedload(AssetAllocation.asset).joinedload(Asset.location),
        )
        .filter(AssetAllocation.status == AssetAllocationStatus.ASSIGNED)
        .all()
    )

    response = []
    for alloc in allocations:
        employee = db.query(User).filter(User.id == alloc.employee_id).first()
        allocator = db.query(User).filter(User.id == alloc.allocated_by).first()

        response.append(
            AssignedAssetResponse(
                allocation_id=alloc.id,
                asset_id=alloc.asset.id,
                asset_name=alloc.asset.asset_name,
                category=alloc.asset.category,
                status=alloc.status.value if hasattr(alloc.status, "value") else alloc.status,
                employee_id=employee.id if employee else alloc.employee_id,
                employee_name=employee.fullname if employee else "-",
                allocated_by=allocator.id if allocator else alloc.allocated_by,
                allocated_by_name=allocator.fullname if allocator else "-",
                allocation_date=alloc.allocation_date,
                designation=employee.designation if employee else None,
                manufacturer=alloc.asset.manufacturer if alloc.asset else None,
            )
        )

    return response

# ---------------------------
# Return Asset
# ---------------------------
@router.post("/return-asset")
def return_asset(request: ReturnAssetRequest, db: Session = Depends(get_db)) -> Any:
    """
    Return an assigned asset and create a lifecycle event
    """
    # Fetch the allocation record
    allocation = db.query(AssetAllocation).filter(
        AssetAllocation.id == request.allocation_id,
        AssetAllocation.status == AssetAllocationStatus.ASSIGNED
    ).first()

    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found or already returned")

    # Update allocation record
    allocation.status = AssetAllocationStatus.RETURNED
    allocation.return_date = datetime.utcnow()
    if request.notes:
        allocation.notes = request.notes

    db.add(allocation)

    # Create lifecycle event for return
    lifecycle_event = AssetLifecycleEvent(
        asset_id=allocation.asset_id,
        event_type=AssetEventType.RETURNED,
        event_date=datetime.utcnow(),
        user_id=allocation.employee_id,  # returning user
        remarks=request.notes
    )
    db.add(lifecycle_event)

    # Update asset status to available
    asset = db.query(Asset).filter(Asset.id == allocation.asset_id).first()
    if asset:
        asset.status = "AVAILABLE"
        db.add(asset)

    db.commit()
    db.refresh(allocation)

    return {"message": "Asset returned successfully", "allocation_id": allocation.id}
