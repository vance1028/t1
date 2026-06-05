import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Overview from '@/pages/Overview';
import Alarms from '@/pages/Alarms';
import Inspections from '@/pages/Inspections';
import Settings from '@/pages/Settings';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useSensorStore } from '@/store/sensorStore';
import { useAlarmStore } from '@/store/alarmStore';
import { useInspectionStore } from '@/store/inspectionStore';

function DataInitializer() {
  const { connected: wsConnected } = useWebSocket();
  const setSections = useSensorStore((s) => s.setSections);
  const applyAlarms = useSensorStore((s) => s.applyAlarms);
  const setAlarms = useAlarmStore((s) => s.setAlarms);
  const setOrders = useInspectionStore((s) => s.setOrders);
  const setInspectors = useInspectionStore((s) => s.setInspectors);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const sectionsRes = await fetch('/api/sections');
        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json();
          setSections(sectionsData);
        }
      } catch (err) {
        console.error('Failed to fetch sections:', err);
      }

      try {
        const alarmsRes = await fetch('/api/alarms');
        if (alarmsRes.ok) {
          const alarmsData = await alarmsRes.json();
          setAlarms(alarmsData);
          applyAlarms(alarmsData);
        }
      } catch (err) {
        console.error('Failed to fetch alarms:', err);
      }

      try {
        const ordersRes = await fetch('/api/inspections');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch (err) {
        console.error('Failed to fetch inspections:', err);
      }

      try {
        const inspectorsRes = await fetch('/api/inspectors');
        if (inspectorsRes.ok) {
          const inspectorsData = await inspectorsRes.json();
          setInspectors(inspectorsData);
        }
      } catch (err) {
        console.error('Failed to fetch inspectors:', err);
      }
    };

    fetchInitialData();
  }, [setSections, applyAlarms, setAlarms, setOrders, setInspectors]);

  return (
    <Routes>
      <Route element={<Layout wsConnected={wsConnected} />}>
        <Route path="/" element={<Overview />} />
        <Route path="/alarms" element={<Alarms />} />
        <Route path="/inspections" element={<Inspections />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DataInitializer />
    </BrowserRouter>
  );
}
