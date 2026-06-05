import { useState, useEffect } from 'react';
import { Zap, ArrowDown, ArrowUp } from 'lucide-react';
import type { InterlockLog } from '@/types';
import { useSensorStore } from '@/store/sensorStore';

const TRIGGER_COLORS: Record<string, string> = {
  temperature: 'text-alarm-2',
  gas: 'text-alarm-3',
  oxygen: 'text-blue-400',
  water_level: 'text-blue-300',
  humidity: 'text-cyan-400',
};

export default function InterlockTimeline() {
  const [logs, setLogs] = useState<InterlockLog[]>([]);
  const compartments = useSensorStore((s) => s.compartments);

  useEffect(() => {
    fetch('/api/interlock-logs?limit=50')
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error('Failed to fetch interlock logs:', err));
  }, []);

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

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-accent" />
        联锁事件时间线
      </h3>
      <div className="relative pl-6">
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-tunnel-border" />
        <div className="space-y-4">
          {logs.map((log) => {
            const comp = compartments[log.compartment_id];
            const triggerColor = TRIGGER_COLORS[log.trigger_type] || 'text-gray-400';
            return (
              <div key={log.id} className="relative">
                <div
                  className={`absolute left-[-14px] top-1 w-3 h-3 rounded-full border-2 border-tunnel-dark ${
                    triggerColor.replace('text-', 'bg-')
                  }`}
                />
                <div className="bg-tunnel-dark/50 border border-tunnel-border/50 rounded-lg p-3 ml-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono text-gray-500">
                      {formatTime(log.created_at)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {comp?.name || log.compartment_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`text-xs font-mono ${triggerColor}`}>
                      {log.trigger_type}
                    </span>
                    <ArrowDown className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-accent">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-500 font-mono">
                    <span>触发值: {log.trigger_value}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="text-center text-gray-600 py-4 text-sm">暂无联锁事件</div>
          )}
        </div>
      </div>
    </div>
  );
}
