import { create } from 'zustand';
import type { InspectionOrder, Inspector } from '@/types';

interface InspectionStore {
  orders: InspectionOrder[];
  inspectors: Inspector[];
  setOrders: (data: InspectionOrder[]) => void;
  setInspectors: (data: Inspector[]) => void;
  createOrder: (order: Omit<InspectionOrder, 'id' | 'created_at' | 'status' | 'conflict_reason'>) => Promise<InspectionOrder | null>;
  updateStatus: (id: string, status: InspectionOrder['status']) => Promise<void>;
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  orders: [],
  inspectors: [],

  setOrders: (data) => {
    set({ orders: data });
  },

  setInspectors: (data) => {
    set({ inspectors: data });
  },

  createOrder: async (order) => {
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (res.status === 409) {
        const err = await res.json();
        throw new Error(err.detail || '工单冲突');
      }
      if (!res.ok) throw new Error('创建失败');
      const created: InspectionOrder = await res.json();
      set((state) => ({ orders: [created, ...state.orders] }));
      return created;
    } catch (err) {
      console.error('Failed to create order:', err);
      throw err;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await fetch(`/api/inspections/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('更新失败');
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      }));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  },
}));
