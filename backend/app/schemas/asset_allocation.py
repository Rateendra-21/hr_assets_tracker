from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class AllocationStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    RETURNED = "RETURNED"

class AssetAllocationResponse(BaseModel):
    id: int
    asset_id: int
    employee_id: int
    allocated_by: int
    allocation_date: datetime
    status: AllocationStatus

    class Config:
        orm_mode = True

class BulkAssetAllocationRequest(BaseModel):
    employee_id: int
    asset_ids: List[int]
    user_id: int

class ReturnAssetRequest(BaseModel):
    allocation_id: int
    notes: Optional[str] = None  # Remarks or notes while returning


class AssignedAssetResponse(BaseModel):
    allocation_id: int
    asset_id: int
    asset_name: str
    category: str | None
    status: str
    employee_id: int
    employee_name: str
    allocated_by: int
    allocated_by_name: str
    allocation_date: datetime
    designation: Optional[str] = None
    manufacturer: Optional[str] = None
   

    # return_date: datetime | None
    # notes: str | None

    class Config:
        orm_mode = True