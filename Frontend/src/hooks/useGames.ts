import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gamesApi } from "../apis";
import type {
  SearchGamesParams,
  SearchGamesResponse,
  GameResponse,
  FrontendImportGamesPayload,
  UpdateGamePayload,
} from "../apis/api.games";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { Game } from "@chess-vault/shared";

export const useGames = (params?: SearchGamesParams) => {
  return useQuery<SearchGamesResponse, unknown, SearchGamesResponse>({
    queryKey: QUERY_KEYS.games.list(params),
    queryFn: () => gamesApi.getGames(params),
  });
};

export const useGame = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery<GameResponse, unknown, GameResponse>({
    queryKey: QUERY_KEYS.games.detail(id),
    queryFn: () => gamesApi.getGame(id),
    enabled: Boolean(id),
    // Instantly seed the query from any active cached games list queries if available!
    initialData: () => {
      const cachedLists = queryClient.getQueriesData<{ games?: Game[] }>({
        queryKey: QUERY_KEYS.games.lists(),
      });

      for (const [, data] of cachedLists) {
        const found = data?.games?.find((g: Game) => g.id === id);
        if (found) {
          return { success: true, game: found };
        }
      }
      return undefined;
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGamePayload }) =>
      gamesApi.updateGame(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.games.detail(id),
      });
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => gamesApi.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    },
  });
};

export const useImportGames = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FrontendImportGamesPayload) => gamesApi.importGames(data),
    onSuccess: () => {
      // Invalidate games cache so any visible tables / lists refresh with newly imported games
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    },
  });
};


