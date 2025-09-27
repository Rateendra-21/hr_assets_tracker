from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session ,joinedload
from app.database import get_db
from app.models.asset_allocation import AssetAllocation
from app.models.asset import Asset
from app.schemas.asset_allocation import AssetAllocationCreate
from typing import List

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

@router.post("/bulk")
def create_bulk_asset_allocation(allocations: List[AssetAllocationCreate], db: Session = Depends(get_db)):
    """
    Assign multiple assets to an employee in a single request
    """
    results = []
    errors = []
    
    for allocation in allocations:
        try:
            # Create allocation record
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
            
            # Update asset status
            asset = db.query(Asset).filter(Asset.id == allocation.asset_id).first()
            if not asset:
                errors.append(f"Asset ID {allocation.asset_id} not found")
                continue
                
            asset.status = "assigned"
            db.commit()
            db.refresh(new_allocation)
            db.refresh(asset)
            
            results.append(new_allocation)
        except Exception as e:
            db.rollback()
            errors.append(f"Error allocating asset ID {allocation.asset_id}: {str(e)}")
    
    return {
        "success": len(results),
        "errors": len(errors),
        "error_details": errors,
        "allocations": results
    }


@router.get("/assetbyempid/{employee_id}", response_model=list[AssetAllocationResponse])
def get_allocations_by_employee(employee_id: int, db: Session = Depends(get_db)):
    allocations = db.query(AssetAllocation).options(
        joinedload(AssetAllocation.asset) 
    ).filter(
        AssetAllocation.employee_id == employee_id,
        AssetAllocation.return_date.is_(None)  # Only show assets that haven't been returned
    ).all()

    if not allocations:
        return []  # Return empty list instead of 404 error when no allocations found

    return allocations


