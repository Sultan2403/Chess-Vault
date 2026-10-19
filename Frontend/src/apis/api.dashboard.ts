import api from "./api.client";
import type { DashboardData, PlatformType } from "@chess-vault/shared";

export interface DashboardResponse extends DashboardData {
  success: boolean;
  message?: string;
}

export const dashboardApi = {
  getDashboardData: (platform?: PlatformType | "all"): Promise<DashboardResponse> => {
    const params: Record<string, string> = {};
    if (platform && platform !== "all") {
      params.platform = platform;
    }
    return api.get("/dashboard", { params });
  },
};

export default dashboardApi;
