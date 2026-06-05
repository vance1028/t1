import TopologyMap from '@/components/TopologyMap';
import SensorDetail from '@/components/SensorDetail';

export default function Overview() {
  return (
    <div className="h-full flex">
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-200">管廊态势总览</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-safe" />
            正常
            <span className="inline-block w-2 h-2 rounded-full bg-alarm-1 ml-2" />
            一级告警
            <span className="inline-block w-2 h-2 rounded-full bg-alarm-2 ml-2" />
            二级告警
            <span className="inline-block w-2 h-2 rounded-full bg-alarm-3 ml-2" />
            严重告警
          </div>
        </div>
        <TopologyMap />
      </div>
      <SensorDetail />
    </div>
  );
}
