from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends 
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import AdminCreateRequest, UserResponse 
from typing import List
import csv
import io
from passlib.context import CryptContext
from app.email_config import conf
import secrets
import string
from fastapi_mail import FastMail, MessageSchema
from app.schemas.user import EmployeeUpdateRequest
from datetime import datetime
from app.schemas.user import UserResponse, EmployeeDeactivateRequest
from app.schemas.user import UserResponse, EmployeeActivateRequest

from app.utils.jwt import create_access_token
from app.utils.auth import get_current_user

router = APIRouter(prefix="/employees", tags=["Employees"])

# create emoployee by manula 

async def send_password_email(email: str, raw_password: str):
    message = MessageSchema(
        subject="Hr Asset Tracker Account Password",
        recipients=[email],
        body=(
            f"Hello,\n\n"
            f"Your account has been created on Hr Asset Tracker portal.\n"
            f"Your temporary password is: {raw_password}\n\n"
            f"Please login and change your password immediately for security purposes.\n\n"
            f"Thank you."
        ),
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def generate_password(length: int = 12) -> str:
    max_length = min(length, 72)  # bcrypt password length limit
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(max_length))

@router.post("/createemployee", response_model=UserResponse)
async def create_employee(request: AdminCreateRequest, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    # 1. Check if user exists
    existing_user = db.query(User).filter(
        (User.email == request.email) |
        (User.mobile_no == request.mobile_no) |
        (User.employee_id == request.employee_id)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with given email, mobile number, or employee ID already exists."
        )
    
   
    raw_password = generate_password() 
    hashed_password = pwd_context.hash(raw_password.encode("utf-8")[:72])


    new_employee = User(
        fullname=request.fullname,
        mobile_no=request.mobile_no,
        email=request.email,
        username=request.username,
        password=hashed_password,
        employee_id=request.employee_id,
        designation=request.designation,
        reporting_manager=request.reporting_manager,
        employee_type=request.employee_type,
        department_id=request.department_id,
        location_id=request.location_id,
        role="EMPLOYEE",
        is_active=True,
        working_status="active"
    )

    # 4. Save to database
    try:
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # 5. Send password to employee via email
    await send_password_email(request.email, raw_password)

    # 6. Return response (optional: include raw password)
    response_data = UserResponse.from_orm(new_employee).dict()
    response_data["raw_password"] = raw_password
    return response_data


# get all employee
@router.get("/getemployee", response_model=List[UserResponse])
def get_admin_data(db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    admins = db.query(User).filter(User.role == "EMPLOYEE").all()
    return admins


# create employee by using csv file upload
@router.post("/upload-csv")
async def upload_employee_csv(file: UploadFile = File(...), db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    duplicates = []
    errors = []
    created_employees = []

    required_fields = [
        "fullname", "mobile_no", "email", "employee_id", "designation",
        "reporting_manager", "employee_type", "department_id", "location_id"
    ]

    for row in reader:
        if not all(field in row for field in required_fields):
            errors.append({"error": "Missing required fields in CSV", "row": row})
            continue

        existing_user = db.query(User).filter(
            (User.email == row["email"]) |
            (User.mobile_no == row["mobile_no"]) |
            (User.employee_id == row["employee_id"])
        ).first()
        if existing_user:
            duplicates.append(row["email"])
            continue

        # 1. Generate password (you can use random or fullname+employee_id)
        raw_password = f"{row['fullname']}{row['employee_id']}"
        hashed_password = pwd_context.hash(raw_password.encode("utf-8")[:72])

        try:
            new_emp = User(
                fullname=row["fullname"],
                mobile_no=row["mobile_no"],
                email=row["email"],
                username=row["email"],  
                password=hashed_password,  # store hashed password
                employee_id=row["employee_id"],
                designation=row["designation"],
                reporting_manager=row["reporting_manager"],
                employee_type=row["employee_type"],
                department_id=int(row["department_id"]) if row["department_id"] else None,
                location_id=int(row["location_id"]) if row["location_id"] else None,
                role="EMPLOYEE",
                is_active=True,
                working_status="active"
            )
            db.add(new_emp)
            db.commit()
            db.refresh(new_emp)

            # 2. Send password to employee
            await send_password_email(row["email"], raw_password)

            created_employees.append(new_emp)
        except Exception as e:
            db.rollback()
            errors.append({"email": row.get("email", "unknown"), "error": str(e)})

    return {
        "message": f"Processed CSV. {len(created_employees)} employees created.",
        "duplicates": duplicates,
        "errors": errors,
    }



#uodate employee by id
@router.put("/update/{employee_id}", response_model=dict)
def update_employee(employee_id: str, request: EmployeeUpdateRequest, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):

    employee = db.query(User).filter(User.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if request.email:
        existing_email = db.query(User).filter(User.email == request.email, User.employee_id != employee_id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use by another employee")

    if request.mobile_no:
        existing_mobile = db.query(User).filter(User.mobile_no == request.mobile_no, User.employee_id != employee_id).first()
        if existing_mobile:
            raise HTTPException(status_code=400, detail="Mobile number already in use by another employee")


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


# Employee Deactivate
@router.put("/deactivate", response_model=dict)
def deactivate_employee(request: EmployeeDeactivateRequest, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
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


# employee Activate

@router.put("/activate", response_model=dict)
def activate_employee(request: EmployeeActivateRequest, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
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