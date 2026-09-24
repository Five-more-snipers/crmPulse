// @ts-check
import { create } from 'zustand';
import apiClient from '../../services/apiClient';

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'ADMIN'|'ARCHITECT'|'TAM'|'DEVOPS'} role
 * @property {string} [avatar_url]
 */

/**
 * Pre-defined role accounts for 1-click login and quick switching
 */
export const DEMO_CREDENTIALS = {
  ADMIN: { email: 'admin@devpulse.io', password: 'admin123', defaultTab: 'overview' },
  ARCHITECT: { email: 'architect@devpulse.io', password: 'architect123', defaultTab: 'kanban' },
  TAM: { email: 'tam@devpulse.io', password: 'tam123', defaultTab: 'clients' },
  DEVOPS: { email: 'devops@devpulse.io', password: 'devops123', defaultTab: 'monitoring' },
};

const SAVED_TOKEN_KEY = 'devpulse_access_token';
const SAVED_USER_KEY = 'devpulse_user_data';
const SAVED_MODE_KEY = 'devpulse_is_demo_mode';

// Initial state from localStorage if present
const initialToken = typeof window !== 'undefined' ? localStorage.getItem(SAVED_TOKEN_KEY) : null;
const initialDemoMode = typeof window !== 'undefined' ? localStorage.getItem(SAVED_MODE_KEY) === 'true' : false;

let initialUser = null;
try {
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem(SAVED_USER_KEY) : null;
  if (storedUser) initialUser = JSON.parse(storedUser);
} catch (e) {
  initialUser = null;
}

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  accessToken: initialToken,
  isAuthenticated: !!initialToken && !!initialUser,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  isDemoMode: initialDemoMode,

  /**
   * Set demo mode vs standard test mode
   * @param {boolean} isDemo
   */
  setDemoMode: (isDemo) => {
    localStorage.setItem(SAVED_MODE_KEY, String(isDemo));
    set({ isDemoMode: isDemo });
  },

  /**
   * Clear any existing error message
   */
  clearError: () => set({ error: null }),

  /**
   * Log in with email and password
   * @param {string} email
   * @param {string} password
   * @param {boolean} [isDemo=false] - Whether this session is running in Demo Mode or Test Mode
   */
  login: async (email, password, isDemo = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;

      localStorage.setItem(SAVED_TOKEN_KEY, accessToken);
      localStorage.setItem(SAVED_USER_KEY, JSON.stringify(user));
      localStorage.setItem(SAVED_MODE_KEY, String(isDemo));

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        isDemoMode: isDemo,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal masuk. Periksa kembali email dan password Anda.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  /**
   * Quick 1-click login using one of the pre-seeded roles (Always activates Demo Mode)
   * @param {'ADMIN'|'ARCHITECT'|'TAM'|'DEVOPS'} role
   */
  quickLoginAs: async (role) => {
    const cred = DEMO_CREDENTIALS[role];
    if (!cred) return { success: false, message: 'Role tidak ditemukan' };
    return get().login(cred.email, cred.password, true);
  },

  /**
   * Log out current user and clear local session
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem(SAVED_TOKEN_KEY);
      localStorage.removeItem(SAVED_USER_KEY);
      // We keep SAVED_MODE_KEY so user returns to their chosen tab preference on login page
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Verify session token on page load/refresh
   */
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    const token = get().accessToken || localStorage.getItem(SAVED_TOKEN_KEY);

    if (!token) {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      return;
    }

    try {
      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.data.user;

      localStorage.setItem(SAVED_USER_KEY, JSON.stringify(user));
      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (err) {
      localStorage.removeItem(SAVED_TOKEN_KEY);
      localStorage.removeItem(SAVED_USER_KEY);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },
}));
