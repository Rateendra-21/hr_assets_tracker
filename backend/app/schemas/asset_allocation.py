from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum
from app.models.asset_allocation import AllocationStatus
from app.models.asset_allocation import AllocationStatus




class LocationResponse(BaseModel):
    id: int
    locationname: str

    class Config:
        from_attributes = True

class AssetAllocationCreate(BaseModel):
    asset_id: int
    employee_id: int
    allocated_by: str


class AssetResponse(BaseModel):
    id: int
    asset_name: str
    category: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    location_id: Optional[int] = None
    location: Optional[LocationResponse] = None

    class Config:
        # from_attributes = True
        orm_mode = True


class AssetAllocationResponse(BaseModel):
    id: int
    asset_id: int
    employee_id: int
    allocated_by: str
    allocation_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    status: AllocationStatus
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    asset: Optional[AssetResponse] = None  

    class Config:
        orm_mode = True  # <-- changed from from_attributes