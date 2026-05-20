import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

// Load initial state from localStorage (survives refresh)
function loadFromStorage(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
  } catch {}
  return { user: null, token: null };
}

const initial = loadFromStorage();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  token: initial.token,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    const { token } = get();
    return !!token;
  },
}));
