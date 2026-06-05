import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Compartment, InterlockLog


class InterlockExecutor:
    async def execute(
        self,
        compartment_id: str,
        trigger_type: str,
        trigger_value: float,
        db: AsyncSession,
    ) -> InterlockLog:
        result = await db.execute(
            select(Compartment).where(Compartment.id == compartment_id)
        )
        compartment = result.scalars().first()

        if trigger_type == "gas_level2":
            compartment.ventilation_on = True
            compartment.entry_blocked = True
            action = "联动启动排风+禁止人员进入"
        elif trigger_type == "water_level_level2":
            compartment.pump_on = True
            action = "联动启动排水泵"
        else:
            action = f"未知联动触发: {trigger_type}"

        log = InterlockLog(
            id=str(uuid.uuid4()),
            compartment_id=compartment_id,
            trigger_type=trigger_type,
            trigger_value=trigger_value,
            action=action,
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log
