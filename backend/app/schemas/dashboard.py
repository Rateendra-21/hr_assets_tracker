from pydantic import BaseModel

class DashboardCounts(BaseModel):
    active_employees: int
    total_assets: int
    allocated_assets: int
    pending_repair_requests: int
    ewaste_assets: int
    in_repair : int
