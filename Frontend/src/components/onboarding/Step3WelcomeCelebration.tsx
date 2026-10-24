import { Vault } from "lucide-react";
import { useCompleteOnboarding } from "../../hooks/useAccount";
import { Spinner } from "../ui/Spinner";
import { useNavigate } from "react-router-dom";

interface ImportSummaryItem {
  platform: string;
  inserted: number;
}

interface Step3WelcomeCelebrationProps {
  summary: ImportSummaryItem[];
}

function platformLabel(platform: string): string {
  return platform === "chess.com" ? "Chess.com" : "Lichess";
}

export function Step3WelcomeCelebration({ summary }: Step3WelcomeCelebrationProps) {
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();

  const totalInserted = summary.reduce((sum, s) => sum + s.inserted, 0);

  const handleEnterVault = async () => {
    try {
      await completeOnboarding.mutateAsync();
    } finally {
      // Navigate regardless — the AppGate will handle the redirect on next bootstrap
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-vault-bronze/10 border border-vault-bronze/30 flex items-center justify-center">
            <Vault className="w-8 h-8 text-vault-bronze" />
          </div>
        </div>
        <h1 className="text-2xl font-display font-medium text-vault-text-primary">
          Welcome to Chess Vault
        </h1>
        <p className="text-sm text-vault-text-secondary">
          Your games are vaulted and ready to explore.
        </p>
      </div>

      <div className="bg-vault-surface-layer-1 border border-vault-border-base rounded-md p-6 space-y-4">
        <p className="text-xs font-mono text-vault-text-muted uppercase tracking-wide">
          Import summary
        </p>

        <div className="space-y-2">
          {summary.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-vault-surface-layer-2 border border-vault-border-base rounded-md px-4 py-3"
            >
              <span className="text-sm font-medium text-vault-text-primary">
                {platformLabel(item.platform)}
              </span>
              <span className="text-sm font-mono text-vault-win">
                +{item.inserted.toLocaleString()} games
              </span>
            </div>
          ))}
        </div>

        {totalInserted === 0 && (
          <p className="text-xs text-vault-text-muted leading-relaxed">
            No new games were added — your vault may already be up to date, or no games
            were found on the connected accounts.
          </p>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleEnterVault}
            disabled={completeOnboarding.isPending}
            className="flex items-center gap-2 bg-vault-bronze hover:bg-vault-bronze-hover text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            {completeOnboarding.isPending ? (
              <>
                <Spinner className="w-4 h-4 text-white" />
                <span>Entering vault...</span>
              </>
            ) : (
              <span>Enter Vault</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
