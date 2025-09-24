from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session ,joinedload
from app.database import get_db
from app.models.asset_allocation import AssetAllocation
from app.models.asset import Asset
from app.schemas.asset_allocation import AssetAllocationCreate

from app.models.asset_allocation import AssetAllocation
from app.schemas.asset_allocation import AssetAllocationResponse
router = APIRouter(prefix="/asset-allocations", tags=["Asset Allocations"])



@router.post("/")
def create_asset_allocation(allocation: AssetAllocationCreate, db: Session = Depends(get_db)):
    new_allocation = AssetAllocation(
        asset_id=allocation.asset_id,
        employee_id=allocation.employee_id,
        allocated_by=allocation.allocated_by,
        return_date=None,
        status="assigned",
        notes=None,
        created_at=None,
        updated_at=None
    )
    db.add(new_allocation)
    asset = db.query(Asset).filter(Asset.id == allocation.asset_id).first()
    if not asset:
        db.rollback()
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.status = "assigned"
    db.commit()
    db.refresh(new_allocation)
    db.refresh(asset)

    return new_allocation


@router.get("/assetbyempid/{employee_id}", response_model=list[AssetAllocationResponse])
def get_allocations_by_employee(employee_id: int, db: Session = Depends(get_db)):
    allocations = db.query(AssetAllocation).options(
        joinedload(AssetAllocation.asset) 
    ).filter(
        AssetAllocation.employee_id == employee_id
    ).all()

    if not allocations:
        raise HTTPException(status_code=404, detail="No allocations found for this employee")

    return allocations


