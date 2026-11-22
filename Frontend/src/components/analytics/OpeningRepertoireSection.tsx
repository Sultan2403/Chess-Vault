import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { AnalyticsOpenings } from "@chess-vault/shared";

interface OpeningRepertoireSectionProps {
  openings: AnalyticsOpenings;
}

export function OpeningRepertoireSection({ openings }: OpeningRepertoireSectionProps) {
  const [activeTab, setActiveTab] = useState<"white" | "black">("white");

  const list = activeTab === "white" ? openings.asWhite : openings.asBlack;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col gap-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vault-text-muted">
            THEORY & REPERTOIRE
          </span>
          <h2 className="font-display text-xl md:text-2xl font-medium text-vault-text-primary mt-0.5">
            Opening Repertoire Distribution
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex items-center rounded border border-vault-border-base bg-vault-surface-container-lowest p-0.5 text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("white")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "white"
                ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                : "text-vault-text-muted hover:text-vault-text-secondary"
            }`}
          >
            AS WHITE
          </button>
          <button
            onClick={() => setActiveTab("black")}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === "black"
                ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                : "text-vault-text-muted hover:text-vault-text-secondary"
            }`}
          >
            AS BLACK
          </button>
        </div>
      </div>

      {/* Openings Table / List */}
      <div className="flex flex-col divide-y divide-vault-border-base/40">
        {list.length === 0 ? (
          <p className="font-mono text-xs text-vault-text-muted py-6 text-center">
            No opening theory logged for this color yet.
          </p>
        ) : (
          list.slice(0, 8).map((op) => {
            const drawPct = safePct(op.draws, op.total);
            const lossPct = safePct(op.losses, op.total);

            return (
              <div
                key={`${op.color}-${op.name}`}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-vault-surface-container-lowest/40 px-2 rounded transition-colors"
              >
                {/* Left: Mini board icon + ECO + Name */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="grid h-9 w-9 place-items-center rounded border border-vault-border-base bg-vault-surface-layer-2 text-vault-primary shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {op.eco && (
                        <span className="font-mono text-[11px] font-semibold text-vault-primary uppercase bg-vault-primary/10 px-1.5 py-0.5 rounded">
                          {op.eco}
                        </span>
                      )}
                      <h4 className="font-display text-base font-medium text-vault-text-primary truncate">
                        {op.name}
                      </h4>
                    </div>
                    <div className="font-mono text-xs text-vault-text-muted mt-0.5">
                      {op.total.toLocaleString()} games recorded
                    </div>
                  </div>
                </div>

                {/* Right: Record & W/D/L Bar + Inspect Button */}
                <div className="flex items-center gap-4 sm:gap-6 self-end md:self-auto shrink-0 w-full md:w-auto justify-between md:justify-end">
                  {/* Win Rate badge */}
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {op.winPct}% Win Rate
                    </span>
                    <div className="font-mono text-[10px] text-vault-text-muted">
                      {op.wins} W · {op.draws} D · {op.losses} L
                    </div>
                  </div>

                  {/* Mini segmented bar */}
                  <div className="hidden sm:flex h-2 w-32 overflow-hidden rounded bg-vault-surface-layer-2">
                    <div style={{ width: `${op.winPct}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${drawPct}%` }} className="bg-neutral-500 h-full" />
                    <div style={{ width: `${lossPct}%` }} className="bg-rose-500 h-full" />
                  </div>

                  {/* Inspect in Bank Link */}
                  <Link
                    to={`/game-bank?search=${encodeURIComponent(op.name)}`}
                    className="inline-flex items-center gap-1 font-mono text-xs text-vault-text-secondary hover:text-vault-primary transition-colors py-1 px-2 rounded hover:bg-vault-surface-layer-2 border border-transparent hover:border-vault-border-base"
                  >
                    <span>Inspect in Bank</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function safePct(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}
