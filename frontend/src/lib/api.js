import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token automatically on outgoing calls
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // 1. Check direct wavi_token in localStorage
      let token = localStorage.getItem('wavi_token');

      // 2. Fallback: Parse from Zustand auth-storage if direct key is empty
      if (!token) {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            token = parsed.state?.token || null;
          }
        } catch (e) {
          console.error('Error parsing auth-storage token:', e);
        }
      }

      if (token) {
        if (config.headers.set) {
          config.headers.set('Authorization', `Bearer ${token}`);
          config.headers.set('authorization', `Bearer ${token}`);
        } else {
          config.headers['Authorization'] = `Bearer ${token}`;
          config.headers['authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Globally handle authorization issues (e.g. expired tokens)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      if (typeof window !== 'undefined') {
        // Skip session wipe when no token was sent (e.g. before Zustand hydration)
        const headers = error.config?.headers;
        const hadAuthHeader = Boolean(
          headers?.Authorization || 
          headers?.authorization ||
          (headers?.get && (headers.get('Authorization') || headers.get('authorization')))
        );
        if (!hadAuthHeader) {
          return Promise.reject(error);
        }

        console.warn('Unauthorized 401 detected globally. Wiping session details...');
        
        // 1. Wipe direct localStorage tokens
        localStorage.removeItem('wavi_token');
        
        // 2. Clear admin cookies
        document.cookie = "wavi_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        // 3. Import useAuthStore dynamically to avoid circular dependencies and trigger logout
        try {
          const { useAuthStore } = await import('../store/useAuthStore.js');
          useAuthStore.getState().logout();
        } catch (e) {
          console.error('Failed to trigger Zustand store logout:', e);
        }

        // 4. Redirect only if not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?error=expired`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
