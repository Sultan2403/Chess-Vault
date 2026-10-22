import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { gamesApi } from "../apis";
import type {
  SearchGamesParams,
  SearchGamesResponse,
  GameResponse,
  FrontendImportGamesPayload,
  UpdateGamePayload,
  BulkAddFolderIdsResponse,
  BulkDeleteGamesResponse,
} from "../apis/api.games";
import { QUERY_KEYS } from "../constants/queryKeys";
import type {
  Game,
  BulkAddFolderIdsInput,
  BulkDeleteGamesInput,
} from "@chess-vault/shared";

export const useGames = (params?: SearchGamesParams) => {
  return useQuery<SearchGamesResponse, unknown, SearchGamesResponse>({
    queryKey: QUERY_KEYS.games.list(params),
    queryFn: () => gamesApi.getGames(params),
  });
};

export const useInfiniteGames = (params?: SearchGamesParams) => {
  return useInfiniteQuery<SearchGamesResponse, unknown>({
    queryKey: QUERY_KEYS.games.infiniteList(params),
    queryFn: ({ pageParam = 1 }) =>
      gamesApi.getGames({
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
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
  return useMutation({
    mutationFn: (data: FrontendImportGamesPayload) =>
      gamesApi.importGames(data),
  });
};

export const useBulkAddFolderIds = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkAddFolderIdsResponse, unknown, BulkAddFolderIdsInput>({
    mutationFn: (data: BulkAddFolderIdsInput) =>
      gamesApi.bulkAddFolderIds(data),
    onSuccess: (_result, { gameIds }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
      gameIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.games.detail(id),
        });
      });
    },
  });
};

export const useBulkDeleteGames = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkDeleteGamesResponse, unknown, BulkDeleteGamesInput>({
    mutationFn: (data: BulkDeleteGamesInput) => gamesApi.bulkDeleteGames(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    },
  });
};
