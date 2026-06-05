import { create } from 'zustand';
import type { SectionWithCompartments, CompartmentWithSensors, SensorReadingBrief, SensorWithReading, Alarm } from '@/types';

interface SensorStore {
  compartments: Record<string, CompartmentWithSensors>;
  sections: SectionWithCompartments[];
  selectedCompartmentId: string | null;
  setSections: (data: SectionWithCompartments[]) => void;
  applyAlarms: (alarms: Alarm[]) => void;
  updateFromWS: (readings: SensorReadingBrief[]) => void;
  selectCompartment: (id: string | null) => void;
  getAlarmLevel: (compartmentId: string) => 0 | 1 | 2;
}

function toSensorWithReading(brief: SensorReadingBrief, compartmentId: string): SensorWithReading {
  return {
    ...brief,
    compartment_id: compartmentId,
    latest_value: brief.value,
    latest_timestamp: brief.timestamp,
    history: [brief.value],
  };
}

export const useSensorStore = create<SensorStore>((set, get) => ({
  compartments: {},
  sections: [],
  selectedCompartmentId: null,

  setSections: (data) => {
    const compMap: Record<string, CompartmentWithSensors> = {};
    data.forEach((section) => {
      section.compartments.forEach((comp) => {
        const sensors = comp.sensors.map((s) =>
          toSensorWithReading(s as SensorReadingBrief, comp.id)
        );
        compMap[comp.id] = {
          ...comp,
          sensors,
          alarm_level: 0,
        };
      });
    });
    set({
      sections: data.map((section) => ({
        ...section,
        compartments: section.compartments.map((comp) => compMap[comp.id]),
      })),
      compartments: compMap,
    });
  },

  applyAlarms: (alarms) => {
    const { compartments } = get();
    const compAlarmLevel: Record<string, 0 | 1 | 2> = {};

    alarms.forEach((alarm) => {
      if (alarm.acknowledged) return;
      const cid = alarm.compartment_id;
      if (!compAlarmLevel[cid] || alarm.alarm_level > compAlarmLevel[cid]) {
        compAlarmLevel[cid] = alarm.alarm_level;
      }
    });

    const updated = { ...compartments };
    Object.keys(compAlarmLevel).forEach((cid) => {
      if (updated[cid]) {
        updated[cid] = { ...updated[cid], alarm_level: compAlarmLevel[cid] };
      }
    });
    Object.keys(updated).forEach((cid) => {
      if (!compAlarmLevel[cid] && updated[cid].alarm_level > 0) {
        updated[cid] = { ...updated[cid], alarm_level: 0 };
      }
    });

    set({ compartments: updated });

    const { sections } = get();
    const newSections = sections.map((section) => ({
      ...section,
      compartments: section.compartments.map((comp) => updated[comp.id] || comp),
    }));
    set({ sections: newSections });
  },

  updateFromWS: (readings) => {
    const { compartments } = get();
    const updated = { ...compartments };

    readings.forEach((reading) => {
      const comp = updated[reading.compartment_id];
      if (!comp) return;

      const sensorIdx = comp.sensors.findIndex((s) => s.sensor_id === reading.sensor_id);
      if (sensorIdx === -1) return;

      const newSensors = [...comp.sensors];
      const sensor = { ...newSensors[sensorIdx] };
      sensor.value = reading.value;
      sensor.str_value = reading.str_value;
      sensor.timestamp = reading.timestamp;
      sensor.latest_value = reading.value;
      sensor.latest_timestamp = reading.timestamp;
      const history = [...(sensor.history || [])];
      history.push(reading.value);
      if (history.length > 20) history.shift();
      sensor.history = history;
      newSensors[sensorIdx] = sensor;

      updated[reading.compartment_id] = { ...comp, sensors: newSensors };
    });

    set({ compartments: updated });

    const { sections } = get();
    const newSections = sections.map((section) => ({
      ...section,
      compartments: section.compartments.map((comp) => updated[comp.id] || comp),
    }));
    set({ sections: newSections });
  },

  selectCompartment: (id) => {
    set({ selectedCompartmentId: id });
  },

  getAlarmLevel: (compartmentId) => {
    const comp = get().compartments[compartmentId];
    if (!comp) return 0;
    return comp.alarm_level;
  },
}));
