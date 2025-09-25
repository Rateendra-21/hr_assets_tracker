from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class AssetStatus(enum.Enum):
    AVAILABLE = "available"
    ASSIGNED = "assigned"
    UNDER_REPAIR = "under_repair"
    RETURNED = "returned"
    DISPOSED = "disposed"
    E_WASTE = "e_waste"

class RepairStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"

class AssetLifecycle(Base):
    __tablename__ = "asset_lifecycle"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null when unassigned
    
    # Status tracking
    previous_status = Column(Enum(AssetStatus), nullable=True)
    current_status = Column(Enum(AssetStatus), default=AssetStatus.AVAILABLE, nullable=False)
    
    # Timestamps for lifecycle events
    assigned_date = Column(DateTime, nullable=True)
    return_date = Column(DateTime, nullable=True)
    repair_date = Column(DateTime, nullable=True)
    disposal_date = Column(DateTime, nullable=True)
    
    # Additional information
    notes = Column(Text, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", back_populates="lifecycle_events")
    user = relationship("User", foreign_keys=[user_id])
    admin = relationship("User", foreign_keys=[updated_by])

class RepairRequest(Base):
    __tablename__ = "repair_requests"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    issue_description = Column(Text, nullable=False)
    status = Column(Enum(RepairStatus), default=RepairStatus.PENDING, nullable=False)
    
    request_date = Column(DateTime, default=datetime.utcnow)
    resolution_date = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset = relationship("Asset")
    requester = relationship("User", foreign_keys=[requested_by])
    technician = relationship("User", foreign_keys=[assigned_to])