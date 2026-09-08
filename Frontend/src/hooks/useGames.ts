import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gamesApi } from "../apis";
import type {
  SearchGamesParams,
  SearchGamesResponse,
  GameResponse,
  FrontendImportGamesPayload,
} from "../apis/api.games";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { Game } from "@chess-vault/shared";

export const useGames = (params?: SearchGamesParams) => {
  console.log("useGames params", params);
  return useQuery<SearchGamesResponse, unknown, SearchGamesResponse>({
    queryKey: QUERY_KEYS.games.list(params),
    queryFn: () => gamesApi.getGames(params),
    // Normalize API shapes: convert playedAt ISO strings -> Date objects
    select: (data: SearchGamesResponse) => {
      return {
        ...data,
        games: (data.games ?? []).map((g: Game | null) => ({
          ...g,
          playedAt: g?.playedAt ? new Date(g.playedAt) : g?.playedAt,
        })),
      } as SearchGamesResponse;
    },
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
    // Ensure single-game result has normalized playedAt as a Date
    select: (data: GameResponse) => {
      const game = data.game;
      if (game && game.playedAt && typeof game.playedAt === "string") {
        return { ...data, game: { ...game, playedAt: new Date(game.playedAt) } } as GameResponse;
      }
      return data;
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

