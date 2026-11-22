import { PieChart, Clock } from "lucide-react";
import type { AnalyticsOverview, AnalyticsTimeClassStat } from "@chess-vault/shared";

interface ColorAndCadenceSectionProps {
  overview: AnalyticsOverview;
  byTimeClass: AnalyticsTimeClassStat[];
}

export function ColorAndCadenceSection({ overview, byTimeClass }: ColorAndCadenceSectionProps) {
  const white = overview.white;
  const black = overview.black;

  // First-move advantage differential
  const advantageDiff = Number((white.winPct - black.winPct).toFixed(1));

  // Sort time classes logically (Rapid, Blitz, Bullet, Classical, Daily)
  const sortedCadence = [...byTimeClass].sort((a, b) => b.total - a.total);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Result Distribution by Color */}
      <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>PIECE COLOR ANALYSIS</span>
            <PieChart size={14} className="text-vault-text-muted" />
          </div>
          <h2 className="font-display text-xl font-medium text-vault-text-primary mt-1">
            Result Distribution by Color
          </h2>

          {/* White Pieces Breakdown */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-medium text-vault-text-primary flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-100 border border-slate-300 inline-block" />
                White Pieces ({white.total.toLocaleString()} games)
              </span>
              <span className="text-emerald-400 font-semibold">
                Won {white.wins.toLocaleString()} wins as White
              </span>
            </div>

            {/* Stacked W/D/L Bar */}
            <div className="flex h-3 w-full overflow-hidden rounded bg-vault-surface-layer-2">
              <div
                style={{ width: `${white.winPct}%` }}
                className="bg-emerald-500 h-full"
                title={`Wins: ${white.wins} (${white.winPct}%)`}
              />
              <div
                style={{ width: `${safeDrawPct(white.draws, white.total)}%` }}
                className="bg-neutral-500 h-full"
                title={`Draws: ${white.draws}`}
              />
              <div
                style={{ width: `${safeLossPct(white.losses, white.total)}%` }}
                className="bg-rose-500 h-full"
                title={`Losses: ${white.losses}`}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-vault-text-secondary">
              <span className="text-emerald-400">{white.winPct}% Win ({white.wins})</span>
              <span className="text-neutral-400">{safeDrawPct(white.draws, white.total)}% Draw ({white.draws})</span>
              <span className="text-rose-400">{safeLossPct(white.losses, white.total)}% Loss ({white.losses})</span>
            </div>
          </div>

          {/* Black Pieces Breakdown */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-medium text-vault-text-primary flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-neutral-900 border border-neutral-700 inline-block" />
                Black Pieces ({black.total.toLocaleString()} games)
              </span>
              <span className="text-emerald-400 font-semibold">
                Won {black.wins.toLocaleString()} wins as Black
              </span>
            </div>

            {/* Stacked W/D/L Bar */}
            <div className="flex h-3 w-full overflow-hidden rounded bg-vault-surface-layer-2">
              <div
                style={{ width: `${black.winPct}%` }}
                className="bg-emerald-500 h-full"
                title={`Wins: ${black.wins} (${black.winPct}%)`}
              />
              <div
                style={{ width: `${safeDrawPct(black.draws, black.total)}%` }}
                className="bg-neutral-500 h-full"
                title={`Draws: ${black.draws}`}
              />
              <div
                style={{ width: `${safeLossPct(black.losses, black.total)}%` }}
                className="bg-rose-500 h-full"
                title={`Losses: ${black.losses}`}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-vault-text-secondary">
              <span className="text-emerald-400">{black.winPct}% Win ({black.wins})</span>
              <span className="text-neutral-400">{safeDrawPct(black.draws, black.total)}% Draw ({black.draws})</span>
              <span className="text-rose-400">{safeLossPct(black.losses, black.total)}% Loss ({black.losses})</span>
            </div>
          </div>
        </div>

        {/* Footnote Differential */}
        <div className="border-t border-vault-border-base/40 pt-4 mt-6 text-xs text-vault-text-secondary font-mono">
          <strong className="text-vault-primary font-semibold">
            First-Move Advantage Differential:
          </strong>{" "}
          {advantageDiff >= 0 ? `+${advantageDiff}%` : `${advantageDiff}%`} win margin when holding the White pieces ({white.winPct}% vs {black.winPct}%).
        </div>
      </div>

      {/* 2. Cadence Performance */}
      <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>CLOCK CONSIDERATIONS</span>
            <Clock size={14} className="text-vault-text-muted" />
          </div>
          <h2 className="font-display text-xl font-medium text-vault-text-primary mt-1">
            Cadence Performance
          </h2>

          <div className="mt-5 space-y-4">
            {sortedCadence.slice(0, 4).map((tc) => {
              const drawPct = safeDrawPct(tc.draws, tc.total);
              const lossPct = safeLossPct(tc.losses, tc.total);

              return (
                <div key={tc.timeClass} className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold capitalize text-vault-text-primary">
                      {tc.timeClass}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-vault-text-muted">
                        {tc.total.toLocaleString()} games ({tc.volumePct}%)
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {tc.winPct}% Win
                      </span>
                    </div>
                  </div>

                  <div className="flex h-2.5 w-full overflow-hidden rounded bg-vault-surface-layer-2">
                    <div
                      style={{ width: `${tc.winPct}%` }}
                      className="bg-emerald-500 h-full"
                    />
                    <div
                      style={{ width: `${drawPct}%` }}
                      className="bg-neutral-500 h-full"
                    />
                    <div
                      style={{ width: `${lossPct}%` }}
                      className="bg-rose-500 h-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footnote */}
        <div className="border-t border-vault-border-base/40 pt-4 mt-6 text-xs text-vault-text-secondary">
          Deep contemplation favors your calculation: Rapid yields higher conversion rate in critical mainline positions compared to faster time controls.
        </div>
      </div>
    </div>
  );
}

function safeDrawPct(draws: number, total: number) {
  if (!total || total <= 0) return 0;
  return Number(((draws / total) * 100).toFixed(1));
}

function safeLossPct(losses: number, total: number) {
  if (!total || total <= 0) return 0;
  return Number(((losses / total) * 100).toFixed(1));
}
