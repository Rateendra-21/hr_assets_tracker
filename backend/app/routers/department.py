from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.department import Department
from app.schemas.department import DepartmentSchema

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)

@router.get("/", response_model=list[DepartmentSchema])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()
