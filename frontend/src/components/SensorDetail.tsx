import { X, Thermometer, Droplets, Wind, Flame, Waves, DoorOpen, Fan, Lock, Droplet } from 'lucide-react';
import { useSensorStore } from '@/store/sensorStore';
import type { SensorType } from '@/types';
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

function formatSensorDisplayValue(sensor: { sensor_type: SensorType; latest_value?: number; str_value: string | null }): { num: string; unit: string } {
  if (sensor.sensor_type === 'fire_door') {
    return {
      num: sensor.str_value === 'closed' ? '已关闭' : sensor.str_value === 'open' ? '已打开' : '--',
      unit: '',
    };
  }
  return {
    num: sensor.latest_value !== undefined ? sensor.latest_value.toFixed(1) : '--',
    unit: SENSOR_UNITS[sensor.sensor_type],
  };
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-px h-8">
      {data.slice(-20).map((v, i) => {
        const height = ((v - min) / range) * 100;
        return (
          <div
            key={i}
            className={`w-1 rounded-t ${color} opacity-70`}
            style={{ height: `${Math.max(height, 5)}%` }}
          />
        );
      })}
    </div>
  );
}

export default function SensorDetail() {
  const selectedCompartmentId = useSensorStore((s) => s.selectedCompartmentId);
  const compartments = useSensorStore((s) => s.compartments);
  const selectCompartment = useSensorStore((s) => s.selectCompartment);

  if (!selectedCompartmentId) return null;

  const comp = compartments[selectedCompartmentId];
  if (!comp) return null;

  return (
    <div className="w-80 bg-tunnel-panel border-l border-tunnel-border flex flex-col h-full overflow-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-tunnel-border">
        <h3 className="text-sm font-bold text-accent">{comp.name}</h3>
        <button
          onClick={() => selectCompartment(null)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded bg-tunnel-border/50 text-gray-400 font-mono">
            {comp.type}
          </span>
          {comp.alarm_level > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                comp.alarm_level === 2
                  ? 'bg-alarm-3/20 text-alarm-3'
                  : 'bg-alarm-2/20 text-alarm-2'
              }`}
            >
              告警等级 {comp.alarm_level}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className={`flex items-center gap-1 text-xs ${comp.ventilation_on ? 'text-accent' : 'text-gray-600'}`}>
            <Fan className={`w-3.5 h-3.5 ${comp.ventilation_on ? 'animate-spin-slow' : ''}`} />
            <span>通风</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${comp.entry_blocked ? 'text-alarm-1' : 'text-safe'}`}>
            <Lock className="w-3.5 h-3.5" />
            <span>{comp.entry_blocked ? '禁入' : '可入'}</span>
          </div>
          <div className={`flex items-center gap-1 text-xs ${comp.pump_on ? 'text-blue-400' : 'text-gray-600'}`}>
            <Droplet className="w-3.5 h-3.5" />
            <span>水泵</span>
          </div>
        </div>

        <div className="space-y-3">
          {comp.sensors.map((sensor) => {
            const Icon = SENSOR_ICON_MAP[sensor.sensor_type];
            const colorClass = getSensorColor(sensor.sensor_type, sensor.latest_value, sensor.str_value);
            const barColor =
              sensor.latest_value !== undefined
                ? getSensorColor(sensor.sensor_type, sensor.latest_value, sensor.str_value).replace('text-', 'bg-')
                : 'bg-gray-700';
            const display = formatSensorDisplayValue(sensor);
            return (
              <div
                key={sensor.sensor_id}
                className="bg-tunnel-dark/50 rounded-lg p-3 border border-tunnel-border/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                    <span className="text-xs text-gray-400">
                      {SENSOR_LABELS[sensor.sensor_type]}
                    </span>
                  </div>
                  <span className={`text-lg font-mono font-bold ${colorClass}`}>
                    {display.num}
                    {display.unit && (
                      <span className="text-xs text-gray-500 ml-1">
                        {display.unit}
                      </span>
                    )}
                  </span>
                </div>
                {sensor.history && sensor.history.length > 1 && sensor.sensor_type !== 'fire_door' && (
                  <Sparkline data={sensor.history} color={barColor} />
                )}
                {sensor.latest_timestamp && (
                  <div className="text-[10px] text-gray-600 mt-1 font-mono">
                    {new Date(sensor.latest_timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
