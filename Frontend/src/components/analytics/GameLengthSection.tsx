import { Link } from "react-router-dom";
import { Swords, Zap, ArrowUpRight } from "lucide-react";
import type { AnalyticsGameLength, AnalyticsMoveBucket } from "@chess-vault/shared";

interface GameLengthSectionProps {
  gameLength: AnalyticsGameLength;
  moveBuckets: AnalyticsMoveBucket[];
}

export function GameLengthSection({ gameLength, moveBuckets }: GameLengthSectionProps) {
  const { meanMoves, medianMoves, quickestWin, longestGame } = gameLength;

  // Find max count to scale histogram heights
  const maxCount = Math.max(...moveBuckets.map((b) => b.count), 1);

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col gap-6">
      {/* Header with Mean and Median */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vault-text-muted">
            DEPTH OF A BATTLE
          </span>
          <h2 className="font-display text-xl md:text-2xl font-medium text-vault-text-primary mt-0.5">
            Game Length & Move Duration
          </h2>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-vault-text-secondary self-start sm:self-auto">
          <span>Mean: <strong className="text-vault-text-primary">{meanMoves} Moves</strong></span>
          <span>·</span>
          <span>Median: <strong className="text-vault-text-primary">{medianMoves} Moves</strong></span>
        </div>
      </div>

      {/* Two Highlight Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quickest Win */}
        {quickestWin ? (
          <Link
            to={`/game/${quickestWin.gameId}`}
            className="flex items-center justify-between rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 hover:border-amber-500/40 hover:bg-vault-surface-layer-2/60 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded bg-amber-500/10 text-amber-500 shrink-0 group-hover:scale-105 transition-transform">
                <Zap size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  <span>QUICKEST DECISION WIN</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-vault-text-secondary mt-0.5">
                  <strong className="text-vault-text-primary group-hover:text-vault-primary transition-colors">
                    {quickestWin.movesCount} moves
                  </strong>{" "}
                  ({quickestWin.plies} plies) vs {quickestWin.opponentUsername}
                  <span className="text-vault-text-muted"> ({quickestWin.termination})</span>
                </div>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-amber-500">
              {quickestWin.plies} plies
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded bg-amber-500/10 text-amber-500 shrink-0">
                <Zap size={16} />
              </div>
              <div className="text-xs text-vault-text-muted">No decisive victories recorded</div>
            </div>
          </div>
        )}

        {/* Longest Marathon */}
        {longestGame ? (
          <Link
            to={`/game/${longestGame.gameId}`}
            className="flex items-center justify-between rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 hover:border-emerald-500/40 hover:bg-vault-surface-layer-2/60 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded bg-emerald-500/10 text-emerald-500 shrink-0 group-hover:scale-105 transition-transform">
                <Swords size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  <span>LONGEST MARATHON BATTLE</span>
                  <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-vault-text-secondary mt-0.5">
                  <strong className="text-vault-text-primary group-hover:text-emerald-400 transition-colors">
                    {longestGame.movesCount} moves
                  </strong>{" "}
                  ({longestGame.plies} plies) vs {longestGame.opponentUsername}
                  <span className="text-vault-text-muted"> ({longestGame.termination})</span>
                </div>
              </div>
            </div>
            <div className="font-mono text-xs font-bold text-emerald-500">
              {longestGame.plies} plies
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 opacity-60">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded bg-emerald-500/10 text-emerald-500 shrink-0">
                <Swords size={16} />
              </div>
              <div className="text-xs text-vault-text-muted">No extended battles recorded</div>
            </div>
          </div>
        )}
      </div>

      {/* Move Count Distribution Frequency Histogram */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-vault-text-muted">
          MOVE COUNT DISTRIBUTION FREQUENCY
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-40 pt-6 pb-2 px-2 rounded-md bg-vault-surface-container-lowest/60 border border-vault-border-base/40">
          {moveBuckets.map((b) => {
            const heightPct = Math.max(12, Math.round((b.count / maxCount) * 100));
            // Highlight highest frequency bucket
            const isPeak = b.count === maxCount && b.count > 0;

            return (
              <div key={b.bucket} className="flex flex-col items-center justify-end h-full group">
                {/* Tooltip / Label above bar */}
                <span className="font-mono text-[10px] sm:text-xs text-vault-text-muted mb-1.5 group-hover:text-vault-text-primary">
                  {b.percentage}%
                </span>

                {/* Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[64px] rounded-t transition-all ${
                    isPeak
                      ? "bg-vault-primary hover:brightness-110 shadow-xs"
                      : "bg-vault-surface-layer-2 hover:bg-vault-surface-layer-2/80"
                  }`}
                  title={`${b.label}: ${b.count.toLocaleString()} games (${b.percentage}%) - ${b.winPct}% Win Rate`}
                />

                {/* X-axis bucket label */}
                <span className="font-mono text-[10px] sm:text-xs text-vault-text-secondary mt-2 text-center">
                  {b.label}
                </span>
                <span className="font-mono text-[9px] text-vault-text-muted">
                  ({b.count.toLocaleString()})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
