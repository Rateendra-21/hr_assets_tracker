
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import csv
import io
import random
import string
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from sqlalchemy.exc import IntegrityError
import secrets, string


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)

# -----------------------------
# GET: Fetch all employees
# -----------------------------
@router.get("/", response_model=List[UserResponse])
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(User).filter(User.employee_type == "employee").all()
    for emp in employees:
        if emp.working_status and emp.working_status.lower() == "inactive":
            emp.is_active = False
    return employees

# -----------------------------
# POST: Upload employees via CSV
# -----------------------------

@router.post("/upload-csv")
def upload_employee_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    employees_added = []
    duplicates = []
    errors = []

    for row in reader:
        try:
            # Auto-generate random password
            password = "".join(random.choices(string.ascii_letters + string.digits, k=8))
            
            user = User(
                fullname=row["fullname"],
                email=row["email"],
                employee_id=row["employee_id"],
                designation=row.get("designation"),
                department_id=row.get("department_id"),
                location_id=row.get("location_id"),
                mobile_no=row.get("mobile_no"),
                reporting_manager=row.get("reporting_manager"),
                username=row["email"],
                password=password,
                is_active=True,
                is_admin=False,
                working_status="active",
                employee_type="employee",
            )

            db.add(user)
            db.commit()
            db.refresh(user)
            employees_added.append(user.email)

        except IntegrityError:
            db.rollback()
            duplicates.append(row["email"])

        except Exception as e:
            db.rollback()
            errors.append({"email": row.get("email"), "error": str(e)})

    return {
        "message": f"Upload finished. {len(employees_added)} added, {len(duplicates)} duplicates, {len(errors)} errors.",
        "added": employees_added,
        "duplicates": duplicates,
        "errors": errors
    }



# ------------------------

from app.models.user import User
from app.schemas.user import UserResponse, EmployeeDeactivateRequest

@router.put("/deactivate", response_model=dict)
def deactivate_employee(request: EmployeeDeactivateRequest, db: Session = Depends(get_db)):
    employee = db.query(User).filter(User.employee_id == request.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.is_active = False
    employee.working_status = "Inactive"
    employee.remarks = request.remarks
    employee.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(employee)

    return {
        "message": f"Employee {employee.fullname} deactivated successfully",
        "employee_id": employee.employee_id,
        "is_active": employee.is_active,
        "working_status": employee.working_status,
        "remarks": employee.remarks,
        "updated_at": employee.updated_at,
    }


#---------------------------------------------
# Create employee using 
#---------------------------------------------
from app.schemas.user import UserResponse, AdminCreateRequest

def generate_password(length: int = 10) -> str:
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(characters) for _ in range(length))

@router.post("/addemployee", response_model=UserResponse)
def create_admin(request: AdminCreateRequest, db: Session = Depends(get_db)):
    # Check duplicates
    existing_user = db.query(User).filter(
        (User.employee_id == request.employee_id) |
        (User.email == request.email) |
        (User.mobile_no == request.mobile_no)
    ).first()

    if existing_user:
        duplicate_fields = []
        if existing_user.employee_id == request.employee_id:
            duplicate_fields.append("employee_id")
        if existing_user.email == request.email:
            duplicate_fields.append("email")
        if existing_user.mobile_no == request.mobile_no:
            duplicate_fields.append("mo" \
            "bile_no")
        raise HTTPException(
            status_code=400,
            detail=f"User with same {', '.join(duplicate_fields)} already exists"
        )

    # Auto-generate password
    auto_password = generate_password(10)

    new_admin = User(
        fullname=request.fullname,
        mobile_no=request.mobile_no,
        email=request.email,
        employee_id=request.employee_id,
        designation=request.designation,
        department_id=request.department_id,
        location_id=request.location_id,
        reporting_manager=request.reporting_manager,
        employee_type= request.employee_type,
        username=request.username,
        password=auto_password,
        is_admin=False,
        is_active=True,
        role="EMPLOYEE",
        working_status="active",
        created_at=datetime.now(),
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    response = UserResponse.from_orm(new_admin)
    return {**response.model_dump(), "password": auto_password}





# -----------------------------
# PUT: Update employee
# -----------------------------
from app.schemas.user import EmployeeUpdateRequest

@router.put("/update/{employee_id}", response_model=dict)
def update_employee(employee_id: str, request: EmployeeUpdateRequest, db: Session = Depends(get_db)):

    # Fetch the employee to update
    employee = db.query(User).filter(User.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check if email is being updated and already exists for another employee
    if request.email:
        existing_email = db.query(User).filter(User.email == request.email, User.employee_id != employee_id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use by another employee")

    # Check if mobile_no is being updated and already exists for another employee
    if request.mobile_no:
        existing_mobile = db.query(User).filter(User.mobile_no == request.mobile_no, User.employee_id != employee_id).first()
        if existing_mobile:
            raise HTTPException(status_code=400, detail="Mobile number already in use by another employee")

    # Update allowed fields
    allowed_fields = [
        "fullname", "mobile_no", "email", "designation",
        "reporting_manager", "department_id", "location_id"
    ]

    for field in allowed_fields:
        new_value = getattr(request, field)
        if new_value is not None:
            setattr(employee, field, new_value)

    employee.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(employee)

    return {
        "message": f"Employee {employee.fullname} updated successfully",
        "employee_id": employee.employee_id,
        "updated_fields": {field: getattr(employee, field) for field in allowed_fields}
    }


from app.schemas.user import UserResponse, EmployeeActivateRequest
@router.put("/activate", response_model=dict)
def activate_employee(request: EmployeeActivateRequest, db: Session = Depends(get_db)):
    employee = db.query(User).filter(User.employee_id == request.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.is_active = True  
    employee.working_status = "Active"
    employee.remarks = None
    employee.updated_at = None

    db.commit()
    db.refresh(employee)

    return {
        "message": f"Employee {employee.fullname} activated successfully",
        "employee_id": employee.employee_id,
        "is_active": employee.is_active,
        "working_status": employee.working_status,
        "remarks": employee.remarks,
        "updated_at": employee.updated_at,
    }