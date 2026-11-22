import { useQuery } from "@tanstack/react-query";
import { analyticsApi, type AnalyticsResponse } from "../apis";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { AnalyticsQuery } from "@chess-vault/shared";

export const useAnalytics = (query: Partial<AnalyticsQuery> = {}) => {
  return useQuery<AnalyticsResponse>({
    queryKey: QUERY_KEYS.analytics.data(query),
    queryFn: () => analyticsApi.getAnalyticsData(query),
  });
};
