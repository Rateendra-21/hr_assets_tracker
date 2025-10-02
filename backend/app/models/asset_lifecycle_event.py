from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Text, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from enum import Enum as PyEnum

class AssetEventType(PyEnum):
    REGISTERED = "REGISTERED"
    ALLOCATED = "ALLOCATED"
    REPAIR_REQUESTED = "REPAIR_REQUESTED"
    REPAIR_APPROVED = "REPAIR_APPROVED"
    REPAIR_COMPLETED = "REPAIR_COMPLETED"
    RETURNED = "RETURNED"
    EWASTE = "EWASTE"
    ACCEPTED = "ACCEPTED"   # new status for acceptance
    DECLINED = "DECLINED" 
    REJECTED ="REJECTED"
    RETURN_PENDING = "RETURN_PENDING"
    RETURN_ACCEPTED = "RETURN_ACCEPTED"
    RETURN_DECLINED = "RETURN_DECLINED"
    REPAIRED = "REPAIRED"

class AssetLifecycleEvent(Base):
    __tablename__ = "asset_lifecycle_events"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    event_type = Column(Enum(AssetEventType), nullable=False)
    event_date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    vendor_name = Column(String(100), nullable=True)

    asset = relationship("Asset")
    user = relationship("User")

       # ✅ relationships
    asset = relationship("Asset", back_populates="lifecycle_events")
    user = relationship("User", back_populates="lifecycle_events")