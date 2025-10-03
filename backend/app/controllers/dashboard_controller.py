from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation
from app.models.repair_requests import RepairRequest
from app.schemas.dashboard import DashboardCounts

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/counts", response_model=DashboardCounts)
def get_dashboard_counts(db: Session = Depends(get_db)):
    active_employees = db.query(User).filter(
        User.is_active == 1,
        User.working_status == "active",
        User.role == 'EMPLOYEE'
    ).count()

    total_assets = db.query(Asset).count()

    allocated_assets = db.query(AssetAllocation).filter(
        AssetAllocation.status == "ASSIGNED"
    ).count()

    pending_repair_requests = db.query(RepairRequest).filter(
        RepairRequest.status == "PENDING"
    ).count()

    # New counts
    repair_requested_assets = db.query(AssetAllocation).filter(
        AssetAllocation.status == "REPAIR_REQUESTED"
    ).count()

    ewaste_assets = db.query(Asset).filter(
        Asset.status == "EWASTE"
    ).count()

    in_repair_assets = db.query(Asset).filter(
        Asset.status == "IN_REPAIR"
    ).count()

    return {
        "active_employees": active_employees,
        "total_assets": total_assets,
        "allocated_assets": allocated_assets,
        "pending_repair_requests": pending_repair_requests,
        "repair_requested_assets": repair_requested_assets,
        "ewaste_assets": ewaste_assets,
        "in_repair": in_repair_assets
    }





