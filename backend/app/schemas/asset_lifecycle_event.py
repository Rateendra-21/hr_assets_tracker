from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    id: int
    fullname: str   # matches User.fullname
    email: str
    role:str

    class Config:
        orm_mode = True

class AssetResponse(BaseModel):
    id: int
    asset_name: str   # matches Asset.asset_name
    serial_number: Optional[str]  # serial_number can be null
    register_date : datetime
    class Config:
        orm_mode = True

class AssetLifecycleEventResponse(BaseModel):
    id: int
    asset_id: int
    event_type: str
    event_date: Optional[datetime]
    user_id: Optional[int]
    remarks: Optional[str]
    created_at: Optional[datetime]
    vendor_name: Optional[str]

    # asset: Optional[AssetResponse]
    user: Optional[UserResponse]

    class Config:
        orm_mode = True
