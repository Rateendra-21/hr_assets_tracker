from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, UserResponse

router = APIRouter()


@router.post("/login", response_model=UserResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == request.username).first()

    if not db_user or db_user.password != request.password:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    if not db_user.is_active:
        raise HTTPException(status_code=403, detail="User is not active")
    return db_user


