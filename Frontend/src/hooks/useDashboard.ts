import { useQuery } from "@tanstack/react-query";
import { dashboardApi, type DashboardResponse } from "../apis";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { PlatformType } from "@chess-vault/shared";

export const useDashboard = (platform?: PlatformType | "all") => {
  return useQuery<DashboardResponse>({
    queryKey: QUERY_KEYS.dashboard.data(platform),
    queryFn: () => dashboardApi.getDashboardData(platform),
    staleTime: 30_000,
  });
};
