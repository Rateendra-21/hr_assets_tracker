from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation
from app.models.asset_lifecycle_event import AssetLifecycleEvent, AssetEventType
from app.schemas.asset_allocation import BulkAssetAllocationRequest, AssetAllocationResponse

router = APIRouter(
    
    tags=["asset-allocations"]
)

@router.post("/assignasset", response_model=List[AssetAllocationResponse])
def bulk_allocate_assets(payload: BulkAssetAllocationRequest, db: Session = Depends(get_db)):
    """
    Assign multiple assets to a single employee.
    """
    employee_id = payload.employee_id
    asset_ids = payload.asset_ids
    user_id = payload.user_id  # <-- get from frontend

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
            allocated_by=user_id  # <-- from frontend
        )
        db.add(allocation)
        db.flush()
        allocations.append(allocation)

        # Create lifecycle event
        event = AssetLifecycleEvent(
            asset_id=asset_id,
            event_type=AssetEventType.ALLOCATED,
            user_id=user_id,  # <-- from frontend
            remarks=f"Allocated to employee {employee_id}"
        )
        db.add(event)

    db.commit()
    return allocations
