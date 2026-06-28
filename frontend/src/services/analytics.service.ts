import { axiosClient } from '../api/axiosClient';

export const AnalyticsService = {
  getCategories: async (): Promise<any[]> => {
    return axiosClient.get('/analytics/categories');
  },
  getAreas: async (): Promise<any[]> => {
    return axiosClient.get('/analytics/areas');
  },
  getSeverity: async (): Promise<any[]> => {
    return axiosClient.get('/analytics/severity');
  },
  getResolution: async (): Promise<any> => {
    return axiosClient.get('/analytics/resolution');
  }
};
