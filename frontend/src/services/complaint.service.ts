import { axiosClient } from '../api/axiosClient';
import { Report } from '../types';

export interface CreateComplaintPayload {
  title: string;
  description: string;
  category: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  imageUrl: string;
  locationName: string;
  latitude: number;
  longitude: number;
  assignedDept: string;
  aiConfidence?: number;
}

export interface UpdateComplaintPayload {
  status?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedDept?: string;
}

export const ComplaintService = {
  create: async (payload: CreateComplaintPayload): Promise<Report> => {
    return axiosClient.post('/complaints', payload);
  },
  
  getAll: async (): Promise<Report[]> => {
    return axiosClient.get('/complaints');
  },
  
  getById: async (id: string): Promise<Report> => {
    return axiosClient.get(`/complaints/${id}`);
  },
  
  update: async (id: string, updates: UpdateComplaintPayload): Promise<Report> => {
    return axiosClient.put(`/complaints/${id}`, updates);
  },
  
  delete: async (id: string): Promise<void> => {
    return axiosClient.delete(`/complaints/${id}`);
  }
};
