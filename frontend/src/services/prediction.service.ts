import { axiosClient } from '../api/axiosClient';

export const PredictionService = {
  getHotspots: async (): Promise<any[]> => {
    return axiosClient.get('/predictions');
  }
};
