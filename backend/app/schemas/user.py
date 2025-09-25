from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class LoginRequest(BaseModel):
    username: str
    password: str


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
    mobile_no: str
    username: str
    employee_id: str
    designation: str
    reporting_manager: Optional[str] = None
    employee_type: str
    is_active: bool
    is_admin: bool
    working_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    

    department_id: Optional[int] = None
    location_id: Optional[int] = None

 
    department: Optional[DepartmentResponse] = None
    location: Optional[LocationResponse] = None

    class Config:
        from_attributes = True   


class AdminDeactivateRequest(BaseModel):
    employee_id: str


class AdminCreateRequest(BaseModel):
    fullname: str
    mobile_no: str
    email: str
    employee_id: str
    designation: str
    department_id: int   # required
    location_id: int     # required
    reporting_manager: str
    employee_type: str 
    username: str
    password: str
    is_admin: Optional[bool] = False

#---------------

class EmployeeUpdateRequest(BaseModel):
    fullname: str
    mobile_no: Optional[str]
    email: Optional[str]
    designation: Optional[str]
    reporting_manager: Optional[str]
    department_id: Optional[int]
    location_id: Optional[int]


class EmployeeDeactivateRequest(BaseModel):
    employee_id: str
    remarks: Optional[str] = None

class EmployeeActivateRequest(BaseModel):
    employee_id: str
    

class UserResponse(BaseModel):
    id: int
    fullname: str
    email: str
    employee_id: str
    designation: Optional[str] = None
    mobile_no: Optional[str] = None
    reporting_manager: Optional[str] = None
    is_active: bool
    is_admin: bool
    working_status: Optional[str] = None
    remarks: Optional[str] = None
    updated_at: Optional[datetime] = None
    department_id: Optional[int] = None
    location_id: Optional[int] = None
    department: Optional[DepartmentResponse] = None
    location: Optional[LocationResponse] = None
    employee_type: str
    role: str   
    class Config:
        from_attributes = True





    