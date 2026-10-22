import { CheckCircle2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import type { ImportCompleteType, ImportProgressType } from "../../types/socket";

type ImportProgressStepProps = {
  importStatusMessage: string;
  importProgress: ImportProgressType | null;
  importComplete: ImportCompleteType | null;
  onGoToDashboard: () => void;
};

export function ImportProgressStep({
  importStatusMessage,
  importProgress,
  importComplete,
  onGoToDashboard,
}: ImportProgressStepProps) {
  const isFinished = Boolean(importComplete?.success);

  return (
    <div className="py-4 text-center max-w-lg mx-auto space-y-6">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-vault-bronze font-semibold">
          {isFinished ? "Vault Ready" : "Building Your Vault"}
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-normal text-vault-text-primary tracking-tight mt-1">
          {isFinished ? "Your games are in the vault." : "Importing your chess history"}
        </h1>
        <p className="text-xs text-vault-text-secondary mt-1 max-w-sm mx-auto">
          {isFinished
            ? "Your match records and clock data are indexed and ready for exploration."
            : "We are fetching and indexing your games directly from your connected accounts."}
        </p>
      </div>

      {/* Progress & Milestone Card */}
      <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-6 space-y-4">
        <div className="grid h-14 w-14 mx-auto place-items-center rounded-full bg-vault-surface-container border border-vault-border-base">
          {isFinished ? (
            <CheckCircle2 size={28} className="text-vault-win" />
          ) : (
            <Loader2 size={26} className="animate-spin text-vault-bronze" />
          )}
        </div>

        <div>
          <p className="font-mono text-xs font-semibold text-vault-text-primary">
            {importStatusMessage}
          </p>
          {importProgress && !isFinished && (
            <p className="font-mono text-[11px] text-vault-bronze mt-1">
              Indexed {importProgress.processed} matches from {importProgress.platform}...
            </p>
          )}
        </div>

        {/* Ingestion Guidelines / Scope Box */}
        <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-3.5 text-left font-mono text-[11px] text-vault-text-muted space-y-2">
          <div className="flex items-center gap-1.5 text-vault-text-primary font-semibold">
            <Sparkles size={12} className="text-vault-bronze" />
            <span>Ingestion Status</span>
          </div>
          <p>
            &bull; <strong className="text-vault-text-secondary">Standard Rules:</strong> Rapid, Blitz, Bullet, Daily &amp; Classical matches are preserved.
          </p>
          <p>
            &bull; <strong className="text-vault-text-secondary">Omitted Variants:</strong> Unrated custom variants (Crazyhouse, Horde, etc.) are skipped to maintain FIDE standard notation accuracy.
          </p>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          type="button"
          variant="solid-bronze"
          onClick={onGoToDashboard}
          className="w-full sm:w-auto font-mono text-xs uppercase px-6 py-2.5 flex items-center justify-center gap-2"
        >
          {isFinished ? (
            <>
              Explore Your Vault <ArrowRight size={13} />
            </>
          ) : (
            "Continue in Background"
          )}
        </Button>
      </div>
    </div>
  );
}

