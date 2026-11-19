import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { foldersApi } from "../apis";
import type {
  CreateFolderPayload,
  FolderGamesResponse,
  ListFoldersParams,
  ListFolderGamesParams,
  UpdateFolderPayload,
} from "../apis/api.folders";
import { QUERY_KEYS } from "../constants/queryKeys";

export const useFolders = (params?: ListFoldersParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.folders.list(params),
    queryFn: () => foldersApi.getFolders(params),
  });
};

export const useFolder = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.folders.detail(id),
    queryFn: () => foldersApi.getFolder(id),
    enabled: Boolean(id),
  });
};

export const useFolderSummary = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.folders.summary(id),
    queryFn: () => foldersApi.getFolderSummary(id),
    enabled: Boolean(id),
  });
};

export const useFolderGames = (
  id: string,
  params?: ListFolderGamesParams,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.folders.games(id, params),
    queryFn: () => foldersApi.getFolderGames(id, params),
    enabled: Boolean(id),
  });
};

export const useInfiniteFolderGames = (
  id: string,
  params?: Omit<ListFolderGamesParams, "page">,
) => {
  return useInfiniteQuery<FolderGamesResponse, unknown>({
    queryKey: [...QUERY_KEYS.folders.games(id), "infinite", params ?? {}],
    queryFn: ({ pageParam = 1 }) =>
      foldersApi.getFolderGames(id, {
        ...params,
        page: pageParam as number,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(id),
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderPayload) => foldersApi.createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.lists() });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderPayload }) =>
      foldersApi.updateFolder(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.lists() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.folders.detail(id),
      });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => foldersApi.deleteFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.folders.lists() });
    },
  });
};
