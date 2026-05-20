import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api.js';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT', 'STAFF'];

export function isAdminPanelRole(role) {
  return role && role !== 'CUSTOMER';
}

export function syncAdminSessionCookie(user, token) {
  if (typeof document === 'undefined') return;
  if (user && isAdminPanelRole(user.role)) {
    document.cookie = 'wavi_admin_token=authenticated; path=/; max-age=86400';
  } else {
    document.cookie = 'wavi_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  if (token) {
    localStorage.setItem('wavi_token', token);
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isAdmin: false,
      isSupport: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      /**
       * Asynchronous Login Action
       * Allows identifier (Email or Phone Number) + password authentication
       */
      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { identifier, password });
          const { token, user } = response.data.data;

          // 1. Direct save of the token in localStorage for synchronous API interceptors
          localStorage.setItem('wavi_token', token);

          const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
          const isSupport = user.role === 'SUPPORT';
          const isStaff = user.role === 'STAFF';

          // 2. Sync middleware cookie + local token for App Router + API interceptors
          syncAdminSessionCookie(user, token);

          set({
            isAuthenticated: true,
            isAdmin,
            isSupport,
            user,
            token,
            isLoading: false,
            error: null,
            _hasHydrated: true,
          });

          // We decoupled cart syncing reactively in useCartStore via useAuthStore.subscribe

          return { success: true, role: user.role };
        } catch (err) {
          const errMsg = err.response?.data?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
          set({ isLoading: false, error: errMsg });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Asynchronous Registration Action
       * Registers new customer accounts and automatically authenticates them
       */
      register: async (firstName, lastName, email, phone, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', {
            firstName,
            lastName,
            email,
            phone,
            password,
          });
          const { token, user } = response.data.data;

          // 1. Direct save of the token in localStorage for synchronous API interceptors
          localStorage.setItem('wavi_token', token);

          // 2. Clear admin cookies
          document.cookie = "wavi_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

          set({
            isAuthenticated: true,
            isAdmin: false,
            isSupport: false,
            user,
            token,
            isLoading: false,
            error: null,
          });

          // We decoupled cart syncing reactively in useCartStore via useAuthStore.subscribe

          return { success: true, role: user.role };
        } catch (err) {
          const errMsg = err.response?.data?.message || 'عذراً، حدث خطأ أثناء التسجيل. يرجى مراجعة البيانات والتحقق من أن البريد أو الهاتف غير مسجل مسبقاً';
          set({ isLoading: false, error: errMsg });
          return { success: false, error: errMsg };
        }
      },

      /**
       * Wipes session, tokens, and cookies
       */
      logout: () => {
        localStorage.removeItem('wavi_token');
        document.cookie = "wavi_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        set({
          isAuthenticated: false,
          isAdmin: false,
          isSupport: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });

        // We decoupled cart clearing reactively in useCartStore via useAuthStore.subscribe
      },

      clearError: () => set({ error: null }),
      updateUser: (updatedUser) => set({ user: updatedUser }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isSupport: state.isSupport,
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && state?.user) {
          syncAdminSessionCookie(state.user, state.token);
        }
      },
    }
  )
);

/** Call once on the client so admin layout never waits forever for hydration. */
export function markAuthHydrated() {
  const state = useAuthStore.getState();
  if (state._hasHydrated) return;
  if (state.isAuthenticated && state.user) {
    syncAdminSessionCookie(state.user, state.token);
  }
  useAuthStore.setState({ _hasHydrated: true });
}
