from fastapi import APIRouter, Depends, HTTPException , status , UploadFile , File
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetResponse
from datetime import datetime
from app.models.asset import Asset
from app.models.location import Location
from sqlalchemy import func

from app.models.user import User
from app.schemas.asset import AssetResponse
from app.schemas.user import UserResponse
import csv
import io
from app.models.asset_lifecycle_event import AssetLifecycleEvent
from app.utils.jwt import create_access_token
from app.utils.auth import get_current_user

router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)


# register a new asset manually
@router.post("/assetregister", response_model=AssetResponse)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
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
def get_assets(db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    return db.query(Asset).all()

# Get asset by ID
@router.get("/getAssetbyid/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset



# get all the count 


# @router.get("/counts")
# def get_asset_counts(db: Session = Depends(get_db)):
#     """
#     Returns counts of assets grouped by category, status, location, and total count
#     """

#     # Count by category
#     category_counts = db.query(
#         Asset.category,
#         func.count(Asset.id)
#     ).group_by(Asset.category).all()

#     # Count by status
#     status_counts = db.query(
#         Asset.status,
#         func.count(Asset.id)
#     ).group_by(Asset.status).all()

#     # Count by location
#     location_counts = db.query(
#         Location.locationname,
#         func.count(Asset.id)
#     ).join(Asset, Asset.location_id == Location.id, isouter=True)\
#      .group_by(Location.locationname).all()

#     # Total count of all assets
#     total_count = db.query(func.count(Asset.id)).scalar()

#     return {
#         "total_count": total_count,
#         "category_counts": {cat if cat else "Unknown": count for cat, count in category_counts},
#         "status_counts": {status if status else "Unknown": count for status, count in status_counts},
#         "location_counts": {loc if loc else "Unknown": count for loc, count in location_counts}
#     }

# update asset details

@router.put("/updateasset/{asset_id}", response_model=AssetResponse)
def update_asset(asset_id: int, asset: AssetCreate, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with id {asset_id} not found."
        )
    if db_asset.status != "AVAILABLE":
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


# track asset by qr code id

def generate_qr_id(category: str, location_name: str):
    import random
    random_seq = random.randint(1000, 9999)
    category_code = category[:3].upper()
    location_code = location_name[:3].upper() if location_name else "LOC"
    return f"Argibid-{location_code}-{category_code}-{random_seq}"


@router.post("/assetregister/csv", response_model=List[AssetResponse])
def upload_assets_csv(file: UploadFile, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))
    rows = list(reader)  # Convert to list to check length

    if not rows:
        raise HTTPException(status_code=400, detail="Uploaded CSV file does not contain any data.")

    saved_assets = []

    for idx, row in enumerate(rows, start=2):  # start=2 for CSV row number
        # Skip completely empty rows
        if all(not v.strip() for v in row.values()):
            continue

        # Required fields validation
        required_fields = ["asset_name", "category", "workLocation", "manufacturer"]
        for field in required_fields:
            if not row.get(field):
                raise HTTPException(
                    status_code=400,
                    detail=f"Row {idx}: {field} is required."
                )

        # Category-specific validation
        category = row["category"]
        if category in ["Laptop", "Desktop"]:
            for f in ["model", "serial_number", "specification", "ip_address"]:
                if not row.get(f):
                    raise HTTPException(status_code=400, detail=f"Row {idx}: {f} is required for {category}")
        if category == "Mouse":
            for f in ["model", "serial_number", "connectivity_type", "power_source", "color"]:
                if not row.get(f):
                    raise HTTPException(status_code=400, detail=f"Row {idx}: {f} is required for Mouse")
        if category == "Charger":
            for f in ["power_output", "connector_type", "cable_type"]:
                if not row.get(f):
                    raise HTTPException(status_code=400, detail=f"Row {idx}: {f} is required for Charger")

        # Check duplicate serial_number
        serial_number = row.get("serial_number", "").strip() or None
        if serial_number and category in ["Laptop", "Desktop", "Mouse"]:
            existing = db.query(Asset).filter(Asset.serial_number == serial_number).first()
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail=f"Row {idx}: Asset with serial_number '{serial_number}' already exists."
                )

        # Generate QR ID
        location_name = row.get("workLocation", "LOC")
        qr_id = generate_qr_id(category, location_name)

        asset_data = Asset(
            asset_name=row["asset_name"],
            category=category,
            location_id=int(row["workLocation"]),
            manufacturer=row["manufacturer"],
            model=row.get("model"),
            serial_number=serial_number,
            specification=row.get("specification"),
            ip_address=row.get("ip_address"),
            connectivity_type=row.get("connectivity_type"),
            power_source=row.get("power_source"),
            color=row.get("color"),
            power_output=row.get("power_output"),
            connector_type=row.get("connector_type"),
            cable_type=row.get("cable_type"),
            status=row.get("status") or "available",
            qr_id=qr_id,
            register_date=datetime.utcnow()
        )

        db.add(asset_data)
        db.commit()
        db.refresh(asset_data)
        saved_assets.append(asset_data)

    if not saved_assets:
        raise HTTPException(status_code=400, detail="Uploaded CSV file does not contain any valid asset data.")

    return saved_assets







