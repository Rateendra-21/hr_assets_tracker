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
