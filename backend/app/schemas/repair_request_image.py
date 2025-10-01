# app/schemas/repair_request_image.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RepairRequestImageResponse(BaseModel):
    id: int
    filename: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    image_base64: Optional[str] = None
    


    class Config:
        orm_mode = True
