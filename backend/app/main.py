from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers import (
    user_controller,
    department_controller,
    location_controller,
    employee_controller,
    asset_controller,
    asset_allocation_controller,
    repair_request_controller
)


app = FastAPI(
    title="HR Assets Tracker API",
    description="Backend API for HR Assets Tracker Project",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"]
)
# Include routers
# app.include_router(admin_controller.router, prefix="/admin")
app.include_router(user_controller.router, tags=["user"])
app.include_router(employee_controller.router)
app.include_router(department_controller.router)
app.include_router(location_controller.router)
app.include_router(asset_controller.router)
app.include_router(asset_allocation_controller.router)
app.include_router(repair_request_controller.router)
# app.include_router(asset_lifecycle_controller.router, tags=["lifecycle"])




