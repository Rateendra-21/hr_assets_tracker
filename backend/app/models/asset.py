from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid
from typing import Optional

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    model = Column(String, nullable=True)
    serial_number = Column(String, nullable=True, unique=True)
    manufacturer = Column(String, nullable=True)
    specification = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    connectivity_type = Column(String, nullable=True)
    power_source = Column(String, nullable=True)
    color = Column(String, nullable=True)
    power_output = Column(String, nullable=True)
    connector_type = Column(String, nullable=True)
    cable_type = Column(String, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"))
    status = Column(String, default="available")
    qr_id = Column(String, unique=True, nullable=True, default=lambda: str(uuid.uuid4()))
    register_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)
    remarks = Column(String, nullable=True)  # ← Added field

    # relationships
    location = relationship("Location", back_populates="assets")

    

