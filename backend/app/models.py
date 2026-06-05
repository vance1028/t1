from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from app.database import Base


class Section(Base):
    __tablename__ = "section"

    id = Column(String(36), primary_key=True)
    name = Column(String(50), nullable=False)
    seq_no = Column(Integer, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Compartment(Base):
    __tablename__ = "compartment"

    id = Column(String(36), primary_key=True)
    section_id = Column(String(36), ForeignKey("section.id"), nullable=False)
    name = Column(String(50), nullable=False)
    type = Column(String(30), nullable=False)
    ventilation_on = Column(Boolean, default=False)
    pump_on = Column(Boolean, default=False)
    entry_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Sensor(Base):
    __tablename__ = "sensor"

    id = Column(String(36), primary_key=True)
    compartment_id = Column(String(36), ForeignKey("compartment.id"), nullable=False)
    sensor_type = Column(String(30), nullable=False)
    unit = Column(String(20), nullable=False)
    installed_at = Column(DateTime(timezone=True), server_default=func.now())


class SensorReading(Base):
    __tablename__ = "sensor_reading"

    id = Column(String(36), primary_key=True)
    sensor_id = Column(String(36), ForeignKey("sensor.id"), nullable=False)
    value = Column(Float)
    str_value = Column(String(50))
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ThresholdConfig(Base):
    __tablename__ = "threshold_config"

    id = Column(String(36), primary_key=True)
    sensor_type = Column(String(30), nullable=False, unique=True)
    level1_value = Column(Float, nullable=False)
    level2_value = Column(Float, nullable=False)
    direction = Column(String(10), nullable=False, default="above")
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class Alarm(Base):
    __tablename__ = "alarm"

    id = Column(String(36), primary_key=True)
    sensor_id = Column(String(36), ForeignKey("sensor.id"), nullable=False)
    compartment_id = Column(String(36), ForeignKey("compartment.id"), nullable=False)
    alarm_level = Column(Integer, nullable=False)
    sensor_type = Column(String(30), nullable=False)
    value = Column(Float)
    message = Column(Text)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InterlockLog(Base):
    __tablename__ = "interlock_log"

    id = Column(String(36), primary_key=True)
    compartment_id = Column(String(36), ForeignKey("compartment.id"), nullable=False)
    trigger_type = Column(String(50), nullable=False)
    trigger_value = Column(Float)
    action = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Inspector(Base):
    __tablename__ = "inspector"

    id = Column(String(36), primary_key=True)
    name = Column(String(50), nullable=False)
    phone = Column(String(20))
    department = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InspectionOrder(Base):
    __tablename__ = "inspection_order"

    id = Column(String(36), primary_key=True)
    inspector_id = Column(String(36), ForeignKey("inspector.id"), nullable=False)
    compartment_ids = Column(ARRAY(String), nullable=False)
    check_items = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    scheduled_start = Column(DateTime(timezone=True))
    scheduled_end = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CheckinRecord(Base):
    __tablename__ = "checkin_record"

    id = Column(String(36), primary_key=True)
    order_id = Column(String(36), ForeignKey("inspection_order.id"), nullable=False)
    inspector_id = Column(String(36), ForeignKey("inspector.id"), nullable=False)
    compartment_id = Column(String(36), ForeignKey("compartment.id"), nullable=False)
    checkin_time = Column(DateTime(timezone=True), server_default=func.now())
    note = Column(Text)


class HazardReport(Base):
    __tablename__ = "hazard_report"

    id = Column(String(36), primary_key=True)
    order_id = Column(String(36), ForeignKey("inspection_order.id"), nullable=False)
    reporter_id = Column(String(36), ForeignKey("inspector.id"), nullable=False)
    compartment_id = Column(String(36), ForeignKey("compartment.id"), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="medium")
    status = Column(String(20), default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "user"

    id = Column(String(36), primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    hashed_password = Column(String(200), nullable=False)
    display_name = Column(String(50))
    role = Column(String(20), default="admin")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
