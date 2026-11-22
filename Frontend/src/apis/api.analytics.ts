import api from "./api.client";
import type { AnalyticsData, AnalyticsQuery } from "@chess-vault/shared";

export interface AnalyticsResponse extends AnalyticsData {
  success: boolean;
  message?: string;
}

export const analyticsApi = {
  getAnalyticsData: (query: Partial<AnalyticsQuery> = {}): Promise<AnalyticsResponse> => {
    const params: Record<string, string> = {};
    if (query.platform && query.platform !== "all") {
      params.platform = query.platform;
    }
    if (query.timeClass && query.timeClass !== "all") {
      params.timeClass = query.timeClass;
    }
    if (query.from) {
      params.from = query.from;
    }
    if (query.to) {
      params.to = query.to;
    }
    return api.get("/analytics", { params });
  },
};

export default analyticsApi;
