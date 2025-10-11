from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation
from app.models.repair_requests import RepairRequest
from app.schemas.dashboard import DashboardCounts
from sqlalchemy import func
from app.models.asset_lifecycle_event import AssetLifecycleEvent
from app.utils.jwt import create_access_token
from app.utils.auth import get_current_user
from sqlalchemy import func, distinct
from app.models.asset_allocation import AssetAllocation, AssetAllocationStatus

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


# Existing API to get all counts for the admin and super admin
@router.get("/counts", response_model=DashboardCounts)
def get_dashboard_counts(db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
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

# New API: Get dashboard counts by user_id

# @router.get("/assigned-assets-count/{user_id}")
# def get_assigned_assets_count(user_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
  
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")


#     assigned_count = db.query(func.count(AssetAllocation.id)).filter(
#         AssetAllocation.employee_id == user.id,
#         AssetAllocation.status == "ASSIGNED"
#     ).scalar()

  
#     latest_event_subq = (
#         db.query(
#             AssetLifecycleEvent.asset_id,
#             func.max(AssetLifecycleEvent.event_date).label("latest_date")
#         )
#         .group_by(AssetLifecycleEvent.asset_id)
#         .subquery()
#     )

#     latest_events = db.query(AssetLifecycleEvent).join(
#         latest_event_subq,
#         (AssetLifecycleEvent.asset_id == latest_event_subq.c.asset_id) &
#         (AssetLifecycleEvent.event_date == latest_event_subq.c.latest_date)
#     ).subquery()

#     pending_repair_requests_count = db.query(func.count(latest_events.c.id)).filter(
#         latest_events.c.user_id == user.id,
#         latest_events.c.event_type == "REPAIR_REQUESTED"
#     ).scalar()

#     return {
#         "assigned_assets_count": assigned_count,
#         "pending_repair_requests_count": pending_repair_requests_count
#     }






@router.get("/assigned-assets-count/{user_id}")
def get_assigned_assets_count(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Count distinct currently assigned assets for the user
    assigned_count = (
        db.query(func.count(distinct(AssetAllocation.asset_id)))
        .filter(
            AssetAllocation.employee_id == user.id,
            AssetAllocation.status == AssetAllocationStatus.ASSIGNED
        )
        .scalar()
    )

    # Latest lifecycle event per asset
    latest_event_subq = (
        db.query(
            AssetLifecycleEvent.asset_id,
            func.max(AssetLifecycleEvent.event_date).label("latest_date")
        )
        .group_by(AssetLifecycleEvent.asset_id)
        .subquery()
    )

    latest_events = (
        db.query(AssetLifecycleEvent)
        .join(
            latest_event_subq,
            (AssetLifecycleEvent.asset_id == latest_event_subq.c.asset_id) &
            (AssetLifecycleEvent.event_date == latest_event_subq.c.latest_date)
        )
        .subquery()
    )

    # Count pending repair requests (latest events) for the user
    pending_repair_requests_count = (
        db.query(func.count(latest_events.c.id))
        .filter(
            latest_events.c.user_id == user.id,
            latest_events.c.event_type == "REPAIR_REQUESTED"
        )
        .scalar()
    )

    return {
        "assigned_assets_count": assigned_count,
        "pending_repair_requests_count": pending_repair_requests_count
    }
