from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.asset_lifecycle import RepairStatus

class RepairRequestBase(BaseModel):
    asset_id: int
    issue_description: str

class RepairRequestCreate(RepairRequestBase):
    pass

class RepairRequestUpdate(BaseModel):
    status: Optional[RepairStatus] = None
    assigned_to: Optional[int] = None
    resolution_notes: Optional[str] = None

class RepairRequestResponse(RepairRequestBase):
    id: int
    requested_by: int
    assigned_to: Optional[int] = None
    status: RepairStatus
    request_date: datetime
    resolution_date: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True