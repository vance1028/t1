import asyncio
import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.models import SensorReading, Compartment
from app.simulator import SensorSimulator
from app.alarm_engine import AlarmEngine
from app.interlock_executor import InterlockExecutor
from app.auth import verify_token

router = APIRouter()

connected_clients: set[WebSocket] = {}
simulator: SensorSimulator | None = None
alarm_engine: AlarmEngine | None = None
interlock_executor: InterlockExecutor | None = None
background_task: asyncio.Task | None = None


async def _init_components():
    global simulator, alarm_engine, interlock_executor
    if simulator is None:
        simulator = SensorSimulator()
        alarm_engine = AlarmEngine()
        interlock_executor = InterlockExecutor()

        async with async_session() as db:
            await simulator.load_from_db(db)
            await alarm_engine.load_from_db(db)


async def _broadcast(message: dict):
    dead = []
    for ws in list(connected_clients.keys()):
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    for ws in dead:
        connected_clients.pop(ws, None)


async def _sensor_loop():
    while True:
        try:
            async with async_session() as db:
                readings = await simulator.tick()

                reading_objects = []
                for r in readings:
                    ts = r["timestamp"]
                    if isinstance(ts, str):
                        ts = datetime.fromisoformat(ts)
                    reading_obj = SensorReading(
                        id=str(uuid.uuid4()),
                        sensor_id=r["sensor_id"],
                        value=r.get("value"),
                        str_value=r.get("str_value"),
                        timestamp=ts,
                    )
                    reading_objects.append(reading_obj)
                db.add_all(reading_objects)

                new_alarms, interlock_triggers = await alarm_engine.evaluate(readings, db)

                interlock_logs = []
                for trigger in interlock_triggers:
                    log = await interlock_executor.execute(
                        compartment_id=trigger["compartment_id"],
                        trigger_type=trigger["trigger_type"],
                        trigger_value=trigger["trigger_value"],
                        db=db,
                    )
                    interlock_logs.append(log)
                    await simulator.load_from_db(db)

                await db.commit()

                await _broadcast({
                    "type": "sensor_data",
                    "data": readings,
                })

                if new_alarms:
                    alarm_data = [
                        {
                            "id": a.id,
                            "sensor_id": a.sensor_id,
                            "compartment_id": a.compartment_id,
                            "alarm_level": a.alarm_level,
                            "sensor_type": a.sensor_type,
                            "value": a.value,
                            "message": a.message,
                            "acknowledged": a.acknowledged,
                            "created_at": a.created_at.isoformat() if a.created_at else None,
                        }
                        for a in new_alarms
                    ]
                    await _broadcast({
                        "type": "alarm",
                        "data": alarm_data,
                    })

                if interlock_logs:
                    interlock_data = [
                        {
                            "id": log.id,
                            "compartment_id": log.compartment_id,
                            "trigger_type": log.trigger_type,
                            "trigger_value": log.trigger_value,
                            "action": log.action,
                            "created_at": log.created_at.isoformat() if log.created_at else None,
                        }
                        for log in interlock_logs
                    ]
                    await _broadcast({
                        "type": "interlock",
                        "data": interlock_data,
                    })

        except Exception as e:
            print(f"传感器循环异常: {e}")

        await asyncio.sleep(1)


@router.websocket("/sensor-data")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(default=None)):
    if not token or not verify_token(token):
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await _init_components()

    global background_task
    await websocket.accept()
    connected_clients[websocket] = True

    if background_task is None or background_task.done():
        background_task = asyncio.create_task(_sensor_loop())

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.pop(websocket, None)
        if not connected_clients and background_task and not background_task.done():
            background_task.cancel()
            background_task = None
