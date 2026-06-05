from datetime import datetime
from typing import Optional, Literal, Union
from pydantic import BaseModel, Field


class SectionOut(BaseModel):
    id: str
    name: str
    seq_no: int
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CompartmentOut(BaseModel):
    id: str
    section_id: str
    name: str
    type: str
    ventilation_on: bool = False
    pump_on: bool = False
    entry_blocked: bool = False
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SensorOut(BaseModel):
    id: str
    compartment_id: str
    sensor_type: str
    unit: str
    installed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SensorReadingOut(BaseModel):
    id: str
    sensor_id: str
    value: Optional[float] = None
    str_value: Optional[str] = None
    timestamp: datetime
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SensorReadingBrief(BaseModel):
    sensor_id: str
    sensor_type: str
    unit: str
    value: Optional[float] = None
    str_value: Optional[str] = None
    timestamp: Optional[datetime] = None


class CompartmentWithSensors(BaseModel):
    id: str
    section_id: str
    name: str
    type: str
    ventilation_on: bool = False
    pump_on: bool = False
    entry_blocked: bool = False
    created_at: Optional[datetime] = None
    sensors: list[SensorReadingBrief] = []


class SectionWithCompartments(BaseModel):
    id: str
    name: str
    seq_no: int
    description: Optional[str] = None
    created_at: Optional[datetime] = None
    compartments: list[CompartmentWithSensors] = []


class AlarmOut(BaseModel):
    id: str
    sensor_id: str
    compartment_id: str
    alarm_level: int
    sensor_type: str
    value: Optional[float] = None
    message: Optional[str] = None
    acknowledged: bool = False
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AlarmAcknowledge(BaseModel):
    acknowledged: bool = True


class InterlockLogOut(BaseModel):
    id: str
    compartment_id: str
    trigger_type: str
    trigger_value: Optional[float] = None
    action: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class InspectorOut(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class InspectionOrderOut(BaseModel):
    id: str
    inspector_id: str
    compartment_ids: list[str]
    check_items: str
    status: str
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class InspectionOrderCreate(BaseModel):
    inspector_id: str
    compartment_ids: list[str]
    check_items: str
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None


class InspectionStatusUpdate(BaseModel):
    status: str


class CheckinCreate(BaseModel):
    inspector_id: str
    compartment_id: str
    note: Optional[str] = None


class CheckinOut(BaseModel):
    id: str
    order_id: str
    inspector_id: str
    compartment_id: str
    checkin_time: Optional[datetime] = None
    note: Optional[str] = None

    model_config = {"from_attributes": True}


class HazardCreate(BaseModel):
    reporter_id: str
    compartment_id: str
    description: str
    severity: Optional[str] = "medium"


class HazardOut(BaseModel):
    id: str
    order_id: str
    reporter_id: str
    compartment_id: str
    description: str
    severity: str
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ThresholdConfigOut(BaseModel):
    id: str
    sensor_type: str
    level1_value: float
    level2_value: float
    direction: str
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ThresholdConfigUpdate(BaseModel):
    level1_value: Optional[float] = None
    level2_value: Optional[float] = None


class WSSensorData(BaseModel):
    type: Literal["sensor_data"] = "sensor_data"
    data: list[dict]


class WSAlarmEvent(BaseModel):
    type: Literal["alarm"] = "alarm"
    data: list[dict]


class WSInterlockEvent(BaseModel):
    type: Literal["interlock"] = "interlock"
    data: list[dict]


WSMessage = Union[WSSensorData, WSAlarmEvent, WSInterlockEvent]


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: str
    username: str
    display_name: Optional[str] = None
    role: str = "admin"
    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
