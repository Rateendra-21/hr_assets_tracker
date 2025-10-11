from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.asset_lifecycle_event import AssetLifecycleEvent
from app.models.asset import Asset
from app.schemas.asset_lifecycle_event import AssetLifecycleEventResponse, AssetResponse
from pydantic import BaseModel
from app.utils.jwt import create_access_token
from app.utils.auth import get_current_user
from app.models.user import User
from app.schemas.asset_lifecycle_event import AssetLifecycleEventResponse, UserResponse

router = APIRouter(
    prefix="/asset-lifecycle",
    tags=["Asset Lifecycle"]
)

class AssetWithLifecycleEventsResponse(BaseModel):
    asset: AssetResponse
    events: List[AssetLifecycleEventResponse]

    class Config:
        orm_mode = True


@router.get("/timeline/qr/{qr_id}", response_model=AssetWithLifecycleEventsResponse)
def get_asset_lifecycle_timeline_by_qr(qr_id: str, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):

    asset = db.query(Asset).filter(Asset.qr_id == qr_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    events = (
        db.query(AssetLifecycleEvent)
        .options(joinedload(AssetLifecycleEvent.user))
        .filter(AssetLifecycleEvent.asset_id == asset.id)
        .order_by(AssetLifecycleEvent.event_date.asc())
        .all()
    )

 
    admin_user_obj = next((e.user for e in events if e.user and e.user.role == "ADMIN"), None)

   
    if admin_user_obj:
        admin_user = UserResponse.from_orm(admin_user_obj)
    else:
        admin_user = UserResponse(
            id=0,
            fullname="Admin",
            email="admin@example.com",
            role="ADMIN"
        )

    registered_event = AssetLifecycleEventResponse(
        id=0, 
        asset_id=asset.id,
        event_type="REGISTERED",
        event_date=asset.register_date,
        user_id=admin_user.id,
        remarks="Asset registered in system",
        created_at=asset.register_date,
        vendor_name=None,
        user=admin_user
    )
    if not events:
        all_events = [registered_event]
    else:
        all_events = [registered_event] + events

    return {
        "asset": asset,
        "events": all_events
    }



@router.get("/timeline/{asset_id}", response_model=AssetWithLifecycleEventsResponse)
def get_asset_lifecycle_timeline_by_asset_id(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    events = (
        db.query(AssetLifecycleEvent)
        .options(joinedload(AssetLifecycleEvent.user))
        .filter(AssetLifecycleEvent.asset_id == asset.id)
        .order_by(AssetLifecycleEvent.event_date.asc())
        .all()
    )

    admin_user_obj = next((e.user for e in events if e.user and e.user.role == "ADMIN"), None)

    if admin_user_obj:
        admin_user = UserResponse.from_orm(admin_user_obj)
    else:
        admin_user = UserResponse(
            id=0,
            fullname="Admin",
            email="admin@example.com",
            role="ADMIN"
        )

    registered_event = AssetLifecycleEventResponse(
        id=0,
        asset_id=asset.id,
        event_type="REGISTERED",
        event_date=asset.register_date,
        user_id=admin_user.id,
        remarks="Asset registered in system",
        created_at=asset.register_date,
        vendor_name=None,
        user=admin_user
    )

    if not events:
        all_events = [registered_event]
    else:
        all_events = [registered_event] + events

    return {
        "asset": asset,
        "events": all_events
    }






@router.get("/trackassetby/{qr_id}", response_model=AssetWithLifecycleEventsResponse)
def get_asset_lifecycle_timeline_by_qr(qr_id: str, db: Session = Depends(get_db)):

    asset = db.query(Asset).filter(Asset.qr_id == qr_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    events = (
        db.query(AssetLifecycleEvent)
        .options(joinedload(AssetLifecycleEvent.user))
        .filter(AssetLifecycleEvent.asset_id == asset.id)
        .order_by(AssetLifecycleEvent.event_date.asc())
        .all()
    )

 
    admin_user_obj = next((e.user for e in events if e.user and e.user.role == "ADMIN"), None)

   
    if admin_user_obj:
        admin_user = UserResponse.from_orm(admin_user_obj)
    else:
        admin_user = UserResponse(
            id=0,
            fullname="Admin",
            email="admin@example.com",
            role="ADMIN"
        )

    registered_event = AssetLifecycleEventResponse(
        id=0, 
        asset_id=asset.id,
        event_type="REGISTERED",
        event_date=asset.register_date,
        user_id=admin_user.id,
        remarks="Asset registered in system",
        created_at=asset.register_date,
        vendor_name=None,
        user=admin_user
    )
    if not events:
        all_events = [registered_event]
    else:
        all_events = [registered_event] + events

    return {
        "asset": asset,
        "events": all_events
    }