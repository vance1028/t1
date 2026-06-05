import { useState } from 'react';
import { Bell, Zap } from 'lucide-react';
import AlarmTable from '@/components/AlarmTable';
import InterlockTimeline from '@/components/InterlockTimeline';

type Tab = 'alarms' | 'interlocks';

export default function Alarms() {
  const [activeTab, setActiveTab] = useState<Tab>('alarms');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-200">告警中心</h2>
        <div className="flex items-center gap-1 bg-tunnel-dark rounded-lg p-0.5 border border-tunnel-border">
          <button
            onClick={() => setActiveTab('alarms')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'alarms'
                ? 'bg-accent/10 text-accent'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            告警列表
          </button>
          <button
            onClick={() => setActiveTab('interlocks')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'interlocks'
                ? 'bg-accent/10 text-accent'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            联锁事件
          </button>
        </div>
      </div>

      {activeTab === 'alarms' && <AlarmTable />}
      {activeTab === 'interlocks' && <InterlockTimeline />}
    </div>
  );
}
