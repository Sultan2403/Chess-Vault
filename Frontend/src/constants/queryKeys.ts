import type { SearchGamesParams } from "../apis/api.games";
import type { ListFoldersParams } from "../apis/api.folders";

export const QUERY_KEYS = {
  folders: {
    all: ["folders"] as const,
    lists: () => [...QUERY_KEYS.folders.all, "list"] as const,
    list: (params?: ListFoldersParams) =>
      [...QUERY_KEYS.folders.lists(), params ?? {}] as const,
    details: () => [...QUERY_KEYS.folders.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.folders.details(), id] as const,
  },
  games: {
    all: ["games"] as const,
    lists: () => [...QUERY_KEYS.games.all, "list"] as const,
    list: (params?: SearchGamesParams) =>
      [...QUERY_KEYS.games.lists(), params ?? {}] as const,
    details: () => [...QUERY_KEYS.games.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.games.details(), id] as const,
  },
} as const;

