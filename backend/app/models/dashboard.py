from sqlalchemy.orm import Session
from models import User, Asset, AssetAllocation, RepairRequest

class DashboardModel:
    @staticmethod
    def get_counts(db: Session):
        # Active employees with role EMPLOYEE
        active_employees = db.query(User).filter(
            User.is_active == 1,
            User.working_status == 'active',
            User.role == 'EMPLOYEE'
        ).count()

        total_assets = db.query(Asset).count()

        allocated_assets = db.query(AssetAllocation).filter(
            AssetAllocation.status == 'ASSIGNED'
        ).count()

        pending_repair_requests = db.query(RepairRequest).filter(
            RepairRequest.status == 'PENDING'
        ).count()

        return {
            "active_employees": active_employees,
            "total_assets": total_assets,
            "allocated_assets": allocated_assets,
            "pending_repair_requests": pending_repair_requests
        }
