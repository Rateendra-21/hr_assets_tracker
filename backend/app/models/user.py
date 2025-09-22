
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey , Text
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"  
    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    mobile_no = Column(String(20), nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    designation = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    reporting_manager = Column(String(255))
    employee_type = Column(String(50))
    username = Column(String(255))
    password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    working_status = Column(String(50), default="active")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    #--------------
    remarks = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    department = relationship("Department", back_populates="users")
    location = relationship("Location", back_populates="users")





