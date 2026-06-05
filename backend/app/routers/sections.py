from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Section, Compartment, Sensor, SensorReading
from app.schemas import SectionWithCompartments, CompartmentWithSensors, SensorReadingBrief

router = APIRouter()


@router.get("", response_model=list[SectionWithCompartments])
async def get_sections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Section).order_by(Section.seq_no)
    )
    sections = result.scalars().all()

    output = []
    for section in sections:
        comp_result = await db.execute(
            select(Compartment).where(Compartment.section_id == section.id)
        )
        compartments = comp_result.scalars().all()

        comp_list = []
        for comp in compartments:
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

            comp_list.append(CompartmentWithSensors(
                id=comp.id,
                section_id=comp.section_id,
                name=comp.name,
                type=comp.type,
                ventilation_on=comp.ventilation_on,
                pump_on=comp.pump_on,
                entry_blocked=comp.entry_blocked,
                created_at=comp.created_at,
                sensors=sensor_briefs,
            ))

        output.append(SectionWithCompartments(
            id=section.id,
            name=section.name,
            seq_no=section.seq_no,
            description=section.description,
            created_at=section.created_at,
            compartments=comp_list,
        ))

    return output
