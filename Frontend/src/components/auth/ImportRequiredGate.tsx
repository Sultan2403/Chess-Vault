import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAccountBootstrap } from "../../hooks/useAccount";
import { useStartImport } from "../../hooks/useImports";
import { Spinner } from "../ui/Spinner";

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
  const { data: bootstrap, isLoading } = useAccountBootstrap();
  const startImportMutation = useStartImport();
  const [syncing, setSyncing] = useState(false);

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
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-vault-card/60 border border-vault-border text-vault-primary shadow-sm">
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
      </div>

      <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-vault-text">
        {context.title}
      </h2>

      <p className="mb-8 text-sm leading-relaxed text-vault-text-secondary max-w-md">
        {context.description}
      </p>

      <button
        onClick={handleSyncAll}
        disabled={syncing || startImportMutation.isPending}
        className="inline-flex items-center gap-2 rounded-xl bg-vault-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-vault-primary/90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {syncing || startImportMutation.isPending ? (
          <>
            <Spinner className="h-4 w-4 text-white" />
            <span>Queuing Imports...</span>
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

      {startImportMutation.isSuccess && (
        <p className="mt-4 text-xs font-medium text-emerald-500">
          Import queued! Your games will appear shortly.
        </p>
      )}
    </div>
  );
}
