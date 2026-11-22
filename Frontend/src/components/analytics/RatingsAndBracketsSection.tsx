import { Trophy, BarChart2 } from "lucide-react";
import { useAccountBootstrap } from "../../hooks/useAccount";
import type { AnalyticsRatingBracket } from "@chess-vault/shared";

interface RatingsAndBracketsSectionProps {
  ratingBrackets: AnalyticsRatingBracket[];
}

export function RatingsAndBracketsSection({
  ratingBrackets,
}: RatingsAndBracketsSectionProps) {
  const { data: accountData } = useAccountBootstrap();
  const linkedAccounts = accountData?.linkedAccounts ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Active Elo Ratings */}
      <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>CALIBRATION BENCHMARKS</span>
            <Trophy size={14} className="text-vault-text-muted" />
          </div>
          <h2 className="font-display text-xl font-medium text-vault-text-primary mt-1">
            Active Elo Ratings
          </h2>

          <div className="mt-5 space-y-4">
            {linkedAccounts.length === 0 ? (
              <p className="font-mono text-xs text-vault-text-muted">
                No external platform accounts linked yet.
              </p>
            ) : (
              linkedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between rounded border border-vault-border-base bg-vault-surface-container-lowest p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold capitalize text-vault-text-primary">
                        {acc.platform === "chess.com" ? "Chess.com" : "Lichess"}
                      </span>
                      <span className="font-mono text-[10px] text-vault-text-muted uppercase px-1.5 py-0.5 rounded bg-vault-surface-layer-2 border border-vault-border-base">
                        Connected
                      </span>
                    </div>
                    <div className="font-mono text-xs text-vault-text-secondary mt-1">
                      Username: <strong className="text-vault-text-primary">{acc.username}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs text-emerald-400 font-bold">
                      Synced
                    </span>
                    <div className="font-mono text-[10px] text-vault-text-muted mt-0.5">
                      {acc.lastSyncedAt
                        ? `Updated ${new Date(acc.lastSyncedAt).toLocaleDateString()}`
                        : "Initial Sync"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-vault-border-base/40 pt-4 mt-6 text-xs text-vault-text-secondary font-mono">
          Ratings track external platform performance benchmarks synchronized with your personal archive.
        </div>
      </div>

      {/* 2. Performance by Rating Bracket */}
      <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>OPPONENT CALIBER</span>
            <BarChart2 size={14} className="text-vault-text-muted" />
          </div>
          <h2 className="font-display text-xl font-medium text-vault-text-primary mt-1">
            Performance by Rating Bracket
          </h2>

          <div className="mt-5 space-y-3.5">
            {ratingBrackets.map((bracket) => {
              return (
                <div key={bracket.bracket} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-medium text-vault-text-primary">
                      {bracket.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-vault-text-muted">
                        {bracket.total.toLocaleString()} games
                      </span>
                      <span
                        className={`font-semibold ${
                          bracket.winPct >= 50
                            ? "text-emerald-400"
                            : "text-vault-text-secondary"
                        }`}
                      >
                        {bracket.winPct}% WR
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-2 w-full overflow-hidden rounded bg-vault-surface-layer-2">
                    <div
                      style={{ width: `${bracket.winPct}%` }}
                      className={`h-full rounded transition-all ${
                        bracket.winPct >= 50 ? "bg-emerald-500" : "bg-vault-primary"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-vault-border-base/40 pt-4 mt-6 text-xs text-vault-text-secondary">
          Lifelong rating calibration: Measure your win conversion and drawing margin against elite, peer, and tactical opponent tiers.
        </div>
      </div>
    </div>
  );
}
