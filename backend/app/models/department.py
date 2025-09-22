

from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    departmentname = Column(String(100), unique=True, nullable=False)

    # Use back_populates="department" to match User model
    users = relationship("User", back_populates="department")


