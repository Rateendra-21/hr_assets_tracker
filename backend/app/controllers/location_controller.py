from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.location import Location
from app.schemas.location import LocationSchema

router = APIRouter(
    prefix="/locations",
    tags=["locations"]
)

@router.get("/", response_model=list[LocationSchema])
def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()
