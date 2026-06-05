from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Inspector
from app.schemas import InspectorOut

router = APIRouter()


@router.get("", response_model=list[InspectorOut])
async def get_inspectors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inspector))
    inspectors = result.scalars().all()
    return inspectors
