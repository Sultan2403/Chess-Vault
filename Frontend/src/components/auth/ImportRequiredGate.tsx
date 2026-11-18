import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAccountBootstrap } from "../../hooks/useAccount";
import { useImportHistory, useStartImport } from "../../hooks/useImports";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Spinner } from "../ui/Spinner";
import socket from "../../sockets/socket";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type { ImportProgressType, ImportFailedType } from "../../types/socket";

const ROUTE_CONTEXTS: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "No games imported yet",
    description:
      "You haven't imported your games yet. Sync your games to view your stats, ratings, and recent matches.",
  },
  "/game-bank": {
    title: "Your Game Bank is empty",
    description:
      "Your Game Bank is empty. Import your games to explore your archive and analyze your positions.",
  },
  "/collections": {
    title: "No collections to display",
    description:
      "No collections can be displayed right now. Import your games to begin organizing them into custom vaults.",
  },
};

export function ImportRequiredGate() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: bootstrap, isLoading } = useAccountBootstrap();
  const startImportMutation = useStartImport();
  const [syncing, setSyncing] = useState(false);
  const [liveInsertedCount, setLiveInsertedCount] = useState<number | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  // Check if any imports are active right now
  const { data: historyData } = useImportHistory(
    { status: "active" },
    !bootstrap?.hasGames
  );

  const hasActiveImportsFromDb = Boolean(
    historyData?.history &&
      historyData.history.some(
        (imp) => imp.status === "queued" || imp.status === "running"
      )
  );

  const isImporting = syncing || hasActiveImportsFromDb;

  // Listen to socket events for auto-refresh and progress tracking
  useEffect(() => {
    if (bootstrap?.hasGames) return;

    const handleProgress = (payload: ImportProgressType) => {
      setLiveInsertedCount((prev) =>
        Math.max(prev ?? 0, payload.counters.inserted)
      );
    };

    const handleComplete = () => {
      setSyncing(false);
      // Invalidate bootstrap so hasGames updates and unlocks this gate
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.bootstrap() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.lists() });
    };

    const handleFailed = (payload: ImportFailedType) => {
      setSyncing(false);
      setFailedMessage(
        payload.error?.message || "Import failed. Please try syncing again."
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account.bootstrap() });
    };

    socket.on(SOCKET_EVENTS.IMPORT_PROGRESS, handleProgress);
    socket.on(SOCKET_EVENTS.IMPORT_COMPLETE, handleComplete);
    socket.on(SOCKET_EVENTS.IMPORT_FAILED, handleFailed);

    return () => {
      socket.off(SOCKET_EVENTS.IMPORT_PROGRESS, handleProgress);
      socket.off(SOCKET_EVENTS.IMPORT_COMPLETE, handleComplete);
      socket.off(SOCKET_EVENTS.IMPORT_FAILED, handleFailed);
    };
  }, [bootstrap?.hasGames, queryClient]);

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  // If user has games, render the child routes directly
  if (bootstrap?.hasGames) {
    return <Outlet />;
  }

  // Find route contextual messaging or fallback
  const currentPath = Object.keys(ROUTE_CONTEXTS).find((path) =>
    location.pathname.startsWith(path),
  );
  const context = currentPath
    ? ROUTE_CONTEXTS[currentPath]
    : {
        title: "Import your games",
        description:
          "Sync your chess games to unlock your stats, archive, and match viewer.",
      };

  const handleSyncAll = async () => {
    if (!bootstrap?.linkedAccounts || bootstrap.linkedAccounts.length === 0) {
      return;
    }
    setFailedMessage(null);
    setSyncing(true);
    try {
      await Promise.all(
        bootstrap.linkedAccounts.map((account) =>
          startImportMutation.mutateAsync({
            linkedAccountId: account.id,
            trigger: account.lastSyncedAt ? "manual" : "onboarding",
          }),
        ),
      );
    } catch (err: unknown) {
      setFailedMessage(
        err instanceof Error ? err.message : "Failed to start import"
      );
      setSyncing(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-vault-card/60 border border-vault-border text-vault-primary shadow-sm">
        {isImporting ? (
          <Spinner className="h-8 w-8 text-vault-bronze" />
        ) : (
          <svg
            className="h-8 w-8 text-vault-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        )}
      </div>

      <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-vault-text">
        {isImporting ? "Import in progress..." : context.title}
      </h2>

      <p className="mb-8 text-sm leading-relaxed text-vault-text-secondary max-w-md">
        {isImporting
          ? "We're importing your games from your connected chess accounts. This screen will unlock automatically as soon as the import completes."
          : context.description}
      </p>

      {isImporting ? (
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl bg-vault-surface-layer-2 border border-vault-border-base px-5 py-2.5 text-xs font-mono text-vault-text-primary">
            <Spinner className="h-3.5 w-3.5 text-vault-bronze" />
            <span>
              {liveInsertedCount != null && liveInsertedCount > 0
                ? `${liveInsertedCount.toLocaleString()} games vaulted so far...`
                : "Processing games in queue..."}
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSyncAll}
          disabled={startImportMutation.isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-vault-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-vault-primary/90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {startImportMutation.isPending ? (
            <>
              <Spinner className="h-4 w-4 text-white" />
              <span>Starting Import...</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Sync Games Now</span>
            </>
          )}
        </button>
      )}

      {failedMessage && (
        <p className="mt-4 text-xs font-medium text-vault-loss">
          {failedMessage}
        </p>
      )}
    </div>
  );
}