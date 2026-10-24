import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { importsApi } from "../apis";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { StartImportInput } from "@chess-vault/shared";

export const useImportHistory = (params?: { status?: string }, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.imports.history(params?.status),
    queryFn: () => importsApi.getImportHistory(params),
    enabled,
  });

export const useStartImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartImportInput) => importsApi.startImport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.imports.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.bootstrap() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    },
  });
};
