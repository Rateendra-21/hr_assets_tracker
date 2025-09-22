from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    locationname = Column(String(100), unique=True, nullable=False)

    # Use back_populates="location" to match User model
    users = relationship("User", back_populates="location")

    #---------------------------------------
    assets = relationship("Asset", back_populates="location")