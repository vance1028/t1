import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ThresholdConfig, Alarm, Compartment


class AlarmEngine:
    def __init__(self):
        self.thresholds: dict[str, dict] = {}

    async def load_from_db(self, db: AsyncSession):
        result = await db.execute(select(ThresholdConfig))
        configs = result.scalars().all()
        self.thresholds = {
            c.sensor_type: {
                "id": c.id,
                "level1_value": c.level1_value,
                "level2_value": c.level2_value,
                "direction": c.direction,
            }
            for c in configs
        }

    def _exceeds(self, value: float, threshold: float, direction: str) -> bool:
        if direction == "above":
            return value > threshold
        else:
            return value < threshold

    async def evaluate(
        self, readings: list[dict], db: AsyncSession
    ) -> tuple[list[Alarm], list[dict]]:
        new_alarms: list[Alarm] = []
        interlock_triggers: list[dict] = []

        for reading in readings:
            if reading["value"] is None:
                continue

            sensor_type = reading["sensor_type"]
            threshold = self.thresholds.get(sensor_type)
            if not threshold:
                continue

            value = reading["value"]
            direction = threshold["direction"]
            level1 = threshold["level1_value"]
            level2 = threshold["level2_value"]

            exceeds_l2 = self._exceeds(value, level2, direction)
            exceeds_l1 = self._exceeds(value, level1, direction)

            if not exceeds_l1:
                continue

            compartment_id = reading["compartment_id"]
            sensor_id = reading["sensor_id"]

            comp_result = await db.execute(
                select(Compartment).where(Compartment.id == compartment_id)
            )
            compartment = comp_result.scalars().first()
            comp_type = compartment.type if compartment else ""

            alarm_level = 1
            if exceeds_l2:
                alarm_level = 2

            direction_text = "超过" if direction == "above" else "低于"
            message = (
                f"传感器{sensor_id} {sensor_type}值{value}{reading['unit']}"
                f" {direction_text}阈值"
                f"(level{alarm_level}={level2 if alarm_level == 2 else level1}{reading['unit']})"
            )

            alarm = Alarm(
                id=str(uuid.uuid4()),
                sensor_id=sensor_id,
                compartment_id=compartment_id,
                alarm_level=alarm_level,
                sensor_type=sensor_type,
                value=value,
                message=message,
                acknowledged=False,
            )
            db.add(alarm)
            new_alarms.append(alarm)

            if alarm_level >= 2:
                if sensor_type == "gas" and comp_type == "燃气舱":
                    interlock_triggers.append({
                        "compartment_id": compartment_id,
                        "trigger_type": "gas_level2",
                        "trigger_value": value,
                    })
                if sensor_type == "water_level":
                    interlock_triggers.append({
                        "compartment_id": compartment_id,
                        "trigger_type": "water_level_level2",
                        "trigger_value": value,
                    })

        if new_alarms:
            await db.flush()

        return new_alarms, interlock_triggers
