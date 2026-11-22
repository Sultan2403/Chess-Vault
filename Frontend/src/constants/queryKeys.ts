import type { SearchGamesParams } from "../apis/api.games";
import type { ListFoldersParams, ListFolderGamesParams } from "../apis/api.folders";

export const QUERY_KEYS = {
  account: {
    all: ["account"] as const,
    bootstrap: () => [...QUERY_KEYS.account.all, "bootstrap"] as const,
  },
  folders: {
    all: ["folders"] as const,
    lists: () => [...QUERY_KEYS.folders.all, "list"] as const,
    list: (params?: ListFoldersParams) =>
      [...QUERY_KEYS.folders.lists(), params ?? {}] as const,
    details: () => [...QUERY_KEYS.folders.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.folders.details(), id] as const,
    summary: (id: string) => [...QUERY_KEYS.folders.details(), id, "summary"] as const,
    games: (id: string, params?: ListFolderGamesParams) =>
      [...QUERY_KEYS.folders.details(), id, "games", params ?? {}] as const,
  },
  games: {
    all: ["games"] as const,
    lists: () => [...QUERY_KEYS.games.all, "list"] as const,
    list: (params?: SearchGamesParams) =>
      [...QUERY_KEYS.games.lists(), params ?? {}] as const,
    infiniteList: (params?: SearchGamesParams) =>
      [...QUERY_KEYS.games.lists(), "infinite", params ?? {}] as const,
    details: () => [...QUERY_KEYS.games.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.games.details(), id] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    data: (platform?: string) => [...QUERY_KEYS.dashboard.all, platform ?? "all"] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    data: (query?: Record<string, any>) => [...QUERY_KEYS.analytics.all, query ?? {}] as const,
  },
  imports: {
    all: ["imports"] as const,
    history: (status?: string) => [...QUERY_KEYS.imports.all, "history", status ?? "all"] as const,
  },
} as const;
