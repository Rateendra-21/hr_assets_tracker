from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.asset_lifecycle_event import AssetLifecycleEvent
from app.models.asset import Asset
from app.models.repair_requests import RepairRequest
from app.models.repair_request_images import RepairRequestImage
from app.models.user import User
from app.schemas.repair_requests import (
    RepairRequestCreate,
    RepairRequestResponse,
    RepairRequestWithUserResponse,
)
from app.schemas.repair_request_image import RepairRequestImageResponse
import base64
from app.models.asset_allocation import AssetAllocation
from app.schemas.repair_requests import RepairRequestResponse

from app.models.repair_requests import RepairRequest, RepairRequestStatus

router = APIRouter(prefix="/repair-requests", tags=["Repair Requests"])

# crete reapair request 
@router.post("/")
async def create_repair_request(
    asset_id: int = Form(...),
    requested_by: int = Form(...),
    issue_description: str = Form(...),
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    user = db.query(User).filter(User.id == requested_by).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_role = user.role.value if user.role else "EMPLOYEE"

    if user_role in ["SUPER_ADMIN", "ADMIN"]:
        repair_status = "IN_REPAIR"
        asset_status = "IN_REPAIR"
        event_type = "IN_REPAIR"
    else:
        repair_status = "PENDING"
        asset_status = "REPAIR_REQUESTED"
        event_type = "REPAIR_REQUESTED"

    repair_request = RepairRequest(
        asset_id=asset_id,
        requested_by=requested_by,
        issue_description=issue_description,
        status=repair_status,
        request_date=datetime.utcnow(),
    )
    db.add(repair_request)

    asset.status = asset_status

    # Add lifecycle event
    lifecycle_event = AssetLifecycleEvent(
        asset_id=asset.id,
        event_type=event_type,
        remarks=f"Repair requested: {issue_description}",
        user_id=requested_by,
        event_date=datetime.utcnow()
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(repair_request)

    for image in images:
        image_data = await image.read()
        repair_image = RepairRequestImage(
            repair_request_id=repair_request.id,
            image_data=image_data,
            filename=image.filename,
            uploaded_at=datetime.utcnow(),
        )
        db.add(repair_image)

    db.commit()

    return {
        "id": repair_request.id,
        "asset_id": repair_request.asset_id,
        "requested_by": repair_request.requested_by,
        "issue_description": repair_request.issue_description,
        "status": repair_request.status,
        "request_date": repair_request.request_date,
    }



# Approve a repair request (Admin)
@router.put("/approve/{request_id}", response_model=RepairRequestResponse)
def approve_repair_request(
    request_id: int,
    approved_by: int = Form(..., description="Admin user ID approving the request"),
    vendor_name: str = Form(..., description="Vendor assigned for repair"),
    db: Session = Depends(get_db),
):
    # Fetch repair request
    repair_request = db.query(RepairRequest).filter(RepairRequest.id == request_id).first()
    if not repair_request:
        raise HTTPException(status_code=404, detail="Repair request not found")

    if repair_request.status != RepairRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Repair request is not pending approval")

    # Update repair request status and audit fields
    repair_request.status = RepairRequestStatus.APPROVED
    repair_request.approved_by = approved_by
    repair_request.approved_date = datetime.utcnow()
    repair_request.updated_at = datetime.utcnow()

    # Update asset status to IN_REPAIR
    asset = repair_request.asset
    asset.status = "IN_REPAIR"

    # Update asset allocation status to IN_REPAIR
    asset_allocation = (
        db.query(AssetAllocation)
        .filter(
            AssetAllocation.asset_id == asset.id,
            AssetAllocation.employee_id == repair_request.requested_by
        )
        .first()
    )
    if asset_allocation:
        asset_allocation.status = "IN_REPAIR"
        asset_allocation.updated_at = datetime.utcnow()

    # Log lifecycle event with vendor detail
    lifecycle_event = AssetLifecycleEvent(
        asset_id=asset.id,
        event_type="REPAIR_APPROVED",
        event_date=datetime.utcnow(),
        user_id=approved_by,
        remarks=f"Repair approved and assigned to vendor: {vendor_name}",
        vendor_name=vendor_name,
        created_at=datetime.utcnow()
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(repair_request)

    return repair_request

#get pending repair request
@router.get("/pending", response_model=List[RepairRequestWithUserResponse])
def get_pending_repair_requests(db: Session = Depends(get_db)):
    # Query repair requests and eagerly load related models + images
    repair_requests = (
        db.query(RepairRequest)
        .options(
            joinedload(RepairRequest.asset),
            joinedload(RepairRequest.requester),
            joinedload(RepairRequest.assigned_user),
            joinedload(RepairRequest.approver),
            joinedload(RepairRequest.images),  # ✅ load images
        )
        .filter(RepairRequest.status == "PENDING")
        .all()
    )

    # Map repair requests to response schema including images
    response = [
        RepairRequestWithUserResponse(
            id=req.id,
            asset_id=req.asset.id if req.asset else None,
            requested_by=req.requested_by,
            assigned_to=req.assigned_to,
            approved_by=req.approved_by,
            issue_description=req.issue_description,
            status=req.status,
            request_date=req.request_date,
            approved_date=req.approved_date,
            resolution_date=req.resolution_date,
            resolution_notes=req.resolution_notes,
            created_at=req.created_at,
            updated_at=req.updated_at,
            requested_user=req.requester,
            assigned_user=req.assigned_user,
            approved_user=req.approver,
            images=[
                RepairRequestImageResponse(
                    id=img.id,
                    filename=img.filename,
                    uploaded_at=img.uploaded_at,
                    image_base64=base64.b64encode(img.image_data).decode('utf-8') if img.image_data else None

                )
                for img in req.images
            ],
        )
        for req in repair_requests
    ]

    return response



# reject the repair request 

@router.put("/reject/{request_id}", response_model=RepairRequestResponse)
def reject_repair_request(
    request_id: int,
    rejected_by: int = Form(..., description="Admin user ID rejecting the request"),
    remark: str = Form(..., description="Remark for rejection"),
    db: Session = Depends(get_db),
):
    # Fetch repair request
    repair_request = db.query(RepairRequest).filter(RepairRequest.id == request_id).first()
    if not repair_request:
        raise HTTPException(status_code=404, detail="Repair request not found")

    if repair_request.status != RepairRequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Repair request is not pending approval")

    # Update repair request status, audit fields, and resolution notes/date
    repair_request.status = RepairRequestStatus.REJECTED
    repair_request.approved_by = rejected_by  # or rejected_by field if different
    repair_request.approved_date = datetime.utcnow()  # or use rejection date field
    repair_request.resolution_notes = remark
    repair_request.resolution_date = datetime.utcnow()
    repair_request.updated_at = datetime.utcnow()

    # Update asset status to ASSIGNED
    asset = repair_request.asset
    asset.status = "ASSIGNED"

    # Update asset allocation status to ASSIGNED
    asset_allocation = (
        db.query(AssetAllocation)
        .filter(
            AssetAllocation.asset_id == asset.id,
            AssetAllocation.employee_id == repair_request.requested_by
        )
        .first()
    )
    if asset_allocation:
        asset_allocation.status = "ASSIGNED"
        asset_allocation.updated_at = datetime.utcnow()

    # Log lifecycle event with rejection detail
    lifecycle_event = AssetLifecycleEvent(
        asset_id=asset.id,
        event_type="REJECTED",
        event_date=datetime.utcnow(),
        user_id=rejected_by,
        remarks=remark,
        created_at=datetime.utcnow()
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(repair_request)

    return repair_request

