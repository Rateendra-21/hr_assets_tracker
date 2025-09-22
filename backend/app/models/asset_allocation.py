# from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, text
# from app.database import Base
# import enum

# class AllocationStatus(enum.Enum):
#     assigned = "assigned"
#     returned = "returned"

# class AssetAllocation(Base):
#     __tablename__ = "asset_allocations"

#     id = Column(Integer, primary_key=True, index=True, autoincrement=True)
#     asset_id = Column(Integer, nullable=False)
#     employee_id = Column(Integer, nullable=False)
#     allocated_by = Column(String(50), nullable=False)
#     allocation_date = Column(TIMESTAMP, nullable=True, server_default=text("CURRENT_TIMESTAMP"))
#     return_date = Column(TIMESTAMP, nullable=True, default=None)
#     status = Column(Enum(AllocationStatus), nullable=False, server_default="assigned")
#     notes = Column(String(500), nullable=True, default=None)
#     created_at = Column(TIMESTAMP, nullable=True, default=None)
#     updated_at = Column(TIMESTAMP, nullable=True, default=None)

from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.asset import Asset  # import your Asset model
import enum

class AllocationStatus(enum.Enum):
    assigned = "assigned"
    returned = "returned"

class AssetAllocation(Base):
    __tablename__ = "asset_allocations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)  # <-- add ForeignKey
    employee_id = Column(Integer, nullable=False)
    allocated_by = Column(String(50), nullable=False)
    allocation_date = Column(TIMESTAMP, nullable=True, server_default=text("CURRENT_TIMESTAMP"))
    return_date = Column(TIMESTAMP, nullable=True, default=None)
    status = Column(Enum(AllocationStatus), nullable=False, server_default="assigned")
    notes = Column(String(500), nullable=True, default=None)
    created_at = Column(TIMESTAMP, nullable=True, default=None)
    updated_at = Column(TIMESTAMP, nullable=True, default=None)

    # Add relationship to Asset
    asset = relationship("Asset", backref="allocations")


    
