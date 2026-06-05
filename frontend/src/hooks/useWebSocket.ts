import { useEffect, useRef, useState } from 'react';
import type { WSMessage } from '@/types';
import { useSensorStore } from '@/store/sensorStore';
import { useAlarmStore } from '@/store/alarmStore';
import { useAuthStore } from '@/store/authStore';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateFromWS = useSensorStore((s) => s.updateFromWS);
  const applyAlarms = useSensorStore((s) => s.applyAlarms);
  const addAlarm = useAlarmStore((s) => s.addAlarm);
  const alarms = useAlarmStore((s) => s.alarms);
  const alarmsRef = useRef(alarms);
  alarmsRef.current = alarms;

  const token = useAuthStore((s) => s.token);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/sensor-data?token=${tokenRef.current ?? ''}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('[WS] Connected');
      };

      ws.onclose = () => {
        setConnected(false);
        console.log('[WS] Disconnected, reconnecting in 3s...');
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WS] Error:', err);
        ws.close();
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          switch (msg.type) {
            case 'sensor_data':
              updateFromWS(msg.data);
              break;
            case 'alarm':
              msg.data.forEach((alarm) => addAlarm(alarm));
              applyAlarms([...alarmsRef.current, ...msg.data]);
              break;
            case 'interlock':
              console.log('[WS] Interlock events:', msg.data);
              break;
          }
        } catch (e) {
          console.error('[WS] Failed to parse message:', e);
        }
      };
    };

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [updateFromWS, applyAlarms, addAlarm, token]);

  return { connected };
}
