import { useState, useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Shield, Bell, ClipboardList, Settings, ChevronLeft, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { useAlarmStore } from '@/store/alarmStore';
import AlarmBanner from './AlarmBanner';

const navItems = [
  { to: '/', icon: Shield, label: '态势总览' },
  { to: '/alarms', icon: Bell, label: '告警中心' },
  { to: '/inspections', icon: ClipboardList, label: '巡检调度' },
  { to: '/settings', icon: Settings, label: '阈值配置' },
];

interface LayoutProps {
  wsConnected: boolean;
}

export default function Layout({ wsConnected }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const alarms = useAlarmStore((s) => s.alarms);
  const activeAlarms = useMemo(() => alarms.filter((a) => !a.acknowledged), [alarms]);
  const activeAlarmCount = activeAlarms.length;
  const highestLevel = activeAlarms.some((a) => a.alarm_level === 2)
    ? 2
    : activeAlarms.some((a) => a.alarm_level === 1)
    ? 1
    : 0;

  return (
    <div className="flex h-full">
      <aside
        className={`flex flex-col bg-tunnel-panel border-r border-tunnel-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-52'
        }`}
      >
        <div className="flex items-center justify-between px-3 h-14 border-b border-tunnel-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent" />
              <span className="font-bold text-accent text-sm whitespace-nowrap">管廊运维控制台</span>
            </div>
          )}
          {collapsed && <Shield className="w-6 h-6 text-accent mx-auto" />}
        </div>

        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-md transition-colors relative ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-tunnel-border/30'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                  {item.to === '/alarms' && activeAlarmCount > 0 && (
                    <span
                      className={`ml-auto text-xs font-mono px-1.5 py-0.5 rounded-full ${
                        highestLevel === 2
                          ? 'bg-alarm-3/20 text-alarm-3'
                          : highestLevel === 1
                          ? 'bg-alarm-2/20 text-alarm-2'
                          : 'bg-alarm-1/20 text-alarm-1'
                      }`}
                    >
                      {activeAlarmCount}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-tunnel-border p-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {wsConnected ? (
              <Wifi className="w-4 h-4 text-safe" />
            ) : (
              <WifiOff className="w-4 h-4 text-alarm-3" />
            )}
            {!collapsed && <span>{wsConnected ? '实时连接' : '连接断开'}</span>}
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-tunnel-border text-gray-500 hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <AlarmBanner />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
