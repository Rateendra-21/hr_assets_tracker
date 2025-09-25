from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.asset_lifecycle import AssetStatus
import enum
from datetime import datetime

class AllocationStatus(enum.Enum):
    ASSIGNED = "assigned"
    RETURNED = "returned"

class AssetAllocation(Base):
    __tablename__ = "asset_allocations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)  
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allocated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    allocation_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    status = Column(Enum(AllocationStatus), default=AllocationStatus.ASSIGNED)
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", back_populates="current_allocation")
    employee = relationship("User", foreign_keys=[employee_id])
    admin = relationship("User", foreign_keys=[allocated_by])
    


    
