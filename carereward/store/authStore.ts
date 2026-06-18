import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { MOCK_USER } from '@/constants/mockData';
import type { User } from '@/types';

const TOKEN_KEY = 'carereward_auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, _password: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Replace with real API call
      // const response = await api.post('/auth/login', { email, password });
      await new Promise((r) => setTimeout(r, 1000)); // Simulated network delay

      const mockToken = `cr_token_${Date.now()}`;
      const user = { ...MOCK_USER, email };

      await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
      set({ user, token: mockToken, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: 'Invalid email or password. Please try again.', isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // TODO: validate token with API, fetch fresh user profile
        set({ user: MOCK_USER, token, isAuthenticated: true });
      }
    } catch {
      // Silently fail — user will be shown the login screen
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
