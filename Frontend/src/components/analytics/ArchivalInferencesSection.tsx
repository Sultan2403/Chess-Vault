import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Brain } from "lucide-react";

export function ArchivalInferencesSection() {
  const teaserCards = [
    {
      tag: "INFERENCE #01",
      badge: "+8.2% EV DIFF",
      title: "The Albin's Edge",
      description:
        "When meeting 1.d4 with 1...d5 as Black, your conversion jumps to 58.2% — a remarkable 4.2% higher than your average Black repertoire.",
      meta: "Sample: 142 archived games",
    },
    {
      tag: "INFERENCE #02",
      badge: "64.1% CONV",
      title: "Marathon Fatigue vs Tenacity",
      description:
        "In deep terminal endgames lasting beyond 55 moves, your win rate climbs to 64.1%, outlasting short endgame tournaments and time-scramble blunders.",
      meta: "Sample: 491 marathon endgames",
    },
    {
      tag: "INFERENCE #03",
      badge: "59.4% PEAK",
      title: "The Sunday Morning Surge",
      description:
        "Your highest tactical accuracy across all days of the week occurs during early or Sunday mornings between 8:00 AM – 11:00 AM (0.24 pawns lower avg blunder loss).",
      meta: "Circadian playing pattern",
    },
  ];

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-vault-primary">
          <Sparkles size={14} />
          <span>CHESS VAULT INTELLIGENCE // ARCHIVAL INFERENCES</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-vault-surface-layer-2 border border-vault-border-base text-vault-primary">
            AI Inferences Preview
          </span>
        </div>
      </div>

      {/* 3 Teaser Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teaserCards.map((card) => (
          <div
            key={card.tag}
            className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-vault-border-interactive transition-colors"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-vault-text-muted">{card.tag}</span>
                <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {card.badge}
                </span>
              </div>

              <h4 className="font-display text-base font-medium text-vault-text-primary mt-2">
                {card.title}
              </h4>

              <p className="text-xs text-vault-text-secondary mt-2 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="border-t border-vault-border-base/40 pt-3 mt-4 flex items-center justify-between font-mono text-[10px] text-vault-text-muted">
              <span>{card.meta}</span>
              <span className="text-vault-primary">Coming Soon</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA to Insights Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-vault-primary/20 bg-vault-surface-container-lowest p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded bg-vault-primary/10 text-vault-primary shrink-0">
            <Brain size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold text-vault-text-primary">
              Looking for automated tactical intelligence and psychological profiling?
            </div>
            <p className="text-xs text-vault-text-secondary mt-0.5">
              Explore deep player telemetry, study notes, and smart collection summaries in the dedicated Insights hub.
            </p>
          </div>
        </div>

        <Link
          to="/insights"
          className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-xs font-semibold bg-vault-primary text-vault-surface hover:bg-vault-primary/90 transition-colors shrink-0 self-start sm:self-auto"
        >
          <span>View deeper insights in the Insights page</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
