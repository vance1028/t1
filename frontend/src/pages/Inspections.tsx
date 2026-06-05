import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import InspectionList from '@/components/InspectionList';
import DispatchForm from '@/components/DispatchForm';
import { useInspectionStore } from '@/store/inspectionStore';

export default function Inspections() {
  const [formOpen, setFormOpen] = useState(false);
  const inspectors = useInspectionStore((s) => s.inspectors);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-200">巡检调度</h2>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-accent text-tunnel-dark font-medium hover:bg-accent-dim transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建工单
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-tunnel-panel border border-tunnel-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Users className="w-4 h-4" />
            巡检人员总数
          </div>
          <div className="text-2xl font-bold font-mono text-gray-200">{inspectors.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <InspectionList />
        </div>
        <div className="col-span-1">
          <h3 className="text-sm font-bold text-gray-300 mb-3">巡检人员</h3>
          <div className="space-y-2">
            {inspectors.map((ins) => (
              <div
                key={ins.id}
                className="bg-tunnel-panel border border-tunnel-border rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{ins.name}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {ins.department} · {ins.phone}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DispatchForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
