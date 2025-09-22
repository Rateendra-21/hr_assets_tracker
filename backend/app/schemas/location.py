from pydantic import BaseModel

class LocationSchema(BaseModel):
    id: int
    locationname: str

    class Config:
        orm_mode = True
