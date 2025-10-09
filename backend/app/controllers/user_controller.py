from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import AdminCreateRequest, LoginRequest, LoginResponse, UserResponse
from passlib.context import CryptContext
from typing import List
import secrets
import string
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
from fastapi_mail import FastMail, MessageSchema
from app.email_config import conf
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel
from app.utils.jwt import create_access_token
from app.utils.auth import get_current_user
from sqlalchemy import or_

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# login API
@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        or_(
            User.email.ilike(request.username),
            User.mobile_no.ilike(request.username)
        )
    ).first()

    if not user:
        print("No user found for:", request.username)
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    print("User found:", user.username)
    print("Request password:", request.password)
    print("DB hash:", user.password)

    if not pwd_context.verify(request.password, user.password):
        print("Password verification failed")
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = create_access_token(user_id=user.id, role=user.role)
    user_response = UserResponse.from_orm(user)

    return LoginResponse(user=user_response, access_token=token, token_type="bearer")



# Create a new admin user API with hased password
async def send_password_email(email: str, raw_password: str):
    message = MessageSchema(
        subject="Hr Asset Tracker Account Password",
        recipients=[email],
        body=(
            f"Hello,\n\n"
            f"Your admin account has been created.\n"
            f"Your Username : {email} & temporary password is: {raw_password}\n\n"
            f"Please login and change your password immediately for security purposes.\n\n"
            f"Thank you."
        ),
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)

def generate_password(length: int = 12) -> str:
    max_length = min(length, 72)  # bcrypt password length limit
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(max_length))

@router.post("/createadmin", response_model=UserResponse)
async def create_admin(request: AdminCreateRequest, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
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
    print(f"[DEBUG] Generated password: '{raw_password}' Length: {len(raw_password)}")

    # Hash the raw password with UTF-8 encoding and truncate at 72 bytes (bcrypt limit)
    hashed_password = pwd_context.hash(raw_password.encode("utf-8")[:72])

    new_admin = User(
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
        role="ADMIN",
        is_active=True,
        working_status="active"
    )

    try:
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    await send_password_email(request.email, raw_password)

    response_data = UserResponse.from_orm(new_admin).dict()
    response_data["raw_password"] = raw_password  

    return response_data

# get the admin data 
@router.get("/admin/admindata", response_model=List[UserResponse])
def get_admin_data(db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    admins = db.query(User).filter(User.role == "ADMIN").all()
    return admins

#deactivate admin user
@router.patch("/admin/deactivate/{employee_id}")
def deactivate_admin(employee_id: str, db: Session = Depends(get_db),current_user: User = Depends(get_current_user) ):
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
def activate_admin(employee_id: str, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    admin = db.query(User).filter(User.employee_id == employee_id, User.role == "ADMIN").first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    if admin.is_active:
        raise HTTPException(status_code=400, detail="Admin already active")
    admin.is_active = True
    db.commit()
    return {"message": "Admin activated successfully"}


#Change password
class ChangePasswordRequest(BaseModel):
    userid: int          
    old_password: str
    new_password: str

@router.post("/change-password")
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db),current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == request.userid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_context.verify(request.old_password, user.password):
        raise HTTPException(status_code=401, detail="Old password is incorrect")

    user.password = pwd_context.hash(request.new_password.encode("utf-8")[:72])
    db.commit()
    db.refresh(user)

    return {"message": "Password changed successfully"}


#forgot password

