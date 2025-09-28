from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid
from typing import Optional

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=True)
    model = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True)
    manufacturer = Column(String(100), nullable=True)
    specification = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    connectivity_type = Column(String(50), nullable=True)
    power_source = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    power_output = Column(String(50), nullable=True)
    connector_type = Column(String(50), nullable=True)
    cable_type = Column(String(50), nullable=True)
    status = Column(String(50), nullable=True, default="available")
    qr_id = Column(String(100), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    register_date = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    location = relationship("Location", back_populates="assets")
    lifecycle_events = relationship("AssetLifecycle", back_populates="asset")
    current_allocation = relationship("AssetAllocation", back_populates="asset", uselist=False)

