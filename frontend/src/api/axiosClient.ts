import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from localStorage
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('civic_agent_jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unpack data and handle security events (e.g., 401 Session Expired)
axiosClient.interceptors.response.use(
  (response) => {
    // Unpack Express JSON envelope: { success: true, data: ... }
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    const apiError = {
      success: false,
      errorCode: 'UNKNOWN_ERROR',
      message: 'An unexpected network error occurred.',
      status: error.response?.status,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      Object.assign(apiError, error.response.data);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('civic_agent_jwt');
      localStorage.removeItem('civic_agent_user');
      window.dispatchEvent(new Event('auth_session_expired'));
    }

    return Promise.reject(apiError);
  }
);
