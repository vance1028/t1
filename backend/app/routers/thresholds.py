from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import ThresholdConfig
from app.schemas import ThresholdConfigOut, ThresholdConfigUpdate

router = APIRouter()


@router.get("", response_model=list[ThresholdConfigOut])
async def get_thresholds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThresholdConfig))
    configs = result.scalars().all()
    return configs


@router.put("/{threshold_id}", response_model=ThresholdConfigOut)
async def update_threshold(
    threshold_id: str,
    body: ThresholdConfigUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ThresholdConfig).where(ThresholdConfig.id == threshold_id)
    )
    config = result.scalars().first()
    if not config:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="阈值配置不存在")

    if body.level1_value is not None:
        config.level1_value = body.level1_value
    if body.level2_value is not None:
        config.level2_value = body.level2_value

    await db.commit()
    await db.refresh(config)
    return config
