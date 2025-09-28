from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"


class DepartmentResponse(BaseModel):
    id: int
    departmentname: str

    class Config:
        from_attributes = True


class LocationResponse(BaseModel):
    id: int
    locationname: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    fullname: str
    email: str
    mobile_no: Optional[str] = None
    username: str
    employee_id: str
    designation: Optional[str] = None
    reporting_manager: Optional[str] = None
    employee_type: str
    is_active: bool
    working_status: Optional[str] = None
    remarks: Optional[str] = None
    department_id: Optional[int] = None
    location_id: Optional[int] = None
    role: UserRole
    created_at: datetime
    updated_at: Optional[datetime] = None
    department: Optional[DepartmentResponse] = None
    location: Optional[LocationResponse] = None

    model_config = {
        "from_attributes": True  
    }


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    user: UserResponse
    message: str = "Login successful"


class EmployeeDeactivateRequest(BaseModel):
    employee_id: str
    remarks: Optional[str] = None


class AdminCreateRequest(BaseModel):
    fullname: str
    mobile_no: Optional[str] = None
    email: str
    employee_id: str
    designation: str
    department_id: int
    location_id: int
    reporting_manager: Optional[str] = None
    employee_type: str
    username: str
    password: Optional[str] = None
    is_admin: Optional[bool] = False
    role: Optional[str] = "ADMIN"


class AdminDeactivateRequest(BaseModel):
    employee_id: str
    remarks: Optional[str] = None
    
class EmployeeUpdateRequest(BaseModel):
    fullname: str
    mobile_no: Optional[str]
    email: Optional[str]
    designation: Optional[str]
    reporting_manager: Optional[str]
    department_id: Optional[int]
    location_id: Optional[int]


class AdminCreateResponse(BaseModel):
    user: UserResponse
    password: str

    class Config:
        from_attributes = True

