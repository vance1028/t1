from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import InterlockLog
from app.schemas import InterlockLogOut

router = APIRouter()


@router.get("", response_model=list[InterlockLogOut])
async def get_interlock_logs(
    compartment_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(InterlockLog).order_by(InterlockLog.created_at.desc())

    if compartment_id:
        query = query.where(InterlockLog.compartment_id == compartment_id)

    result = await db.execute(query)
    logs = result.scalars().all()
    return logs
