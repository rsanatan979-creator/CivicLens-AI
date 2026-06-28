import { axiosClient } from '../api/axiosClient';

export const UploadService = {
  uploadImage: async (base64Image: string): Promise<{ url: string }> => {
    return axiosClient.post('/upload', { image: base64Image });
  },

  predict: async (imageUrl: string): Promise<{
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assignedDept: string;
    confidence: number;
    description: string;
  }> => {
    return axiosClient.post('/predict', { imageUrl });
  }
};
