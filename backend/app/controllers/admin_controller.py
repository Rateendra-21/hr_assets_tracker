from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import secrets, string

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, AdminDeactivateRequest, AdminCreateRequest

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

def generate_password(length: int = 10) -> str:
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(characters) for _ in range(length))

# Get list of admins
@router.get("/admindata", response_model=List[UserResponse])
def get_admin_users(db: Session = Depends(get_db)):
    admin_users = db.query(User).filter(User.is_admin == True).all()
    for user in admin_users:
        user.is_admin = bool(user.is_admin)
    return admin_users

# Deactivate / Activate admin
@router.put("/deactivateadmin", response_model=dict)
def toggle_admin_status(request: AdminDeactivateRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.employee_id == request.employee_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user.employee_type != "admin":
        raise HTTPException(status_code=400, detail="User is not an admin")

    db_user.is_admin = not db_user.is_admin
    db.commit()
    db.refresh(db_user)

    message = "Admin activated successfully" if db_user.is_admin else "Admin deactivated successfully"

    return {
        "message": message,
        "user": UserResponse.from_orm(db_user)
    }



# Create new admin
@router.post("/createadmin", response_model=UserResponse)
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
            duplicate_fields.append("mobile_no")
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
        is_admin=True,
        is_active=True,
        working_status="active",
        created_at=datetime.now(),
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    response = UserResponse.from_orm(new_admin)
    return {**response.model_dump(), "password": auto_password}


