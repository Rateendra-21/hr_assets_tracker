from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    fullname: str
    email: EmailStr
    employee_id: str
    designation: Optional[str] = None
    department_id: Optional[int] = None
    location_id: Optional[int] = None
    mobile_no: Optional[str] = None
    reporting_manager: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass  # For POST request validation

class EmployeeResponse(EmployeeBase):
    id: int
    username: str
    is_active: bool
    is_admin: bool
    working_status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
   

    class Config:
        orm_mode = True

# ------------------


