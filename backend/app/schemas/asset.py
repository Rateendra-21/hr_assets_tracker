from pydantic import BaseModel
from typing import Optional
from datetime import datetime
# ---------------------------------
from app.schemas.location import LocationSchema
# from app.schemas.user import UserResponse
# from app.schemas.user import UserResponse

# Request schema
class AssetCreate(BaseModel):
    asset_name: str
    category: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    specification: Optional[str] = None
    ip_address: Optional[str] = None
    connectivity_type: Optional[str] = None
    power_source: Optional[str] = None
    color: Optional[str] = None
    power_output: Optional[str] = None
    connector_type: Optional[str] = None
    cable_type: Optional[str] = None
    location_id: Optional[int] = None
    status: Optional[str] = "available"
    qr_id: Optional[str] = None


# Response schema
class AssetResponse(BaseModel):
    id: int
    asset_name: str
    category: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    specification: Optional[str] = None
    ip_address: Optional[str] = None
    connectivity_type: Optional[str] = None
    power_source: Optional[str] = None
    color: Optional[str] = None
    power_output: Optional[str] = None
    connector_type: Optional[str] = None
    cable_type: Optional[str] = None
    status: Optional[str] = None
    qr_id: Optional[str] = None
    location_id: Optional[int] = None
    register_date: datetime
    updated_at: Optional[datetime] = None
    location: Optional[LocationSchema] = None

    class Config:
        from_attributes = True
