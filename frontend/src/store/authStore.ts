import { create } from 'zustand';

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  initAuth: () => void;
}

const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const savedUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  username: savedUsername,
  isAuthenticated: !!savedToken,

  login: async (username: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', username);
      set({ token: data.access_token, username, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ token: null, username: null, isAuthenticated: false });
  },

  initAuth: () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token) {
      set({ token, username, isAuthenticated: true });
    }
  },
}));
