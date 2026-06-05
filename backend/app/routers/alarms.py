from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Alarm
from app.schemas import AlarmOut, AlarmAcknowledge

router = APIRouter()


@router.get("", response_model=list[AlarmOut])
async def get_alarms(
    level: Optional[int] = None,
    compartment_id: Optional[str] = None,
    acknowledged: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Alarm).order_by(Alarm.created_at.desc())

    if level is not None:
        query = query.where(Alarm.alarm_level == level)
    if compartment_id is not None:
        query = query.where(Alarm.compartment_id == compartment_id)
    if acknowledged is not None:
        query = query.where(Alarm.acknowledged == acknowledged)

    result = await db.execute(query)
    alarms = result.scalars().all()
    return alarms


@router.put("/{alarm_id}/acknowledge", response_model=AlarmOut)
async def acknowledge_alarm(
    alarm_id: str,
    body: AlarmAcknowledge,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Alarm).where(Alarm.id == alarm_id)
    )
    alarm = result.scalars().first()
    if not alarm:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="告警不存在")

    alarm.acknowledged = body.acknowledged
    await db.commit()
    await db.refresh(alarm)
    return alarm
