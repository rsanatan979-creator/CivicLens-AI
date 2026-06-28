import { axiosClient } from '../api/axiosClient';
import { UserProfile } from '../types';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: UserProfile }> => {
    return axiosClient.post('/auth/login', credentials);
  },
  
  register: async (data: RegisterData): Promise<{ token: string; user: UserProfile }> => {
    return axiosClient.post('/auth/register', data);
  },
  
  getProfile: async (): Promise<UserProfile> => {
    return axiosClient.get('/auth/profile');
  },
  
  updateProfile: async (data: { name?: string; pointsDelta?: number }): Promise<UserProfile> => {
    return axiosClient.put('/auth/profile', data);
  },

  getMapsApiKey: async (): Promise<{ apiKey: string }> => {
    return axiosClient.get('/config/maps');
  }
};
