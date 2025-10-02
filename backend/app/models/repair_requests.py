from sqlalchemy import Column, Integer, ForeignKey, Text, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class RepairRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    IN_REPAIR = "IN_REPAIR"
    REPAIRED = "REPAIRED"    

class RepairRequest(Base):
    __tablename__ = "repair_requests"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    issue_description = Column(Text, nullable=False)
    status = Column(Enum(RepairRequestStatus), default=RepairRequestStatus.PENDING, nullable=False)
    request_date = Column(DateTime, default=datetime.utcnow)
    approved_date = Column(DateTime, nullable=True)
    resolution_date = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset = relationship("Asset", backref="repair_requests")
    requester = relationship("User", foreign_keys=[requested_by], backref="repair_requests_created")
    assigned_user = relationship("User", foreign_keys=[assigned_to], backref="repair_requests_assigned")
    approver = relationship("User", foreign_keys=[approved_by], backref="repair_requests_approved")
    

    images = relationship(
        "RepairRequestImage",
        back_populates="repair_request",
        cascade="all, delete-orphan"
    )