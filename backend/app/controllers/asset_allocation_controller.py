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
    ReturnAssetRequest,
    AllocationActionRequest
)
from app.schemas.repair_requests import EwasteRequest
from pydantic import BaseModel
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.email_config import conf
from sqlalchemy import or_
from app.schemas.asset_allocation import ReturnAssetRequest, ReturnAssetResponse, ApproveReturnRequest, ApproveReturnResponse
from app.email_templates.asset_assigned import build_asset_assignment_email
from app.utils.jwt import create_access_token
from app.utils.auth import get_current_user

router = APIRouter(
    tags=["asset-allocations"]
)


# ---------------------------
# Assign Asset 
# ---------------------------
@router.post("/assignasset", response_model=List[AssetAllocationResponse])
async def bulk_allocate_assets(payload: BulkAssetAllocationRequest, db: Session = Depends(get_db)):
    employee_id = payload.employee_id
    asset_ids = payload.asset_ids
    user_id = payload.user_id  

    if not asset_ids:
        raise HTTPException(status_code=400, detail="No asset IDs provided")

    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    allocations = []

    assigned_time = datetime.now()

    for asset_id in asset_ids:
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            raise HTTPException(status_code=404, detail=f"Asset {asset_id} not found")
        if asset.status == "ALLOCATED":
            raise HTTPException(status_code=400, detail=f"Asset {asset_id} is already assigned")

        asset.status = "ALLOCATED"
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
            remarks=f"Allocated to employee"
        )
        db.add(event)

    db.commit()

   
    formatted_time = assigned_time.strftime("%d-%b-%Y %I:%M %p")

    
    table_rows = ""
    for a in allocations:
        asset = a.asset
        table_rows += f"""
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">{asset.asset_name or "-"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{asset.category or "-"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{asset.manufacturer or "-"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{asset.serial_number or "-"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{asset.model or "-"}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">{formatted_time}</td>
        </tr>
        """

    email_body = build_asset_assignment_email(employee.fullname, table_rows)


    fm = FastMail(conf)
    message = MessageSchema(
        subject="Asset Assigned Notification",
        recipients=[employee.email],
        body=email_body,
        subtype="html"
    )

    await fm.send_message(message)

    return allocations



# ---------------------------
# Assigned Assets Fetch
# ---------------------------
@router.get("/assigned", response_model=List[AssignedAssetResponse])
def get_assigned_assets(db: Session = Depends(get_db)):
    
    allocations = (
        db.query(AssetAllocation)
        .join(Asset, Asset.id == AssetAllocation.asset_id)
        .options(
            joinedload(AssetAllocation.asset),
            joinedload(AssetAllocation.asset).joinedload(Asset.location),
        )
      

      .filter(or_(
    Asset.status == AssetAllocationStatus.ASSIGNED, 
    Asset.status == AssetAllocationStatus.ALLOCATED,
    AssetAllocation.status == AssetAllocationStatus.RETURN_PENDING
))
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



#  Get assigned asset id using employee id
@router.get("/assigned/{employee_id}", response_model=List[AssignedAssetResponse])
def get_assigned_assets_by_employee(employee_id: int, db: Session = Depends(get_db)):
   
    allocations = (
        db.query(AssetAllocation)
        .join(Asset, Asset.id == AssetAllocation.asset_id)
        .options(joinedload(AssetAllocation.asset).joinedload(Asset.location))
        .filter(
            AssetAllocation.employee_id == employee_id,
            or_(
                
                AssetAllocation.status == AssetAllocationStatus.ASSIGNED,
                AssetAllocation.status == AssetAllocationStatus.ALLOCATED
            )
        )
        .all()
    )

    if not allocations:
        return []

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


# ---------------------------
# Allocation Asset
# ---------------------------

@router.patch("/allocation/action")
def allocation_action(payload: AllocationActionRequest, db: Session = Depends(get_db)):
    allocation = db.query(AssetAllocation).filter(AssetAllocation.id == payload.allocation_id).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    asset = db.query(Asset).filter(Asset.id == allocation.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if payload.action.lower() == "accept":
        asset.status = "ASSIGNED"
        allocation.status = AssetAllocationStatus.ASSIGNED

        event = AssetLifecycleEvent(
            asset_id=asset.id,
            event_type=AssetEventType.ACCEPTED,
            user_id=payload.user_id,
            remarks=f"Asset assignment accepted by employee"
        )

    elif payload.action.lower() == "decline":
        asset.status = "AVAILABLE"  # asset is now free
        allocation.status = AssetAllocationStatus.RETURNED  # allocation marked returned

        event = AssetLifecycleEvent(
            asset_id=asset.id,
            event_type=AssetEventType.DECLINED,
            user_id=payload.user_id,
            remarks=payload.remarks or f"Asset assignment declined by employee {allocation.employee_id}"
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'accept' or 'decline'")

    db.add(event)
    db.commit()
    db.refresh(allocation)
    return {"message": f"Asset assignment {payload.action}ed", "allocation": allocation}

#---------------------------
# return the asset 
#---------------------------
@router.post("/return-asset", response_model=ReturnAssetResponse)
def return_asset(request: ReturnAssetRequest, db: Session = Depends(get_db)) -> Any:
    """
    Employee requests to return an asset. Status will be RETURN_PENDING.
    """
    allocation = db.query(AssetAllocation).filter(
        AssetAllocation.id == request.allocation_id,
        AssetAllocation.status == "ASSIGNED"
    ).first()

    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found or not eligible for return")

    # Update allocation status
    allocation.status = "RETURN_PENDING"
    allocation.notes = request.notes
    db.add(allocation)

    # Update asset status to RETURN_PENDING
    asset = db.query(Asset).filter(Asset.id == allocation.asset_id).first()
    if asset:
        asset.status = "RETURN_PENDING"
        db.add(asset)

    # Create lifecycle event
    lifecycle_event = AssetLifecycleEvent(
        asset_id=allocation.asset_id,
        event_type=AssetEventType.RETURN_PENDING,
        event_date=datetime.utcnow(),
        user_id=allocation.employee_id,
        remarks=request.notes
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(allocation)

    return {"message": "Return request submitted", "allocation_id": allocation.id}



# ----------------------
# Admin: Approve/Decline Return Request
# ----------------------

@router.patch("/return-action", response_model=ApproveReturnResponse)
def approve_return(request: ApproveReturnRequest, db: Session = Depends(get_db)) -> Any:
    """
    Admin approves or declines a return request
    """
    allocation = db.query(AssetAllocation).filter(
        AssetAllocation.id == request.allocation_id,
        AssetAllocation.status == "RETURN_PENDING"
    ).first()

    if not allocation:
        raise HTTPException(status_code=404, detail="Return request not found or already processed")

    asset = db.query(Asset).filter(Asset.id == allocation.asset_id).first()

    if request.action not in ["accept", "decline"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    if request.action == "accept":
        allocation.status = "RETURN_ACCEPTED"
        if asset:
            asset.status = "AVAILABLE"
            db.add(asset)
        event_type = AssetEventType.RETURN_ACCEPTED

    else:  # decline
        # Keep both allocation and asset statuses as ASSIGNED
        allocation.status = AssetAllocationStatus.ASSIGNED
        if asset:
            asset.status = "ASSIGNED"
            db.add(asset)
        event_type = AssetEventType.RETURN_DECLINED  # still log as declined in lifecycle

    db.add(allocation)

    # Create lifecycle event
    lifecycle_event = AssetLifecycleEvent(
        asset_id=allocation.asset_id,
        event_type=event_type,
        event_date=datetime.utcnow(),
        user_id=request.user_id,
        remarks=request.remarks
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(allocation)

    return {
        "message": f"Return request {request.action}ed successfully",
        "allocation_id": allocation.id,
        "new_status": allocation.status
    }
