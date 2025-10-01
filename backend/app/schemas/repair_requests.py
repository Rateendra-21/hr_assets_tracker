from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum
from app.schemas.user import UserResponse
from typing import List
from app.schemas.repair_request_image import RepairRequestImageResponse

# Enum for status
class RepairRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"

# Schema for creating a new repair request
class RepairRequestCreate(BaseModel):
    asset_id: int
    requested_by: int
    issue_description: str

# Schema for updating a repair request (admin actions)
class RepairRequestUpdate(BaseModel):
    status: Optional[RepairRequestStatus] = None
    assigned_to: Optional[int] = None
    approved_by: Optional[int] = None
    resolution_notes: Optional[str] = None
    approved_date: Optional[datetime] = None
    resolution_date: Optional[datetime] = None

# Schema for reading / returning repair request


class RepairRequestResponse(BaseModel):
    id: int
    asset_id: int
    requested_by: int
    assigned_to: Optional[int]
    approved_by: Optional[int]
    issue_description: str
    status: RepairRequestStatus
    request_date: datetime
    approved_date: Optional[datetime]
    resolution_date: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True



class EwasteRequest(BaseModel):
    asset_id: int
    user_id: int
    remarks: str


# -------------------------------------------------


class RepairRequestWithUserResponse(BaseModel):
    id: int
    asset_id: int
    requested_by: int
    assigned_to: Optional[int]
    approved_by: Optional[int]
    issue_description: str
    status: RepairRequestStatus
    request_date: datetime
    approved_date: Optional[datetime]
    resolution_date: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Add full user info
    requested_user: Optional[UserResponse] = None
    assigned_user: Optional[UserResponse] = None
    approved_user: Optional[UserResponse] = None
    images: List[RepairRequestImageResponse] = []

    class Config:
        orm_mode = True