from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import AdminCreateRequest, LoginRequest, LoginResponse, UserResponse
from passlib.context import CryptContext
from typing import List
router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# login API

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if request.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    user_response = UserResponse.from_orm(user)
    return LoginResponse(user=user_response)


# Create a new admin user API

@router.post("/createadmin", response_model=UserResponse)
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
    role="ADMIN",  # hardcoded here
    is_active=True,
    working_status="active"

    
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return UserResponse.from_orm(new_admin)


# get the admin data 


@router.get("/admin/admindata", response_model=List[UserResponse])
def get_admin_data(db: Session = Depends(get_db)):
    admins = db.query(User).filter(User.role == "ADMIN").all()
    return admins


#deactivate admin user

@router.patch("/admin/deactivate/{employee_id}")
def deactivate_admin(employee_id: str, db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.employee_id == employee_id, User.role == "ADMIN").first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if not admin.is_active:
        raise HTTPException(status_code=400, detail="Admin already inactive")

    admin.is_active = False
    db.commit()
    return {"message": "Admin deactivated successfully"}

#activate admin user

@router.patch("/admin/activate/{employee_id}")
def activate_admin(employee_id: str, db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.employee_id == employee_id, User.role == "ADMIN").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if admin.is_active:
        raise HTTPException(status_code=400, detail="Admin already active")
    admin.is_active = True
    db.commit()
    return {"message": "Admin activated successfully"}





