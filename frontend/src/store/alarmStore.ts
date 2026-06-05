import { create } from 'zustand';
import type { Alarm } from '@/types';

interface AlarmStore {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  setAlarms: (data: Alarm[]) => void;
  acknowledgeAlarm: (id: string) => Promise<void>;
  activeAlarmCount: () => number;
  highestLevel: () => 0 | 1 | 2;
  countsByLevel: () => { level1: number; level2: number };
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  alarms: [],

  addAlarm: (alarm) => {
    set((state) => ({
      alarms: [alarm, ...state.alarms],
    }));
  },

  setAlarms: (data) => {
    set({ alarms: data });
  },

  acknowledgeAlarm: async (id) => {
    try {
      await fetch(`/api/alarms/${id}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledged: true }),
      });
      set((state) => ({
        alarms: state.alarms.map((a) =>
          a.id === id ? { ...a, acknowledged: true } : a
        ),
      }));
    } catch (err) {
      console.error('Failed to acknowledge alarm:', err);
    }
  },

  activeAlarmCount: () => {
    return get().alarms.filter((a) => !a.acknowledged).length;
  },

  highestLevel: () => {
    const active = get().alarms.filter((a) => !a.acknowledged);
    if (active.some((a) => a.alarm_level === 2)) return 2;
    if (active.some((a) => a.alarm_level === 1)) return 1;
    return 0;
  },

  countsByLevel: () => {
    const active = get().alarms.filter((a) => !a.acknowledged);
    return {
      level1: active.filter((a) => a.alarm_level === 1).length,
      level2: active.filter((a) => a.alarm_level === 2).length,
    };
  },
}));
