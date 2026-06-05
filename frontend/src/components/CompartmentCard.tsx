import { Thermometer, Droplets, Wind, Flame, Waves, DoorOpen, Fan, Lock, Droplet } from 'lucide-react';
import type { CompartmentWithSensors, SensorType } from '@/types';
import { SENSOR_LABELS, SENSOR_UNITS } from '@/types';

const SENSOR_ICON_MAP: Record<SensorType, React.ElementType> = {
  temperature: Thermometer,
  humidity: Droplets,
  oxygen: Wind,
  gas: Flame,
  water_level: Waves,
  fire_door: DoorOpen,
};

function getSensorColor(type: SensorType, value: number | undefined, strValue: string | null): string {
  if (type === 'fire_door') {
    return strValue === 'closed' ? 'text-safe' : 'text-alarm-2';
  }
  if (value === undefined) return 'text-gray-600';
  switch (type) {
    case 'temperature':
      if (value > 45) return 'text-alarm-3';
      if (value > 35) return 'text-alarm-2';
      return 'text-safe';
    case 'humidity':
      if (value > 85) return 'text-alarm-3';
      if (value > 75) return 'text-alarm-2';
      return 'text-safe';
    case 'oxygen':
      if (value < 18) return 'text-alarm-3';
      if (value < 19) return 'text-alarm-2';
      return 'text-safe';
    case 'gas':
      if (value > 40) return 'text-alarm-3';
      if (value > 20) return 'text-alarm-2';
      return 'text-safe';
    case 'water_level':
      if (value > 35) return 'text-alarm-3';
      if (value > 20) return 'text-alarm-2';
      return 'text-safe';
    default:
      return 'text-gray-400';
  }
}

function formatSensorValue(sensor: { sensor_type: SensorType; latest_value?: number; str_value: string | null }): string {
  if (sensor.sensor_type === 'fire_door') {
    return sensor.str_value === 'closed' ? '已关闭' : sensor.str_value === 'open' ? '已打开' : '--';
  }
  if (sensor.latest_value === undefined) return '--';
  return `${sensor.latest_value.toFixed(1)}${SENSOR_UNITS[sensor.sensor_type]}`;
}

interface CompartmentCardProps {
  compartment: CompartmentWithSensors;
  selected: boolean;
  onClick: () => void;
}

export default function CompartmentCard({ compartment, selected, onClick }: CompartmentCardProps) {
  const alarmClass =
    compartment.alarm_level === 2
      ? 'alarm-3'
      : compartment.alarm_level === 1
      ? 'alarm-2'
      : '';

  return (
    <div
      className={`compartment-card ${alarmClass} ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">{compartment.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-tunnel-border/50 text-gray-400 font-mono">
            {compartment.type}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {compartment.ventilation_on && (
            <Fan className="w-3.5 h-3.5 text-accent animate-spin-slow" />
          )}
          {compartment.entry_blocked && (
            <Lock className="w-3.5 h-3.5 text-alarm-1" />
          )}
          {compartment.pump_on && (
            <Droplet className="w-3.5 h-3.5 text-blue-400" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
        {compartment.sensors.map((sensor) => {
          const Icon = SENSOR_ICON_MAP[sensor.sensor_type];
          const colorClass = getSensorColor(sensor.sensor_type, sensor.latest_value, sensor.str_value);
          return (
            <div key={sensor.sensor_id} className="flex items-center gap-1">
              <Icon className={`w-3 h-3 ${colorClass} flex-shrink-0`} />
              <div className="min-w-0">
                <div className="text-[10px] text-gray-500 leading-tight">
                  {SENSOR_LABELS[sensor.sensor_type]}
                </div>
                <div className={`text-xs font-mono font-medium ${colorClass} leading-tight`}>
                  {formatSensorValue(sensor)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
