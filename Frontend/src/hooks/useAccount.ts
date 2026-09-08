import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ConnectLinkedAccountsInput, Game } from "@chess-vault/shared";
import { accountApi } from "../apis";
import { QUERY_KEYS } from "../constants/queryKeys";

export const useAccountBootstrap = (enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.account.bootstrap(),
    queryFn: accountApi.getBootstrap,
    enabled,
  });

export const usePlatformUsernames = () => {
  const { data } = useAccountBootstrap();

  return useMemo(
    () =>
      (data?.linkedAccounts ?? []).reduce<
        Partial<Record<Game["platform"], string>>
      >((usernames, account) => {
        usernames[account.platform] = account.username;
        return usernames;
      }, {}),
    [data?.linkedAccounts],
  );
};

export const useConnectLinkedAccounts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectLinkedAccountsInput) =>
      accountApi.connectLinkedAccounts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    },
  });
};

export const useVerifyLinkedAccount = () =>
  useMutation({ mutationFn: accountApi.verifyLinkedAccount });

export const useSyncLinkedAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountApi.syncLinkedAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    },
  });
};
