from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Any
from datetime import datetime
from app.database import get_db
from app.models.asset import Asset
from app.models.asset_allocation import AssetAllocation, AssetAllocationStatus
from app.models.asset_lifecycle_event import AssetLifecycleEvent, AssetEventType
from app.models.user import User
from app.schemas.asset_allocation import (
    BulkAssetAllocationRequest,
    AssetAllocationResponse,
    AssignedAssetResponse,
    ReturnAssetRequest
)
from app.schemas.repair_requests import EwasteRequest
from pydantic import BaseModel
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.email_config import conf

router = APIRouter(
    tags=["asset-allocations"]
)

# class ManualEmailRequest(BaseModel):
#     email: str
#     subject: str = "Notification from Asset Tracker"
#     body: str = "This is a notification email."

# @router.post("/send-manual-email")
# async def send_manual_email(payload: ManualEmailRequest):
#     fm = FastMail(conf)

#     message = MessageSchema(
#         subject=payload.subject,
#         recipients=[payload.email],
#         body=payload.body,
#         subtype="plain"
#     )

#     try:
#         await fm.send_message(message)
#         return {"message": f"Email sent successfully to {payload.email}"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")


@router.post("/assignasset", response_model=List[AssetAllocationResponse])
async def bulk_allocate_assets(payload: BulkAssetAllocationRequest, db: Session = Depends(get_db)):
    """
    Assign multiple assets to a single employee.
    """
    employee_id = payload.employee_id
    asset_ids = payload.asset_ids
    user_id = payload.user_id  

    if not asset_ids:
        raise HTTPException(status_code=400, detail="No asset IDs provided")

    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    allocations = []

    for asset_id in asset_ids:
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
        if asset.status == "ASSIGNED":
            raise HTTPException(status_code=400, detail=f"Asset {asset_id} is already assigned")

        asset.status = "ASSIGNED"
        db.add(asset)

        allocation = AssetAllocation(
            asset_id=asset_id,
            employee_id=employee_id,
            allocated_by=user_id
        )
        db.add(allocation)
        db.flush()
        allocations.append(allocation)

        event = AssetLifecycleEvent(
            asset_id=asset_id,
            event_type=AssetEventType.ALLOCATED,
            user_id=user_id,
            remarks=f"Allocated to employee {employee_id}"
        )
        db.add(event)

    db.commit()

    # Send email notification
    fm = FastMail(conf)
    message = MessageSchema(
        subject="Asset Assigned Notification",
        recipients=[employee.email],
        body=f"Dear {employee.fullname},\n\nYou have been assigned the following asset(s): "
             f"{', '.join(str(a.asset_id) for a in allocations)}.",
        subtype="plain"
    )

    await fm.send_message(message)

    return allocations



# ---------------------------
# Bulk Asset Allocation
# ---------------------------
# @router.post("/assignasset", response_model=List[AssetAllocationResponse])
# def bulk_allocate_assets(payload: BulkAssetAllocationRequest, db: Session = Depends(get_db)):
#     """
#     Assign multiple assets to a single employee.
#     """
#     employee_id = payload.employee_id
#     asset_ids = payload.asset_ids
#     user_id = payload.user_id  

#     if not asset_ids:
#         raise HTTPException(status_code=400, detail="No asset IDs provided")

#     allocations = []

#     for asset_id in asset_ids:
#         asset = db.query(Asset).filter(Asset.id == asset_id).first()
#         if not asset:
#             raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
#         if asset.status == "ASSIGNED":
#             raise HTTPException(status_code=400, detail=f"Asset {asset_id} is already assigned")

#         # Update asset status
#         asset.status = "ASSIGNED"
#         db.add(asset)

#         # Create allocation record
#         allocation = AssetAllocation(
#             asset_id=asset_id,
#             employee_id=employee_id,
#             allocated_by=user_id
#         )
#         db.add(allocation)
#         db.flush()
#         allocations.append(allocation)

#         # Create lifecycle event
#         event = AssetLifecycleEvent(
#             asset_id=asset_id,
#             event_type=AssetEventType.ALLOCATED,
#             user_id=user_id,
#             remarks=f"Allocated to employee {employee_id}"
#         )
#         db.add(event)

#     db.commit()
#     return allocations

# ---------------------------
# Assigned Assets Fetch
# ---------------------------
@router.get("/assigned", response_model=List[AssignedAssetResponse])
def get_assigned_assets(db: Session = Depends(get_db)):
    """
    Get all assigned assets with employee and allocator details
    (only when asset.status == ASSIGNED)
    """
    allocations = (
        db.query(AssetAllocation)
        .join(Asset, Asset.id == AssetAllocation.asset_id)
        .options(
            joinedload(AssetAllocation.asset),
            joinedload(AssetAllocation.asset).joinedload(Asset.location),
        )
        .filter(Asset.status == AssetAllocationStatus.ASSIGNED)  # <-- filter on Asset table
        .all()
    )

    response = []
    for alloc in allocations:
        employee = db.query(User).filter(User.id == alloc.employee_id).first()
        allocator = db.query(User).filter(User.id == alloc.allocated_by).first()

        response.append(
            AssignedAssetResponse(
                allocation_id=alloc.id,
                asset_id=alloc.asset.id,
                asset_name=alloc.asset.asset_name,
                category=alloc.asset.category,
                status=alloc.asset.status.value if hasattr(alloc.asset.status, "value") else alloc.asset.status,
                employee_id=employee.id if employee else alloc.employee_id,
                employee_name=employee.fullname if employee else "-",
                allocated_by=allocator.id if allocator else alloc.allocated_by,
                allocated_by_name=allocator.fullname if allocator else "-",
                allocation_date=alloc.allocation_date,
                designation=employee.designation if employee else None,
                manufacturer=alloc.asset.manufacturer if alloc.asset else None,
            )
        )

    return response


# ---------------------------
# Return Asset
# ---------------------------
@router.post("/return-asset")
def return_asset(request: ReturnAssetRequest, db: Session = Depends(get_db)) -> Any:
    """
    Return an assigned asset and create a lifecycle event
    """
    # Fetch the allocation record
    allocation = db.query(AssetAllocation).filter(
        AssetAllocation.id == request.allocation_id,
        AssetAllocation.status == AssetAllocationStatus.ASSIGNED
    ).first()

    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found or already returned")

    # Update allocation record
    allocation.status = AssetAllocationStatus.RETURNED
    allocation.return_date = datetime.utcnow()
    if request.notes:
        allocation.notes = request.notes

    db.add(allocation)

    # Create lifecycle event for return
    lifecycle_event = AssetLifecycleEvent(
        asset_id=allocation.asset_id,
        event_type=AssetEventType.RETURNED,
        event_date=datetime.utcnow(),
        user_id=allocation.employee_id,  # returning user
        remarks=request.notes
    )
    db.add(lifecycle_event)

    # Update asset status to available
    asset = db.query(Asset).filter(Asset.id == allocation.asset_id).first()
    if asset:
        asset.status = "AVAILABLE"
        db.add(asset)

    db.commit()
    db.refresh(allocation)

    return {"message": "Asset returned successfully", "allocation_id": allocation.id}



@router.get("/assigned/{employee_id}", response_model=List[AssignedAssetResponse])
def get_assigned_assets_by_employee(employee_id: int, db: Session = Depends(get_db)):
   
    allocations = (
        db.query(AssetAllocation)
        .join(Asset, Asset.id == AssetAllocation.asset_id)
        .options(joinedload(AssetAllocation.asset).joinedload(Asset.location))
        .filter(
            AssetAllocation.employee_id == employee_id,
            AssetAllocation.status == AssetAllocationStatus.ASSIGNED  # Only active assigned allocations
        )
        .all()
    )

    if not allocations:
        raise HTTPException(status_code=404, detail="No assigned assets found for this employee")

    response = []
    for alloc in allocations:
        employee = db.query(User).filter(User.id == alloc.employee_id).first()
        allocator = db.query(User).filter(User.id == alloc.allocated_by).first()

        response.append(
            AssignedAssetResponse(
                allocation_id=alloc.id,
                asset_id=alloc.asset.id if alloc.asset else None,
                asset_name=alloc.asset.asset_name if alloc.asset else "-",
                category=alloc.asset.category if alloc.asset else "-",
                status=alloc.asset.status.value if hasattr(alloc.asset.status, "value") else alloc.asset.status,
                employee_id=employee.id if employee else alloc.employee_id,
                employee_name=employee.fullname if employee else "-",
                allocated_by=allocator.id if allocator else alloc.allocated_by,
                allocated_by_name=allocator.fullname if allocator else "-",
                allocation_date=alloc.allocation_date,
                designation=employee.designation if employee else None,
                manufacturer=alloc.asset.manufacturer if alloc.asset else None,
            )
        )

    return response


# ---------------------------
# Mark Asset as E-Waste
# ---------------------------

@router.post("/mark-ewaste")
def mark_asset_as_ewaste(payload: EwasteRequest, db: Session = Depends(get_db)):

    asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.status == "ASSIGNED":  
        raise HTTPException(
            status_code=400,
            detail="Cannot mark asset as E-WASTE while it is assigned",
        )

    asset.status = "EWASTE"  
    db.add(asset)

    lifecycle_event = AssetLifecycleEvent(
        asset_id=asset.id,
        event_type="EWASTE",
        remarks=payload.remarks,
        user_id=payload.user_id,
        event_date=datetime.utcnow()
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(asset)

    return {"message": "Asset marked as E-WASTE successfully", "asset_id": asset.id, "status": asset.status}




