from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session , joinedload
from app.database import get_db
from app.models.repair_requests import RepairRequest
from app.models.asset import Asset
from app.models.asset_lifecycle_event import AssetLifecycleEvent
from app.schemas.repair_requests import RepairRequestCreate, RepairRequestResponse
from datetime import datetime
from typing import List
from app.schemas.repair_requests import RepairRequestWithUserResponse

router = APIRouter(prefix="/repair-requests", tags=["Repair Requests"])

@router.post("/", response_model=RepairRequestResponse)
def create_repair_request(payload: RepairRequestCreate, db: Session = Depends(get_db)):
    
    asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")


    repair_request = RepairRequest(
        asset_id=payload.asset_id,
        requested_by=payload.requested_by,
        issue_description=payload.issue_description,
        status="PENDING",
        request_date=datetime.utcnow()
    )
    db.add(repair_request)

    # Update asset status
    asset.status = "REPAIR_REQUESTED"
    

    # Create asset lifecycle event
    lifecycle_event = AssetLifecycleEvent(
        asset_id=asset.id,
        event_type="REPAIR_REQUESTED",
        remarks=f"Repair requested: {payload.issue_description}",
        user_id=payload.requested_by
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(repair_request)

    return repair_request




# Approve a repair request (Admin)
@router.put("/approve/{request_id}")
def approve_repair_request(request_id: int, approved_by: int, db: Session = Depends(get_db)):
    # 1. Get the repair request
    request = db.query(RepairRequest).filter(RepairRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Repair request not found")

    # 2. Update repair request
    request.status = "APPROVED"
    request.approved_by = approved_by
    request.approved_date = datetime.utcnow()
    
    # 3. Update asset status
    request.asset.status = "UNDER_REPAIR"

    # 4. Create asset lifecycle event for approval
    lifecycle_event = AssetLifecycleEvent(
        asset_id=request.asset.id,
        event_type="REPAIR_APPROVED",
        remarks=f"Repair request approved by user {approved_by}",
        user_id=approved_by,
        event_date=datetime.utcnow()
    )
    db.add(lifecycle_event)

    # 5. Commit changes
    db.commit()
    db.refresh(request)

    return request




@router.get("/pending", response_model=List[RepairRequestWithUserResponse])
def get_pending_repair_requests(db: Session = Depends(get_db)):

    repair_requests = (
        db.query(RepairRequest)
        .options(
            joinedload(RepairRequest.asset),
            joinedload(RepairRequest.requester),
            joinedload(RepairRequest.assigned_user),
            joinedload(RepairRequest.approver),
        )
        .filter(RepairRequest.status == "PENDING")
        .all()
    )

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
        )
        for req in repair_requests
    ]

    return response  # empty list if no records




from app.models.repair_requests import RepairRequest

@router.post("/{request_id}/approve")
def approve_repair_request(request_id: int, db: Session = Depends(get_db), user_id: int = 0):
    # Fetch repair request
    repair_request = db.query(RepairRequest).filter(RepairRequest.id == request_id).first()
    if not repair_request:
        raise HTTPException(status_code=404, detail="Repair request not found")

    # Update repair request status
    repair_request.status = "APPROVED"
    repair_request.approved_by = user_id
    repair_request.approved_date = datetime.utcnow()

    # Update asset status to IN_REPAIR
    asset = db.query(Asset).filter(Asset.id == repair_request.asset_id).first()
    if asset:
        asset.status = "IN_REPAIR"

    # Create lifecycle event
    lifecycle_event = AssetLifecycleEvent(
        asset_id=repair_request.asset_id,
        event_type="IN_REPAIR",
        remarks=f"Repair approved for request {repair_request.id}",
        user_id=user_id
    )
    db.add(lifecycle_event)

    db.commit()
    db.refresh(repair_request)

    return {"message": "Repair request approved successfully", "repair_request_id": repair_request.id}
