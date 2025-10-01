from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.asset_lifecycle_event import AssetLifecycleEvent
from app.models.asset import Asset
from app.schemas.asset_lifecycle_event import AssetLifecycleEventResponse, AssetResponse
from pydantic import BaseModel

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
def get_asset_lifecycle_timeline_by_qr(qr_id: str, db: Session = Depends(get_db)):
    # Find asset by qr_id
    asset = db.query(Asset).filter(Asset.qr_id == qr_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Fetch lifecycle events for this asset
    events = (
        db.query(AssetLifecycleEvent)
        .options(joinedload(AssetLifecycleEvent.user))
        .filter(AssetLifecycleEvent.asset_id == asset.id)
        .order_by(AssetLifecycleEvent.event_date.asc())
        .all()
    )

    if not events:
        raise HTTPException(status_code=404, detail="No lifecycle events found for this asset")

    return {
        "asset": asset,
        "events": events
    }
