from fastapi import APIRouter, Depends, HTTPException , status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetResponse
from datetime import datetime
from app.models.asset_allocation import AssetAllocation

router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)



@router.post("/assetregister", response_model=AssetResponse)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    serial_number = asset.serial_number.strip() if asset.serial_number else None
    if asset.status != "e-waste" and serial_number and asset.category in ["Laptop", "Desktop", "Mouse"]:
        existing_asset = db.query(Asset).filter(Asset.serial_number == serial_number).first()
        if existing_asset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Asset with serial_number '{serial_number}' already exists."
            )
    db_asset = Asset(
        **asset.dict(exclude={"serial_number"}),
        serial_number=serial_number,
        register_date=datetime.utcnow()
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


# Get all assets
@router.get("/getAllAssets", response_model=List[AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    return db.query(Asset).all()

# Get asset by ID
@router.get("/getAssetbyid/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.put("/ewaste/{asset_id}", response_model=AssetResponse)
def mark_ewaste(asset_id: int, remarks: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset.status = "e-waste"
    asset.remarks = remarks  
    asset.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(asset)

    return asset


# get all the count 

from app.models.asset import Asset
from app.models.location import Location
from sqlalchemy import func
@router.get("/counts")
@router.get("/counts")
def get_asset_counts(db: Session = Depends(get_db)):
    """
    Returns counts of assets grouped by category, status, location, and total count
    """

    # Count by category
    category_counts = db.query(
        Asset.category,
        func.count(Asset.id)
    ).group_by(Asset.category).all()

    # Count by status
    status_counts = db.query(
        Asset.status,
        func.count(Asset.id)
    ).group_by(Asset.status).all()

    # Count by location
    location_counts = db.query(
        Location.locationname,
        func.count(Asset.id)
    ).join(Asset, Asset.location_id == Location.id, isouter=True)\
     .group_by(Location.locationname).all()

    # Total count of all assets
    total_count = db.query(func.count(Asset.id)).scalar()

    return {
        "total_count": total_count,
        "category_counts": {cat if cat else "Unknown": count for cat, count in category_counts},
        "status_counts": {status if status else "Unknown": count for status, count in status_counts},
        "location_counts": {loc if loc else "Unknown": count for loc, count in location_counts}
    }



@router.put("/updateasset/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: int, asset: AssetCreate, db: Session = Depends(get_db)):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found."
        )
    if db_asset.status != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only assets with status 'available' can be updated."
        )
    serial_number = asset.serial_number.strip() if asset.serial_number else None
    if asset.status != "e-waste" and serial_number and asset.category in ["Laptop", "Desktop", "Mouse"]:
        existing_asset = (
            db.query(Asset)
            .filter(Asset.serial_number == serial_number, Asset.id != asset_id)
            .first()
        )
        if existing_asset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Asset with serial_number '{serial_number}' already exists."
            )

    for field, value in asset.dict(exclude={"serial_number"}, exclude_unset=True).items():
        setattr(db_asset, field, value)
    db_asset.serial_number = serial_number

    db.commit()
    db.refresh(db_asset)
    return db_asset





# @router.get("/qr/{qr_id:path}", response_model=AssetResponse)
# def get_asset_by_qr(qr_id: str, db: Session = Depends(get_db)):
#     asset = db.query(Asset).filter(Asset.qr_id == qr_id).first()
#     if not asset:
#         raise HTTPException(status_code=404, detail="Asset not found")
    
#     allocation = (
#         db.query(AssetAllocation)
#         .filter(AssetAllocation.asset_id == asset.id)
#         .order_by(AssetAllocation.id.desc())
#         .first()
#     )
    
#     # Add employee_id dynamically
#     asset.employee_id = allocation.employee_id if allocation else None
#     return asset


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation
from app.models.user import User
from app.schemas.asset import AssetResponse
from app.schemas.user import UserResponse

# router = APIRouter()

@router.get("/trackAssetByqr/{qr_id:path}", response_model=AssetResponse)
def get_asset_by_qr(qr_id: str, db: Session = Depends(get_db)):

    asset = db.query(Asset).filter(Asset.qr_id == qr_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    allocation = (
        db.query(AssetAllocation)
        .filter(AssetAllocation.asset_id == asset.id)
        .order_by(AssetAllocation.id.desc())
        .first()
    )


    asset.employee_id = allocation.employee_id if allocation else None
    employee_response = None
    if allocation and allocation.employee_id:
        user = db.query(User).filter(User.id == allocation.employee_id).first()
        if not user:
            user = db.query(User).filter(User.employee_id == str(allocation.employee_id)).first()
        if user:
            employee_response = UserResponse.from_orm(user)
    asset.employee = employee_response

    return asset