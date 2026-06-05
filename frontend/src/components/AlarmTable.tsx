import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAlarmStore } from '@/store/alarmStore';
import { useSensorStore } from '@/store/sensorStore';
import { SENSOR_LABELS } from '@/types';
import type { Alarm } from '@/types';

type LevelFilter = 'all' | '1' | '2';
type AckFilter = 'all' | 'unack' | 'ack';

export default function AlarmTable() {
  const alarms = useAlarmStore((s) => s.alarms);
  const acknowledgeAlarm = useAlarmStore((s) => s.acknowledgeAlarm);
  const compartments = useSensorStore((s) => s.compartments);

  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [ackFilter, setAckFilter] = useState<AckFilter>('all');
  const [compFilter, setCompFilter] = useState<string>('all');

  const compartmentOptions = Object.values(compartments);

  const filtered = alarms.filter((a) => {
    if (levelFilter !== 'all' && String(a.alarm_level) !== levelFilter) return false;
    if (ackFilter === 'unack' && a.acknowledged) return false;
    if (ackFilter === 'ack' && !a.acknowledged) return false;
    if (compFilter !== 'all' && a.compartment_id !== compFilter) return false;
    return true;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const levelBadge = (level: Alarm['alarm_level']) => {
    if (level === 1)
      return <span className="text-xs px-2 py-0.5 rounded bg-alarm-1/20 text-alarm-1 font-mono">一级</span>;
    return <span className="text-xs px-2 py-0.5 rounded bg-alarm-3/20 text-alarm-3 font-mono">二级</span>;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">级别:</span>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
            className="bg-tunnel-dark border border-tunnel-border text-sm text-gray-300 rounded px-2 py-1 focus:outline-none focus:border-accent"
          >
            <option value="all">全部</option>
            <option value="1">一级</option>
            <option value="2">二级</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">状态:</span>
          <select
            value={ackFilter}
            onChange={(e) => setAckFilter(e.target.value as AckFilter)}
            className="bg-tunnel-dark border border-tunnel-border text-sm text-gray-300 rounded px-2 py-1 focus:outline-none focus:border-accent"
          >
            <option value="all">全部</option>
            <option value="unack">未确认</option>
            <option value="ack">已确认</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">舱室:</span>
          <select
            value={compFilter}
            onChange={(e) => setCompFilter(e.target.value)}
            className="bg-tunnel-dark border border-tunnel-border text-sm text-gray-300 rounded px-2 py-1 focus:outline-none focus:border-accent"
          >
            <option value="all">全部</option>
            {compartmentOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-tunnel-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-tunnel-dark/80 text-gray-400 text-xs">
              <th className="text-left px-3 py-2 font-medium">时间</th>
              <th className="text-left px-3 py-2 font-medium">舱室</th>
              <th className="text-left px-3 py-2 font-medium">传感器</th>
              <th className="text-center px-3 py-2 font-medium">级别</th>
              <th className="text-right px-3 py-2 font-medium">值</th>
              <th className="text-left px-3 py-2 font-medium">消息</th>
              <th className="text-center px-3 py-2 font-medium">状态</th>
              <th className="text-center px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alarm) => {
              const comp = compartments[alarm.compartment_id];
              return (
                <tr
                  key={alarm.id}
                  className={`border-t border-tunnel-border/50 hover:bg-tunnel-dark/50 ${
                    !alarm.acknowledged ? 'bg-alarm-3/5' : ''
                  }`}
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-400">
                    {formatTime(alarm.created_at)}
                  </td>
                  <td className="px-3 py-2 text-gray-300">
                    {comp?.name || alarm.compartment_id}
                  </td>
                  <td className="px-3 py-2 text-gray-400">
                    {SENSOR_LABELS[alarm.sensor_type]}
                  </td>
                  <td className="px-3 py-2 text-center">{levelBadge(alarm.alarm_level)}</td>
                  <td className="px-3 py-2 text-right font-mono text-alarm-2">
                    {alarm.value.toFixed(1)}
                  </td>
                  <td className="px-3 py-2 text-gray-400 text-xs max-w-[200px] truncate">
                    {alarm.message}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {alarm.acknowledged ? (
                      <CheckCircle className="w-4 h-4 text-safe mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-alarm-3 mx-auto" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {!alarm.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlarm(alarm.id)}
                        className="text-xs px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                      >
                        确认
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-600">
                  暂无告警记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
