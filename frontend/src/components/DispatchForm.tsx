import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useInspectionStore } from '@/store/inspectionStore';
import { useSensorStore } from '@/store/sensorStore';

interface DispatchFormProps {
  open: boolean;
  onClose: () => void;
}

export default function DispatchForm({ open, onClose }: DispatchFormProps) {
  const inspectors = useInspectionStore((s) => s.inspectors);
  const compartments = useSensorStore((s) => s.compartments);
  const createOrder = useInspectionStore((s) => s.createOrder);

  const [inspectorId, setInspectorId] = useState('');
  const [selectedComps, setSelectedComps] = useState<string[]>([]);
  const [checkItems, setCheckItems] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const toggleComp = (id: string) => {
    setSelectedComps((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!inspectorId || selectedComps.length === 0 || !scheduledStart || !scheduledEnd) {
      setError('请填写所有必填项');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createOrder({
        inspector_id: inspectorId,
        compartment_ids: selectedComps,
        check_items: checkItems,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
      });
      onClose();
      setInspectorId('');
      setSelectedComps([]);
      setCheckItems('');
      setScheduledStart('');
      setScheduledEnd('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建失败';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const compList = Object.values(compartments);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-tunnel-panel border border-tunnel-border rounded-xl w-[540px] max-h-[85vh] overflow-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-tunnel-border">
          <h3 className="text-sm font-bold text-accent">新建巡检工单</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-xs text-alarm-3 bg-alarm-3/10 px-3 py-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">巡检人员 *</label>
            <select
              value={inspectorId}
              onChange={(e) => setInspectorId(e.target.value)}
              className="w-full bg-tunnel-dark border border-tunnel-border text-sm text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent"
            >
              <option value="">请选择</option>
              {inspectors.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name} - {ins.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">巡检舱室 *</label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-auto">
              {compList.map((comp) => (
                <label
                  key={comp.id}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs cursor-pointer transition-colors ${
                    selectedComps.includes(comp.id)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-tunnel-border text-gray-400 hover:border-tunnel-border/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedComps.includes(comp.id)}
                    onChange={() => toggleComp(comp.id)}
                    className="sr-only"
                  />
                  {comp.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">巡检项目</label>
            <textarea
              value={checkItems}
              onChange={(e) => setCheckItems(e.target.value)}
              rows={3}
              placeholder="请输入巡检项目..."
              className="w-full bg-tunnel-dark border border-tunnel-border text-sm text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">计划开始 *</label>
              <input
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                className="w-full bg-tunnel-dark border border-tunnel-border text-sm text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">计划结束 *</label>
              <input
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                className="w-full bg-tunnel-dark border border-tunnel-border text-sm text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-tunnel-border">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded text-gray-400 hover:text-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="text-sm px-4 py-2 rounded bg-accent text-tunnel-dark font-medium hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {submitting ? '提交中...' : '创建工单'}
          </button>
        </div>
      </div>
    </div>
  );
}
