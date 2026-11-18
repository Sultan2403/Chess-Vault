import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import socket from "../../sockets/socket";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type { Import, LinkedAccount } from "@chess-vault/shared";
import type {
  ImportProgressType,
  ImportCompleteType,
  ImportFailedType,
} from "../../types/socket";
import { useImportHistory, useStartImport } from "../../hooks/useImports";
import { Spinner } from "../ui/Spinner";

export interface ImportRunState {
  importId: string;
  linkedAccountId: string;
  platform: string;
  username?: string;
  status: "queued" | "running" | "completed" | "partial" | "failed";
  counters: {
    fetched: number;
    inserted: number;
    duplicates: number;
    skipped: number;
  };
  vaultUsage?: { current: number; limit: number };
  error?: { code?: string; message: string };
}

export interface Step3LiveStatusProps {
  linkedAccounts: LinkedAccount[];
  onComplete: (
    summary: { platform: string; inserted: number }[],
    failed: { platform: string; error?: { code?: string; message: string } }[]
  ) => void;
  onSkip: () => void;
}

function platformLabel(platform: string): string {
  return platform === "chess.com" ? "Chess.com" : "Lichess";
}

function StatusBadge({ status }: { status: ImportRunState["status"] }) {
  const configs = {
    queued: { label: "Queued", className: "text-vault-text-muted bg-vault-surface-layer-2 border-vault-border-base" },
    running: { label: "Importing...", className: "text-vault-bronze bg-vault-bronze/10 border-vault-bronze/30" },
    completed: { label: "Complete", className: "text-vault-win bg-vault-win/10 border-vault-win/30" },
    partial: { label: "Capped", className: "text-vault-draw bg-vault-draw/10 border-vault-draw/30" },
    failed: { label: "Failed", className: "text-vault-loss bg-vault-loss/10 border-vault-loss/30" },
  };
  const { label, className } = configs[status];
  return (
    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${className}`}>
      {label}
    </span>
  );
}

export function Step3LiveStatus({
  linkedAccounts,
  onComplete,
  onSkip,
}: Step3LiveStatusProps) {
  const [runs, setRuns] = useState<Map<string, ImportRunState>>(() => {
    const initial = new Map<string, ImportRunState>();
    for (const acc of linkedAccounts) {
      initial.set(acc.id, {
        importId: "",
        linkedAccountId: acc.id,
        platform: acc.platform,
        username: acc.username,
        status: "queued",
        counters: { fetched: 0, inserted: 0, duplicates: 0, skipped: 0 },
      });
    }
    return initial;
  });

  const hasCompletedRef = useRef(false);
  const retryMutation = useStartImport();

  // Hydrate from active imports on mount
  const { data: historyData } = useImportHistory({ status: "active" });

  useEffect(() => {
    if (!historyData?.history) return;
    const accountIds = new Set(linkedAccounts.map((a) => a.id));
    const activeImports = historyData.history.filter(
      (imp: Import) =>
        accountIds.has(imp.linkedAccountId) &&
        (imp.status === "queued" || imp.status === "running")
    );
    if (activeImports.length === 0) return;

    setRuns((prev) => {
      const next = new Map(prev);
      for (const imp of activeImports) {
        const existing = next.get(imp.linkedAccountId);
        next.set(imp.linkedAccountId, {
          ...existing,
          importId: imp.id,
          linkedAccountId: imp.linkedAccountId,
          platform: imp.platform,
          username: existing?.username,
          status: imp.status as ImportRunState["status"],
          counters: imp.counters ?? { fetched: 0, inserted: 0, duplicates: 0, skipped: 0 },
        });
      }
      return next;
    });
  }, [historyData, linkedAccounts]);

  // Socket subscriptions
  useEffect(() => {
    const resolveAccountId = (
      payloadLinkedAccountId: string | undefined,
      payloadImportId: string,
      currentMap: Map<string, ImportRunState>
    ): string => {
      if (payloadLinkedAccountId && currentMap.has(payloadLinkedAccountId)) {
        return payloadLinkedAccountId;
      }
      if (payloadLinkedAccountId) return payloadLinkedAccountId;
      // Fallback matching by importId or single account
      for (const [accId, state] of currentMap.entries()) {
        if (state.importId === payloadImportId) return accId;
      }
      if (linkedAccounts.length === 1) return linkedAccounts[0].id;
      return payloadImportId;
    };

    const handleProgress = (payload: ImportProgressType) => {
      setRuns((prev) => {
        const next = new Map(prev);
        const accountId = resolveAccountId(payload.linkedAccountId, payload.importId, prev);
        const existing = next.get(accountId);
        next.set(accountId, {
          ...existing,
          importId: payload.importId,
          linkedAccountId: accountId,
          platform: payload.platform,
          username: existing?.username,
          status: "running",
          counters: payload.counters,
          vaultUsage: payload.vaultUsage,
          error: existing?.error,
        });
        return next;
      });
    };

    const handleComplete = (payload: ImportCompleteType) => {
      setRuns((prev) => {
        const next = new Map(prev);
        const accountId = resolveAccountId(payload.linkedAccountId, payload.importId, prev);
        const existing = next.get(accountId);
        next.set(accountId, {
          ...existing,
          importId: payload.importId,
          linkedAccountId: accountId,
          platform: payload.platform,
          username: existing?.username,
          status: payload.status,
          counters: payload.counters,
          vaultUsage: existing?.vaultUsage,
        });
        return next;
      });
    };

    const handleFailed = (payload: ImportFailedType) => {
      setRuns((prev) => {
        const next = new Map(prev);
        const accountId = resolveAccountId(payload.linkedAccountId, payload.importId, prev);
        const existing = next.get(accountId);
        next.set(accountId, {
          ...existing,
          importId: payload.importId,
          linkedAccountId: accountId,
          platform: payload.platform,
          username: existing?.username,
          status: "failed",
          counters: existing?.counters ?? {
            fetched: 0,
            inserted: 0,
            duplicates: 0,
            skipped: 0,
          },
          error: payload.error,
        });
        return next;
      });
    };

    socket.on(SOCKET_EVENTS.IMPORT_PROGRESS, handleProgress);
    socket.on(SOCKET_EVENTS.IMPORT_COMPLETE, handleComplete);
    socket.on(SOCKET_EVENTS.IMPORT_FAILED, handleFailed);

    return () => {
      socket.off(SOCKET_EVENTS.IMPORT_PROGRESS, handleProgress);
      socket.off(SOCKET_EVENTS.IMPORT_COMPLETE, handleComplete);
      socket.off(SOCKET_EVENTS.IMPORT_FAILED, handleFailed);
    };
  }, [linkedAccounts]);

  // Check if all runs are terminal and fire onComplete
  useEffect(() => {
    if (runs.size === 0 || hasCompletedRef.current) return;

    const allRuns = Array.from(runs.values());
    const terminalStatuses = new Set<ImportRunState["status"]>(["completed", "partial", "failed"]);
    const allTerminal =
      allRuns.length >= linkedAccounts.length &&
      allRuns.every((r) => terminalStatuses.has(r.status));

    if (allTerminal) {
      const successfulRuns = allRuns.filter(
        (r) => r.status === "completed" || r.status === "partial"
      );
      const failedRuns = allRuns.filter((r) => r.status === "failed");

      if (successfulRuns.length > 0) {
        hasCompletedRef.current = true;
        const summary = successfulRuns.map((r) => ({
          platform: r.platform,
          inserted: r.counters.inserted,
        }));
        const failed = failedRuns.map((r) => ({
          platform: r.platform,
          error: r.error,
        }));
        onComplete(summary, failed);
      }
    }
  }, [runs, onComplete, linkedAccounts.length]);

  const allRuns = Array.from(runs.values());
  const hasFailures = allRuns.some((r) => r.status === "failed");
  const allFailed = allRuns.length > 0 && allRuns.every((r) => r.status === "failed");

  const handleRetry = async (run: ImportRunState) => {
    const linkedAccountId = run.linkedAccountId;
    if (!linkedAccountId) return;

    // Reset status to queued immediately for responsive UI
    setRuns((prev) => {
      const next = new Map(prev);
      const existing = next.get(linkedAccountId);
      if (existing) {
        next.set(linkedAccountId, {
          ...existing,
          status: "queued",
          error: undefined,
        });
      }
      return next;
    });

    try {
      await retryMutation.mutateAsync({ linkedAccountId });
    } catch (err: unknown) {
      setRuns((prev) => {
        const next = new Map(prev);
        const existing = next.get(linkedAccountId);
        if (existing) {
          next.set(linkedAccountId, {
            ...existing,
            status: "failed",
            error: {
              code: "RETRY_FAILED",
              message: err instanceof Error ? err.message : "Failed to restart import",
            },
          });
        }
        return next;
      });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-medium text-vault-text-primary">
          Import in progress
        </h1>
        <p className="text-sm text-vault-text-secondary">
          Hang tight — we're vaulting your games.
        </p>
      </div>

      <div className="space-y-4">
        {allRuns.map((run) => {
          const { linkedAccountId, platform, username, status, counters, vaultUsage, error } = run;
          const usagePct = vaultUsage
            ? Math.min(100, Math.round((vaultUsage.current / vaultUsage.limit) * 100))
            : null;

          return (
            <div
              key={linkedAccountId}
              className="bg-vault-surface-layer-1 border border-vault-border-base rounded-md p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-vault-text-primary">
                    {platformLabel(platform)}
                  </span>
                  {username && (
                    <span className="text-xs font-mono text-vault-text-muted">
                      ({username})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={status} />
                  {(status === "running" || status === "queued") && (
                    <Spinner className="w-3.5 h-3.5 text-vault-bronze" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { label: "Fetched", value: counters.fetched },
                    { label: "Added", value: counters.inserted },
                    { label: "Dupes", value: counters.duplicates },
                    { label: "Skipped", value: counters.skipped },
                  ] as const
                ).map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-vault-surface-layer-2 border border-vault-border-base rounded-md p-2 text-center"
                  >
                    <p className="text-xs font-mono text-vault-text-muted">{label}</p>
                    <p className="text-sm font-semibold text-vault-text-primary font-mono">
                      {value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {vaultUsage && usagePct !== null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-vault-text-muted">
                    <span>Vault usage</span>
                    <span>
                      {vaultUsage.current.toLocaleString()} / {vaultUsage.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-vault-surface-layer-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-vault-bronze rounded-full transition-all duration-500"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>
              )}

              {status === "failed" && error && (
                <div className="flex items-start gap-2 p-3 bg-vault-loss/10 border border-vault-loss/30 text-vault-loss text-xs rounded-md">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <p>{error.message}</p>
                    <button
                      type="button"
                      onClick={() => handleRetry(run)}
                      disabled={retryMutation.isPending}
                      className="flex items-center gap-1 text-vault-loss hover:opacity-80 transition-opacity font-mono font-medium disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry import</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {(hasFailures || allFailed) && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1.5 text-xs font-mono text-vault-text-secondary hover:text-vault-text-primary transition-colors"
          >
            <span>Continue to app anyway</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}