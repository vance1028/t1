import uuid
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import InspectionOrder, CheckinRecord, HazardReport
from app.schemas import (
    InspectionOrderOut,
    InspectionOrderCreate,
    InspectionStatusUpdate,
    CheckinCreate,
    CheckinOut,
    HazardCreate,
    HazardOut,
)

router = APIRouter()


@router.get("", response_model=list[InspectionOrderOut])
async def get_inspections(
    status: Optional[str] = None,
    inspector_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(InspectionOrder).order_by(InspectionOrder.created_at.desc())

    if status:
        query = query.where(InspectionOrder.status == status)
    if inspector_id:
        query = query.where(InspectionOrder.inspector_id == inspector_id)

    result = await db.execute(query)
    orders = result.scalars().all()
    return orders


@router.post("", response_model=InspectionOrderOut, status_code=201)
async def create_inspection(
    body: InspectionOrderCreate,
    db: AsyncSession = Depends(get_db),
):
    if body.scheduled_start and body.scheduled_end:
        for cid in body.compartment_ids:
            conflict_result = await db.execute(
                select(InspectionOrder).where(
                    and_(
                        InspectionOrder.compartment_ids.contains([cid]),
                        InspectionOrder.status.in_(["pending", "in_progress"]),
                        InspectionOrder.scheduled_start < body.scheduled_end,
                        InspectionOrder.scheduled_end > body.scheduled_start,
                    )
                )
            )
            conflict = conflict_result.scalars().first()
            if conflict:
                raise HTTPException(
                    status_code=409,
                    detail=f"舱室{cid}在指定时间段内已有未完成的巡检工单",
                )

    order = InspectionOrder(
        id=str(uuid.uuid4()),
        inspector_id=body.inspector_id,
        compartment_ids=body.compartment_ids,
        check_items=body.check_items,
        status="pending",
        scheduled_start=body.scheduled_start,
        scheduled_end=body.scheduled_end,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.put("/{order_id}/status", response_model=InspectionOrderOut)
@router.patch("/{order_id}/status", response_model=InspectionOrderOut)
async def update_inspection_status(
    order_id: str,
    body: InspectionStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    if body.status not in ("pending", "in_progress", "completed", "cancelled"):
        raise HTTPException(status_code=400, detail="无效状态值")

    result = await db.execute(
        select(InspectionOrder).where(InspectionOrder.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="巡检工单不存在")

    order.status = body.status
    await db.commit()
    await db.refresh(order)
    return order


@router.post("/{order_id}/checkin", response_model=CheckinOut, status_code=201)
async def create_checkin(
    order_id: str,
    body: CheckinCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InspectionOrder).where(InspectionOrder.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="巡检工单不存在")

    record = CheckinRecord(
        id=str(uuid.uuid4()),
        order_id=order_id,
        inspector_id=body.inspector_id,
        compartment_id=body.compartment_id,
        note=body.note,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.post("/{order_id}/hazard", response_model=HazardOut, status_code=201)
async def create_hazard(
    order_id: str,
    body: HazardCreate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InspectionOrder).where(InspectionOrder.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="巡检工单不存在")

    report = HazardReport(
        id=str(uuid.uuid4()),
        order_id=order_id,
        reporter_id=body.reporter_id,
        compartment_id=body.compartment_id,
        description=body.description,
        severity=body.severity or "medium",
        status="open",
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report
