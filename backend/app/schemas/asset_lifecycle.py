from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.asset_lifecycle import AssetStatus

class AssetLifecycleBase(BaseModel):
    asset_id: int
    current_status: AssetStatus
    notes: Optional[str] = None

class AssetLifecycleCreate(AssetLifecycleBase):
    user_id: Optional[int] = None
    event_date: Optional[datetime] = None

class AssetLifecycleResponse(AssetLifecycleBase):
    id: int
    previous_status: Optional[AssetStatus] = None
    assigned_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    repair_date: Optional[datetime] = None
    disposal_date: Optional[datetime] = None
    updated_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True