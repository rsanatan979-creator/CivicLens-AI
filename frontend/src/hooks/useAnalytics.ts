import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '../services/analytics.service';

export function useAnalytics() {
  const categoriesQuery = useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: AnalyticsService.getCategories,
    staleTime: 60000 * 5, // 5 min
  });

  const areasQuery = useQuery({
    queryKey: ['analytics', 'areas'],
    queryFn: AnalyticsService.getAreas,
    staleTime: 60000 * 5,
  });

  const severityQuery = useQuery({
    queryKey: ['analytics', 'severity'],
    queryFn: AnalyticsService.getSeverity,
    staleTime: 60000 * 5,
  });

  const resolutionQuery = useQuery({
    queryKey: ['analytics', 'resolution'],
    queryFn: AnalyticsService.getResolution,
    staleTime: 60000 * 5,
  });

  return {
    categories: categoriesQuery.data || [],
    areas: areasQuery.data || [],
    severity: severityQuery.data || [],
    resolution: resolutionQuery.data || [],
    isLoading:
      categoriesQuery.isLoading ||
      areasQuery.isLoading ||
      severityQuery.isLoading ||
      resolutionQuery.isLoading,
  };
}
