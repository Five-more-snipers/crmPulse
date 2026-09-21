// @ts-check
import axios from 'axios';

/**
 * Configured Axios instance with baseURL and credential support
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach token if exists
apiClient.interceptors.request.use(
  (config) => {
    // If token exists in memory/state, attach it
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Silent Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Will be wired up to auth state in Sprint 2+
    return Promise.reject(error);
  }
);

export default apiClient;
