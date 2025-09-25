from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.asset_lifecycle import AssetLifecycle, AssetStatus
from app.models.user import User, UserRole
from app.models.asset import Asset
from app.schemas.asset_lifecycle import AssetLifecycleCreate, AssetLifecycleResponse
from app.utils.auth import get_current_user, get_admin_user

router = APIRouter(
    prefix="/asset-lifecycle",
    tags=["asset-lifecycle"]
)

# Get asset lifecycle history
@router.get("/{asset_id}", response_model=List[AssetLifecycleResponse])
def get_asset_lifecycle(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if asset exists
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get all lifecycle events for this asset
    lifecycle_events = db.query(AssetLifecycle).filter(
        AssetLifecycle.asset_id == asset_id
    ).order_by(AssetLifecycle.created_at.desc()).all()
    
    return lifecycle_events

# Update asset status (Admin/Super Admin only)
@router.post("/", response_model=AssetLifecycleResponse)
def update_asset_status(
    lifecycle: AssetLifecycleCreate,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Check if asset exists
    asset = db.query(Asset).filter(Asset.id == lifecycle.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Create new lifecycle event
    previous_status = asset.status
    
    # Update asset status
    asset.status = lifecycle.current_status
    
    # Create lifecycle event
    lifecycle_event = AssetLifecycle(
        asset_id=lifecycle.asset_id,
        user_id=lifecycle.user_id,
        previous_status=previous_status,
        current_status=lifecycle.current_status,
        notes=lifecycle.notes,
        updated_by=current_user.id
    )
    
    # Set appropriate date based on status
    if lifecycle.current_status == AssetStatus.assigned:
        lifecycle_event.assigned_date = lifecycle.event_date
    elif lifecycle.current_status == AssetStatus.RETURNED:
        lifecycle_event.return_date = lifecycle.event_date
    elif lifecycle.current_status == AssetStatus.UNDER_REPAIR:
        lifecycle_event.repair_date = lifecycle.event_date
    elif lifecycle.current_status in [AssetStatus.DISPOSED, AssetStatus.E_WASTE]:
        lifecycle_event.disposal_date = lifecycle.event_date
    
    db.add(lifecycle_event)
    db.commit()
    db.refresh(lifecycle_event)
    
    return lifecycle_event

# Mark asset as e-waste (Admin/Super Admin only)
@router.post("/{asset_id}/e-waste", response_model=AssetLifecycleResponse)
def mark_as_ewaste(
    asset_id: int,
    notes: str,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Check if asset exists
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Create new lifecycle event
    previous_status = asset.status
    
    # Update asset status
    asset.status = AssetStatus.E_WASTE
    
    # Create lifecycle event
    from datetime import datetime
    
    lifecycle_event = AssetLifecycle(
        asset_id=asset_id,
        previous_status=previous_status,
        current_status=AssetStatus.E_WASTE,
        notes=notes,
        updated_by=current_user.id,
        disposal_date=datetime.utcnow()
    )
    
    db.add(lifecycle_event)
    db.commit()
    db.refresh(lifecycle_event)
    
    return lifecycle_event