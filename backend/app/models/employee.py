from sqlalchemy import Column, Integer, String, Boolean, DateTime, func , Text
from app.database import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from datetime import datetime

class Employee(Base):
    __tablename__ = "users"  

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=False)
    designation = Column(String(100))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    mobile_no = Column(String(20))
    reporting_manager = Column(String(255))
    username = Column(String(255), unique=True)
    password = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    working_status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    remarks = Column(String(255))
    employee_type = Column(String(50), default="employee")


   

    department = relationship("Department", back_populates="users")
    location = relationship("Location", back_populates="users")




