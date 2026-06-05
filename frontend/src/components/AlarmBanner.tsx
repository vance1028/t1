import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell } from 'lucide-react';
import { useAlarmStore } from '@/store/alarmStore';

export default function AlarmBanner() {
  const navigate = useNavigate();
  const alarms = useAlarmStore((s) => s.alarms);

  const activeAlarms = useMemo(
    () => alarms.filter((a) => !a.acknowledged),
    [alarms]
  );
  const activeAlarmCount = activeAlarms.length;
  const highestLevel = activeAlarms.some((a) => a.alarm_level === 2)
    ? 2
    : activeAlarms.some((a) => a.alarm_level === 1)
    ? 1
    : 0;
  const level1Count = activeAlarms.filter((a) => a.alarm_level === 1).length;
  const level2Count = activeAlarms.filter((a) => a.alarm_level === 2).length;

  if (activeAlarmCount === 0) {
    return (
      <div className="h-10 bg-tunnel-panel border-b border-tunnel-border flex items-center px-4">
        <div className="flex items-center gap-2 text-safe text-sm">
          <Bell className="w-4 h-4" />
          <span>系统正常 · 无活跃告警</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-10 border-b flex items-center px-4 cursor-pointer hover:brightness-110 transition-all"
      style={{
        backgroundColor:
          highestLevel === 2
            ? 'rgba(229, 62, 62, 0.15)'
            : highestLevel === 1
            ? 'rgba(255, 107, 53, 0.12)'
            : 'rgba(240, 180, 41, 0.1)',
        borderColor:
          highestLevel === 2
            ? 'rgba(229, 62, 62, 0.3)'
            : highestLevel === 1
            ? 'rgba(255, 107, 53, 0.25)'
            : 'rgba(240, 180, 41, 0.2)',
      }}
      onClick={() => navigate('/alarms')}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className={`w-4 h-4 ${
            highestLevel === 2
              ? 'text-alarm-3 animate-pulse'
              : highestLevel === 1
              ? 'text-alarm-2'
              : 'text-alarm-1'
          }`}
        />
        <span className="text-sm font-medium">
          活跃告警: {activeAlarmCount} 条
        </span>
        <div className="flex items-center gap-2 ml-2">
          {level1Count > 0 && (
            <span className="text-xs px-2 py-0.5 rounded bg-alarm-1/20 text-alarm-1 font-mono">
              一级 ×{level1Count}
            </span>
          )}
          {level2Count > 0 && (
            <span className="text-xs px-2 py-0.5 rounded bg-alarm-3/20 text-alarm-3 font-mono">
              二级 ×{level2Count}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 ml-auto">点击查看详情 →</span>
      </div>
    </div>
  );
}
