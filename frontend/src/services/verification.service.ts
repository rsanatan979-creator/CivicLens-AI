import { axiosClient } from '../api/axiosClient';

export const VerificationService = {
  vote: async (complaintId: string, voteType: 'valid' | 'duplicate' | 'resolved' = 'valid'): Promise<{ upvotes: number }> => {
    return axiosClient.post('/verifications', { complaintId, voteType });
  },
  
  getVotes: async (complaintId: string): Promise<any> => {
    return axiosClient.get(`/verifications/${complaintId}`);
  }
};
