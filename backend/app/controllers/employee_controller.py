from fastapi import APIRouter, Depends, HTTPException, status
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import AdminCreateRequest, UserResponse 
from typing import List
import csv
import io

router = APIRouter(prefix="/employees", tags=["Employees"])

# create emoployee by manula 
@router.post("/createemployee", response_model=UserResponse)
def create_admin(request: AdminCreateRequest, db: Session = Depends(get_db)):
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
    
 
    raw_password = f"{request.fullname}{request.employee_id}"
    
    
    new_admin = User(
        fullname=request.fullname,
      mobile_no=request.mobile_no,
    email=request.email,
    username=request.username,
    password=raw_password,
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
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return UserResponse.from_orm(new_admin)

# get all employee
@router.get("/getemployee", response_model=List[UserResponse])
def get_admin_data(db: Session = Depends(get_db)):
    admins = db.query(User).filter(User.role == "EMPLOYEE").all()
    return admins

# create employee by using csv file upload

@router.post("/upload-csv")
async def upload_employee_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
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

        raw_password = f"{row['fullname']}{row['employee_id']}"

        try:
            new_emp = User(
                fullname=row["fullname"],
                mobile_no=row["mobile_no"],
                email=row["email"],
                username=row["email"],  # Set username as email automatically
                password=raw_password,  # Ideally hash this in real apps
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
