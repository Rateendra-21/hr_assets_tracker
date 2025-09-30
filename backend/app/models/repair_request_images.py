from sqlalchemy import Column, Integer, ForeignKey, LargeBinary, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class RepairRequestImage(Base):
    __tablename__ = "repair_request_images"

    id = Column(Integer, primary_key=True, index=True)
    repair_request_id = Column(Integer, ForeignKey("repair_requests.id"), nullable=False)
    image_data = Column(LargeBinary, nullable=False)
    filename = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    repair_request = relationship("RepairRequest", back_populates="images")
