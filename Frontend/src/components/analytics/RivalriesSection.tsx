import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { AnalyticsOpponents } from "@chess-vault/shared";

interface RivalriesSectionProps {
  opponents: AnalyticsOpponents;
}

export function RivalriesSection({ opponents }: RivalriesSectionProps) {
  const { topRivals } = opponents;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vault-text-muted">
            ANTHOLOGIES & HEAD-TO-HEAD
          </span>
          <h2 className="font-display text-xl md:text-2xl font-medium text-vault-text-primary mt-0.5">
            Frequent Opponents & Rivalries
          </h2>
        </div>

        <div className="font-mono text-xs text-vault-text-secondary self-start sm:self-auto">
          Sort: <strong className="text-vault-text-primary">MOST FREQUENT / LONGEST H2H</strong>
        </div>
      </div>

      {topRivals.length === 0 ? (
        <p className="font-mono text-xs text-vault-text-muted py-6 text-center">
          No repeat rivalries recorded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topRivals.slice(0, 4).map((rival) => {
            const drawPct = safePct(rival.draws, rival.total);
            const lossPct = safePct(rival.losses, rival.total);

            const lastBattleDate = rival.lastPlayedAt
              ? new Date(rival.lastPlayedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—";

            return (
              <div
                key={rival.username}
                className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 flex flex-col justify-between group hover:border-vault-border-interactive transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-display text-base font-medium text-vault-text-primary truncate">
                        {rival.username}
                      </h4>
                      <div className="font-mono text-[11px] text-vault-text-muted capitalize">
                        {rival.platform || "Chess.com"} · {rival.rating ? `Elo ${rival.rating}` : "Rated"}
                      </div>
                    </div>

                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        rival.winPct >= 50
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {rival.winPct}%
                    </span>
                  </div>

                  {/* Encounters & H2H record */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between font-mono text-xs">
                      <span className="text-vault-text-muted">
                        {rival.total} encounters
                      </span>
                      <span className="font-semibold text-vault-text-primary">
                        {rival.wins} W - {rival.draws} D - {rival.losses} L
                      </span>
                    </div>

                    {/* Mini segmented bar */}
                    <div className="flex h-1.5 w-full overflow-hidden rounded bg-vault-surface-layer-2 mt-2">
                      <div style={{ width: `${rival.winPct}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${drawPct}%` }} className="bg-neutral-500 h-full" />
                      <div style={{ width: `${lossPct}%` }} className="bg-rose-500 h-full" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-vault-border-base/40 pt-3 mt-4 flex items-center justify-between font-mono text-[11px] text-vault-text-muted">
                  <span>LAST: {lastBattleDate}</span>
                  <Link
                    to={`/game-bank?search=${encodeURIComponent(rival.username)}`}
                    className="inline-flex items-center gap-0.5 text-vault-text-secondary hover:text-vault-primary transition-colors"
                  >
                    <span>Games</span>
                    <ArrowUpRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function safePct(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}
