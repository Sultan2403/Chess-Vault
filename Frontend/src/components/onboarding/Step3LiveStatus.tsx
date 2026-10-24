import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import socket from "../../sockets/socket";
import { SOCKET_EVENTS } from "@chess-vault/shared";
import type { Import } from "@chess-vault/shared";
import type {
  ImportProgressType,
  ImportCompleteType,
  ImportFailedType,
} from "../../types/socket";
import { useImportHistory } from "../../hooks/useImports";
import { useStartImport } from "../../hooks/useImports";
import { Spinner } from "../ui/Spinner";

interface ImportRunState {
  importId: string;
  linkedAccountId?: string;
  platform: string;
  status: "queued" | "running" | "completed" | "partial" | "failed";
  counters: {
    fetched: number;
    inserted: number;
    duplicates: number;
    skipped: number;
  };
  vaultUsage?: { current: number; limit: number };
  error?: { code: string; message: string };
}

interface Step3LiveStatusProps {
  linkedAccountIds: string[];
  onComplete: (summary: { platform: string; inserted: number }[]) => void;
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
  linkedAccountIds,
  onComplete,
  onSkip,
}: Step3LiveStatusProps) {
  const [runs, setRuns] = useState<Map<string, ImportRunState>>(new Map());
  const hasCompletedRef = useRef(false);

  const retryMutation = useStartImport();

  // Hydrate from active imports on mount
  const { data: historyData } = useImportHistory({ status: "active" });

  useEffect(() => {
    if (!historyData?.history) return;
    const activeImports = historyData.history.filter((imp: Import) =>
      linkedAccountIds.includes(imp.linkedAccountId)
    );
    if (activeImports.length === 0) return;

    setRuns((prev) => {
      const next = new Map(prev);
      for (const imp of activeImports) {
        if (!next.has(imp.id)) {
          next.set(imp.id, {
            importId: imp.id,
            linkedAccountId: imp.linkedAccountId,
            platform: imp.platform,
            status: imp.status as ImportRunState["status"],
            counters: imp.counters ?? { fetched: 0, inserted: 0, duplicates: 0, skipped: 0 },
          });
        }
      }
      return next;
    });
  }, [historyData]);

  // Socket subscriptions
  useEffect(() => {
    const handleProgress = (payload: ImportProgressType) => {
      setRuns((prev) => {
        const next = new Map(prev);
        const existing = next.get(payload.importId);
        next.set(payload.importId, {
          ...existing,
          importId: payload.importId,
          platform: payload.platform,
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
        const existing = next.get(payload.importId);
        next.set(payload.importId, {
          ...existing,
          importId: payload.importId,
          platform: payload.platform,
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
        const existing = next.get(payload.importId);
        next.set(payload.importId, {
          ...existing,
          importId: payload.importId,
          platform: payload.platform,
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
  }, []);

  // Check if all runs are terminal and fire onComplete
  useEffect(() => {
    if (runs.size === 0 || hasCompletedRef.current) return;

    const allRuns = Array.from(runs.values());
    const terminalStatuses = new Set<ImportRunState["status"]>(["completed", "partial", "failed"]);
    const allTerminal = allRuns.every((r) => terminalStatuses.has(r.status));

    if (allTerminal) {
      const hasAnySuccess = allRuns.some(
        (r) => r.status === "completed" || r.status === "partial"
      );
      if (hasAnySuccess) {
        hasCompletedRef.current = true;
        const summary = allRuns.map((r) => ({
          platform: r.platform,
          inserted: r.counters.inserted,
        }));
        onComplete(summary);
      }
    }
  }, [runs, onComplete]);

  const allRuns = Array.from(runs.values());
  const hasFailures = allRuns.some((r) => r.status === "failed");
  const allFailed = allRuns.length > 0 && allRuns.every((r) => r.status === "failed");

  const handleRetry = async (run: ImportRunState) => {
    const linkedAccountId = run.linkedAccountId ?? linkedAccountIds[0];
    if (!linkedAccountId) return;
    try {
      await retryMutation.mutateAsync({ linkedAccountId });
    } catch {
      // error handled by mutation
    }
  };

  if (runs.size === 0) {
    return (
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-medium text-vault-text-primary">
            Import in progress
          </h1>
        </div>
        <div className="bg-vault-surface-layer-1 border border-vault-border-base rounded-md p-10 flex flex-col items-center gap-3 text-vault-text-muted">
          <Spinner className="w-6 h-6 text-vault-bronze" />
          <span className="text-xs font-mono">Waiting for import to begin...</span>
        </div>
      </div>
    );
  }

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
          const { importId, platform, status, counters, vaultUsage, error } = run;
          const usagePct = vaultUsage
            ? Math.min(100, Math.round((vaultUsage.current / vaultUsage.limit) * 100))
            : null;

          return (
            <div
              key={importId}
              className="bg-vault-surface-layer-1 border border-vault-border-base rounded-md p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-vault-text-primary">
                  {platformLabel(platform)}
                </span>
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
