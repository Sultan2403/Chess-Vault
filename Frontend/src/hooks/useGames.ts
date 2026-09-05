import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gamesApi } from "../apis";
import type { ImportGamesPayload, SearchGamesParams } from "../apis/api.games";
import { QUERY_KEYS } from "../constants/queryKeys";

export const useGames = (params?: SearchGamesParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.games.list(params),
    queryFn: () => gamesApi.getGames(params),
  });
};

export const useGame = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.games.detail(id),
    queryFn: () => gamesApi.getGame(id),
    enabled: Boolean(id),
    // Instantly seed the query from any active cached games list queries if available!
    initialData: () => {
      const cachedLists = queryClient.getQueriesData<{ games?: any[] }>({
        queryKey: QUERY_KEYS.games.lists(),
      });

      for (const [, data] of cachedLists) {
        const found = data?.games?.find((g: any) => g.id === id);
        if (found) {
          return { success: true, game: found };
        }
      }
      return undefined;
    },
  });
};

export const useImportGames = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportGamesPayload) => gamesApi.importGames(data),
    onSuccess: () => {
      // Invalidate games cache so any visible tables / lists refresh with newly imported games
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    },
  });
};

