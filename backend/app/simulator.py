import random
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Sensor, SensorReading, Compartment


NOISE_STD = {
    "temperature": 0.3,
    "humidity": 1.0,
    "oxygen": 0.2,
    "gas": 0.5,
    "water_level": 0.5,
}

RANGE_MIN = {
    "temperature": -10,
    "humidity": 0,
    "oxygen": 0,
    "gas": 0,
    "water_level": 0,
}

RANGE_MAX = {
    "temperature": 80,
    "humidity": 100,
    "oxygen": 25,
    "gas": 100,
    "water_level": 200,
}

DRIFT_RATE = {
    "gas": 0.8,
    "water_level": 0.5,
}


class SensorSimulator:
    def __init__(self):
        self.sensors: list[dict] = []
        self.compartments: dict[str, dict] = {}
        self.last_values: dict[str, float | str] = {}

    async def load_from_db(self, db: AsyncSession):
        result = await db.execute(select(Sensor))
        sensors = result.scalars().all()
        self.sensors = [
            {
                "id": s.id,
                "compartment_id": s.compartment_id,
                "sensor_type": s.sensor_type,
                "unit": s.unit,
            }
            for s in sensors
        ]

        comp_result = await db.execute(select(Compartment))
        compartments = comp_result.scalars().all()
        self.compartments = {
            c.id: {
                "id": c.id,
                "type": c.type,
                "ventilation_on": c.ventilation_on,
                "pump_on": c.pump_on,
                "entry_blocked": c.entry_blocked,
            }
            for c in compartments
        }

        for sensor in self.sensors:
            reading_result = await db.execute(
                select(SensorReading)
                .where(SensorReading.sensor_id == sensor["id"])
                .order_by(SensorReading.timestamp.desc())
                .limit(1)
            )
            latest = reading_result.scalars().first()
            if latest:
                if latest.value is not None:
                    self.last_values[sensor["id"]] = latest.value
                elif latest.str_value is not None:
                    self.last_values[sensor["id"]] = latest.str_value
            else:
                self.last_values[sensor["id"]] = self._default_value(sensor["sensor_type"])

    def _default_value(self, sensor_type: str) -> float | str:
        defaults = {
            "temperature": 25.0,
            "humidity": 50.0,
            "oxygen": 21.0,
            "gas": 5.0,
            "water_level": 5.0,
            "fire_door": "closed",
        }
        return defaults.get(sensor_type, 0.0)

    async def tick(self) -> list[dict]:
        now = datetime.now(timezone.utc)
        readings = []
        for sensor in self.sensors:
            sensor_id = sensor["id"]
            compartment_id = sensor["compartment_id"]
            sensor_type = sensor["sensor_type"]
            unit = sensor["unit"]
            comp = self.compartments.get(compartment_id, {})

            if sensor_type == "fire_door":
                current = self.last_values.get(sensor_id, "closed")
                if random.random() < 0.005:
                    current = "open" if current == "closed" else "closed"
                self.last_values[sensor_id] = current
                readings.append({
                    "sensor_id": sensor_id,
                    "compartment_id": compartment_id,
                    "sensor_type": sensor_type,
                    "value": None,
                    "str_value": current,
                    "unit": unit,
                    "timestamp": now.isoformat(),
                })
                continue

            current = float(self.last_values.get(sensor_id, self._default_value(sensor_type)))
            std = NOISE_STD.get(sensor_type, 0.5)
            new_val = current + random.gauss(0, std)

            if comp.get("ventilation_on") and sensor_type == "gas":
                rate = DRIFT_RATE["gas"]
                new_val -= rate
                if new_val < 0:
                    new_val = 0

            if comp.get("pump_on") and sensor_type == "water_level":
                rate = DRIFT_RATE["water_level"]
                new_val -= rate
                if new_val < 0:
                    new_val = 0

            min_val = RANGE_MIN.get(sensor_type, -1000)
            max_val = RANGE_MAX.get(sensor_type, 1000)
            new_val = max(min_val, min(max_val, new_val))
            new_val = round(new_val, 2)

            self.last_values[sensor_id] = new_val
            readings.append({
                "sensor_id": sensor_id,
                "compartment_id": compartment_id,
                "sensor_type": sensor_type,
                "value": new_val,
                "str_value": None,
                "unit": unit,
                "timestamp": now.isoformat(),
            })

        return readings
