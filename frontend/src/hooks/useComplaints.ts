import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ComplaintService } from '../services/complaint.service';
import { VerificationService } from '../services/verification.service';

export function useComplaints() {
  const queryClient = useQueryClient();

  const complaintsQuery = useQuery({
    queryKey: ['complaints'],
    queryFn: ComplaintService.getAll,
    staleTime: 30000, // 30s freshness
  });

  const createComplaintMutation = useMutation({
    mutationFn: ComplaintService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });

  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      ComplaintService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaints', data.id] });
    },
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: ComplaintService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: (id: string) => VerificationService.vote(id, 'valid'),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['verifications', id] });
    },
  });

  return {
    complaints: complaintsQuery.data || [],
    isLoading: complaintsQuery.isLoading,
    isError: complaintsQuery.isError,
    refetch: complaintsQuery.refetch,
    createComplaint: createComplaintMutation.mutateAsync,
    updateComplaint: updateComplaintMutation.mutateAsync,
    deleteComplaint: deleteComplaintMutation.mutateAsync,
    upvoteComplaint: upvoteMutation.mutateAsync,
  };
}
