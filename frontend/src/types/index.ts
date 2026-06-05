export type SensorType = 'temperature' | 'humidity' | 'oxygen' | 'gas' | 'water_level' | 'fire_door';

export interface Section {
  id: string;
  name: string;
  seq_no: number;
  description: string;
  created_at: string;
}

export interface Compartment {
  id: string;
  section_id: string;
  name: string;
  type: string;
  ventilation_on: boolean;
  pump_on: boolean;
  entry_blocked: boolean;
  created_at: string;
}

export interface SensorReadingBrief {
  sensor_id: string;
  compartment_id: string;
  sensor_type: SensorType;
  unit: string;
  value: number;
  str_value: string | null;
  timestamp: string;
}

export interface ThresholdConfig {
  id: string;
  sensor_type: SensorType;
  level1_value: number;
  level2_value: number;
  direction: 'above' | 'below';
  updated_at: string;
}

export interface Alarm {
  id: string;
  sensor_id: string;
  compartment_id: string;
  alarm_level: 1 | 2;
  sensor_type: SensorType;
  value: number;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export interface InterlockLog {
  id: string;
  compartment_id: string;
  trigger_type: string;
  trigger_value: number;
  action: string;
  created_at: string;
}

export interface Inspector {
  id: string;
  name: string;
  phone: string;
  department: string;
  created_at: string;
}

export interface InspectionOrder {
  id: string;
  inspector_id: string;
  compartment_ids: string[];
  check_items: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_start: string;
  scheduled_end: string;
  created_at: string;
  conflict_reason?: string;
}

export interface SensorWithReading {
  sensor_id: string;
  compartment_id: string;
  sensor_type: SensorType;
  unit: string;
  value: number;
  str_value: string | null;
  timestamp: string;
  latest_value?: number;
  latest_timestamp?: string;
  history: number[];
}

export interface CompartmentWithSensors extends Compartment {
  sensors: SensorWithReading[];
  alarm_level: 0 | 1 | 2;
}

export interface SectionWithCompartments extends Section {
  compartments: CompartmentWithSensors[];
}

export type WSMessageType = 'sensor_data' | 'alarm' | 'interlock';

export interface WSSensorMessage {
  type: 'sensor_data';
  data: SensorReadingBrief[];
}

export interface WSAlarmMessage {
  type: 'alarm';
  data: Alarm[];
}

export interface WSInterlockMessage {
  type: 'interlock';
  data: InterlockLog[];
}

export type WSMessage =
  | WSSensorMessage
  | WSAlarmMessage
  | WSInterlockMessage;

export const SENSOR_LABELS: Record<SensorType, string> = {
  temperature: '温度',
  humidity: '湿度',
  oxygen: '氧气',
  gas: '有害气体',
  water_level: '水位',
  fire_door: '防火门',
};

export const SENSOR_UNITS: Record<SensorType, string> = {
  temperature: '°C',
  humidity: '%',
  oxygen: '%',
  gas: 'LEL%',
  water_level: 'cm',
  fire_door: '',
};

export const SENSOR_ICONS: Record<SensorType, string> = {
  temperature: '🌡️',
  humidity: '💧',
  oxygen: '🫁',
  gas: '☠️',
  water_level: '🌊',
  fire_door: '🚪',
};
