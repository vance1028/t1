import { useSensorStore } from '@/store/sensorStore';
import CompartmentCard from './CompartmentCard';

export default function TopologyMap() {
  const sections = useSensorStore((s) => s.sections);
  const selectedCompartmentId = useSensorStore((s) => s.selectedCompartmentId);
  const selectCompartment = useSensorStore((s) => s.selectCompartment);

  return (
    <div className="h-full flex gap-4 overflow-x-auto pb-2">
      {sections.map((section) => (
        <div
          key={section.id}
          className="flex-shrink-0 flex flex-col min-w-[280px] max-w-[340px]"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <h3 className="text-sm font-bold text-accent tracking-wide">{section.name}</h3>
            {section.description && (
              <span className="text-[10px] text-gray-500 ml-auto">
                {section.description}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2">
            {section.compartments.map((comp) => (
              <CompartmentCard
                key={comp.id}
                compartment={comp}
                selected={selectedCompartmentId === comp.id}
                onClick={() =>
                  selectCompartment(selectedCompartmentId === comp.id ? null : comp.id)
                }
              />
            ))}
          </div>

          <div className="mt-2 border-t border-tunnel-border pt-2">
            <div className="h-1 bg-tunnel-border rounded-full mt-1 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-accent/30 rounded-full"
                style={{ width: '100%' }}
              />
              {section.compartments.some((c) => c.alarm_level > 0) && (
                <div
                  className="absolute inset-y-0 left-0 bg-alarm-3/40 rounded-full alarm-pulse"
                  style={{ width: '60%' }}
                />
              )}
            </div>
          </div>
        </div>
      ))}

      {sections.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          <div className="text-center">
            <div className="text-4xl mb-2 opacity-30">🏛️</div>
            <p className="text-sm">等待管廊数据加载...</p>
            <p className="text-xs text-gray-700 mt-1">请确认后端服务已启动</p>
          </div>
        </div>
      )}
    </div>
  );
}
