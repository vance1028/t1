from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Compartment, Section, Sensor, SensorReading
from app.schemas import CompartmentWithSensors, SensorReadingBrief

router = APIRouter()


async def _build_compartment_with_sensors(comp: Compartment, db: AsyncSession) -> CompartmentWithSensors:
    sensor_result = await db.execute(
        select(Sensor).where(Sensor.compartment_id == comp.id)
    )
    sensors = sensor_result.scalars().all()

    sensor_briefs = []
    for sensor in sensors:
        reading_result = await db.execute(
            select(SensorReading)
            .where(SensorReading.sensor_id == sensor.id)
            .order_by(SensorReading.timestamp.desc())
            .limit(1)
        )
        latest = reading_result.scalars().first()
        sensor_briefs.append(SensorReadingBrief(
            sensor_id=sensor.id,
            sensor_type=sensor.sensor_type,
            unit=sensor.unit,
            value=latest.value if latest else None,
            str_value=latest.str_value if latest else None,
            timestamp=latest.timestamp if latest else None,
        ))

    return CompartmentWithSensors(
        id=comp.id,
        section_id=comp.section_id,
        name=comp.name,
        type=comp.type,
        ventilation_on=comp.ventilation_on,
        pump_on=comp.pump_on,
        entry_blocked=comp.entry_blocked,
        created_at=comp.created_at,
        sensors=sensor_briefs,
    )


@router.get("", response_model=list[CompartmentWithSensors])
async def get_compartments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Compartment))
    compartments = result.scalars().all()

    output = []
    for comp in compartments:
        comp_ws = await _build_compartment_with_sensors(comp, db)
        output.append(comp_ws)
    return output


@router.get("/{compartment_id}/sensors", response_model=CompartmentWithSensors)
async def get_compartment_sensors(compartment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Compartment).where(Compartment.id == compartment_id)
    )
    comp = result.scalars().first()
    if not comp:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="舱室不存在")
    return await _build_compartment_with_sensors(comp, db)
