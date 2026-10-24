import { Download } from "lucide-react";
import type { LinkedAccount } from "@chess-vault/shared";
import { Spinner } from "../ui/Spinner";

interface Step3ImportReadyProps {
  linkedAccounts: LinkedAccount[];
  onStartImport: () => void;
  isStarting: boolean;
}

export function Step3ImportReady({
  linkedAccounts,
  onStartImport,
  isStarting,
}: Step3ImportReadyProps) {
  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-medium text-vault-text-primary">
          Ready to import your games
        </h1>
        <p className="text-sm text-vault-text-secondary">
          We'll pull in your full game history from the accounts you connected.
        </p>
      </div>

      <div className="bg-vault-surface-layer-1 border border-vault-border-base rounded-md p-6 space-y-4">
        <p className="text-xs font-mono text-vault-text-muted uppercase tracking-wide">
          Importing from
        </p>

        <div className="space-y-2">
          {linkedAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between bg-vault-surface-layer-2 border border-vault-border-base rounded-md px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-vault-text-primary">
                  {account.username}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-vault-surface-layer-1 border border-vault-border-base text-vault-text-muted">
                  {account.platform}
                </span>
              </div>
              <Download className="w-4 h-4 text-vault-text-muted" />
            </div>
          ))}
        </div>

        <p className="text-xs text-vault-text-muted leading-relaxed">
          This may take a moment depending on your game count. You'll see live progress
          on the next screen.
        </p>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onStartImport}
            disabled={isStarting}
            className="flex items-center gap-2 bg-vault-bronze hover:bg-vault-bronze-hover text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Spinner className="w-4 h-4 text-white" />
                <span>Starting import...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Import My Games</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
