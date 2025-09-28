from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum ,String
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class AssetAllocationStatus(str, enum.Enum):
    ASSIGNED = "ASSIGNED"
    RETURNED = "RETURNED"

class AssetAllocation(Base):
    __tablename__ = "asset_allocations"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    employee_id = Column(Integer, nullable=False)
    allocated_by = Column(Integer, nullable=False)
    allocation_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    status = Column(Enum(AssetAllocationStatus), default=AssetAllocationStatus.ASSIGNED)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", backref="allocations")
