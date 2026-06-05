import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { ThresholdConfig, SensorType } from '@/types';
import { SENSOR_LABELS } from '@/types';

const SENSOR_TYPES: SensorType[] = ['temperature', 'humidity', 'oxygen', 'gas', 'water_level', 'fire_door'];

export default function ThresholdTable() {
  const [thresholds, setThresholds] = useState<ThresholdConfig[]>([]);
  const [edited, setEdited] = useState<Record<string, { level1?: number; level2?: number }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/thresholds')
      .then((res) => res.json())
      .then((data) => setThresholds(data))
      .catch((err) => console.error('Failed to fetch thresholds:', err));
  }, []);

  const handleEdit = (id: string, field: 'level1_value' | 'level2_value', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setEdited((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field === 'level1_value' ? 'level1' : 'level2']: num },
    }));
  };

  const handleSave = async (id: string) => {
    const changes = edited[id];
    if (!changes) return;

    const threshold = thresholds.find((t) => t.id === id);
    if (!threshold) return;

    setSaving((prev) => ({ ...prev, [id]: true }));

    try {
      const body: Record<string, number> = {};
      if (changes.level1 !== undefined) body.level1_value = changes.level1;
      if (changes.level2 !== undefined) body.level2_value = changes.level2;

      await fetch(`/api/thresholds/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setThresholds((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                level1_value: changes.level1 ?? t.level1_value,
                level2_value: changes.level2 ?? t.level2_value,
              }
            : t
        )
      );
      setEdited((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      console.error('Failed to save threshold:', err);
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const getLevel1Value = (t: ThresholdConfig) => edited[t.id]?.level1 ?? t.level1_value;
  const getLevel2Value = (t: ThresholdConfig) => edited[t.id]?.level2 ?? t.level2_value;

  const displayThresholds = SENSOR_TYPES.map((type) => {
    const existing = thresholds.find((t) => t.sensor_type === type);
    return (
      existing || {
        id: `placeholder-${type}`,
        sensor_type: type,
        level1_value: 0,
        level2_value: 0,
        direction: 'above' as const,
        updated_at: '',
      }
    );
  });

  return (
    <div className="overflow-auto rounded-lg border border-tunnel-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-tunnel-dark/80 text-gray-400 text-xs">
            <th className="text-left px-4 py-2 font-medium">传感器类型</th>
            <th className="text-center px-4 py-2 font-medium">一级阈值</th>
            <th className="text-center px-4 py-2 font-medium">二级阈值</th>
            <th className="text-center px-4 py-2 font-medium">方向</th>
            <th className="text-center px-4 py-2 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {displayThresholds.map((t) => {
            const isPlaceholder = t.id.startsWith('placeholder-');
            return (
              <tr key={t.id} className="border-t border-tunnel-border/50 hover:bg-tunnel-dark/50">
                <td className="px-4 py-2 text-gray-300">{SENSOR_LABELS[t.sensor_type]}</td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="number"
                    step="0.1"
                    value={getLevel1Value(t)}
                    onChange={(e) => handleEdit(t.id, 'level1_value', e.target.value)}
                    disabled={isPlaceholder}
                    className="w-24 text-center bg-tunnel-dark border border-tunnel-border text-sm text-alarm-1 font-mono rounded px-2 py-1 focus:outline-none focus:border-accent disabled:opacity-50"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="number"
                    step="0.1"
                    value={getLevel2Value(t)}
                    onChange={(e) => handleEdit(t.id, 'level2_value', e.target.value)}
                    disabled={isPlaceholder}
                    className="w-24 text-center bg-tunnel-dark border border-tunnel-border text-sm text-alarm-3 font-mono rounded px-2 py-1 focus:outline-none focus:border-accent disabled:opacity-50"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <span className="text-xs text-gray-500 font-mono">{t.direction === 'above' ? '↑ 超过' : '↓ 低于'}</span>
                </td>
                <td className="px-4 py-2 text-center">
                  {edited[t.id] && (
                    <button
                      onClick={() => handleSave(t.id)}
                      disabled={saving[t.id]}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3 h-3" />
                      {saving[t.id] ? '保存中' : '保存'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
