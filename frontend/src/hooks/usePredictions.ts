import { useQuery } from '@tanstack/react-query';
import { PredictionService } from '../services/prediction.service';

export function usePredictions() {
  const predictionsQuery = useQuery({
    queryKey: ['predictions'],
    queryFn: PredictionService.getHotspots,
    staleTime: 60000 * 10, // 10 min
  });

  return {
    predictions: predictionsQuery.data || [],
    isLoading: predictionsQuery.isLoading,
    isError: predictionsQuery.isError,
  };
}
