import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, User, MapPin } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import { useSensorStore } from '@/store/sensorStore';
import type { InspectionOrder } from '@/types';

const STATUS_CONFIG: Record<InspectionOrder['status'], { label: string; color: string; bg: string }> = {
  pending: { label: '待执行', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  in_progress: { label: '进行中', color: 'text-alarm-2', bg: 'bg-alarm-2/10' },
  completed: { label: '已完成', color: 'text-safe', bg: 'bg-safe/10' },
  cancelled: { label: '已取消', color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

export default function InspectionList() {
  const orders = useInspectionStore((s) => s.orders);
  const inspectors = useInspectionStore((s) => s.inspectors);
  const compartments = useSensorStore((s) => s.compartments);
  const updateStatus = useInspectionStore((s) => s.updateStatus);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getInspectorName = (id: string) => {
    return inspectors.find((i) => i.id === id)?.name || id;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const statusCfg = STATUS_CONFIG[order.status];
        const isExpanded = expandedId === order.id;
        return (
          <div
            key={order.id}
            className="bg-tunnel-panel border border-tunnel-border rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-tunnel-border/20 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{order.id.slice(0, 8)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusCfg.bg} ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {getInspectorName(order.inspector_id)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order.compartment_ids.length} 个舱室
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(order.scheduled_start)}
                  </span>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>

            {isExpanded && (
              <div className="px-4 py-3 border-t border-tunnel-border/50 bg-tunnel-dark/30">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">巡检舱室:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {order.compartment_ids.map((cid) => (
                        <span
                          key={cid}
                          className="px-2 py-0.5 rounded bg-tunnel-border/30 text-gray-300"
                        >
                          {compartments[cid]?.name || cid}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">巡检项目:</span>
                    <p className="mt-1 text-gray-300">{order.check_items}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">计划时间:</span>
                    <p className="mt-1 text-gray-300 font-mono">
                      {formatTime(order.scheduled_start)} - {formatTime(order.scheduled_end)}
                    </p>
                  </div>
                </div>
                {order.conflict_reason && (
                  <div className="mt-3 text-xs text-alarm-3 bg-alarm-3/10 px-3 py-2 rounded">
                    冲突: {order.conflict_reason}
                  </div>
                )}
                {order.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateStatus(order.id, 'in_progress')}
                      className="text-xs px-3 py-1.5 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    >
                      开始巡检
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      className="text-xs px-3 py-1.5 rounded bg-gray-600/10 text-gray-400 hover:bg-gray-600/20 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                )}
                {order.status === 'in_progress' && (
                  <div className="mt-3">
                    <button
                      onClick={() => updateStatus(order.id, 'completed')}
                      className="text-xs px-3 py-1.5 rounded bg-safe/10 text-safe hover:bg-safe/20 transition-colors"
                    >
                      完成巡检
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-600 text-sm">暂无巡检工单</div>
      )}
    </div>
  );
}
