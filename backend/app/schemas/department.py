from pydantic import BaseModel

class DepartmentSchema(BaseModel):
    id: int
    departmentname: str

    class Config:
        orm_mode = True
