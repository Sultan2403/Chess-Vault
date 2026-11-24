import { useRef } from "react";
import { Clock, Disc3 } from "lucide-react";
import { useInView } from "motion/react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { AnalyticsOverview, AnalyticsTimeClassStat } from "@chess-vault/shared";

interface ColorAndCadenceSectionProps {
  overview: AnalyticsOverview;
  byTimeClass: AnalyticsTimeClassStat[];
}

interface MiniPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      color: string;
    };
  }>;
}

function CustomOutcomeTooltip({ active, payload, total }: MiniPieTooltipProps & { total: number }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

  return (
    <div className="rounded bg-vault-surface-layer-3 border border-vault-border-base px-2.5 py-1.5 font-mono text-[10px] shadow-xl backdrop-blur-md">
      <div className="font-semibold text-vault-text-primary">{item.name}</div>
      <div className="font-bold mt-0.5" style={{ color: item.payload.color }}>
        {item.value.toLocaleString()} games ({pct}%)
      </div>
    </div>
  );
}

// Time class color mappings
const CADENCE_COLORS: Record<string, string> = {
  rapid: "#6366f1", // Royal Indigo
  blitz: "#d4af37", // Vault Archival Gold
  bullet: "#f97316", // Flame Orange
  daily: "#88d6af", // Pale Jade
  classical: "#06b6d4", // Electric Cyan
  correspondence: "#a855f7", // Amethyst
};

export function ColorAndCadenceSection({ overview, byTimeClass }: ColorAndCadenceSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isChartInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const white = overview.white;
  const black = overview.black;

  // First-move advantage differential
  const advantageDiff = Number((white.winPct - black.winPct).toFixed(1));

  // Color donut datasets
  const whiteData = [
    { name: "Wins", value: white.wins, color: "#10b981" },
    { name: "Draws", value: white.draws, color: "#71717a" },
    { name: "Losses", value: white.losses, color: "#f43f5e" },
  ];

  const blackData = [
    { name: "Wins", value: black.wins, color: "#10b981" },
    { name: "Draws", value: black.draws, color: "#71717a" },
    { name: "Losses", value: black.losses, color: "#f43f5e" },
  ];

  // Cadence volume pie dataset
  const cadenceData = byTimeClass.map((tc) => ({
    name: tc.timeClass.charAt(0).toUpperCase() + tc.timeClass.slice(1),
    timeClass: tc.timeClass,
    value: tc.total,
    winPct: tc.winPct,
    volumePct: tc.volumePct,
    color: CADENCE_COLORS[tc.timeClass.toLowerCase()] || "#94a3b8",
  }));

  return (
    <div ref={sectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Result Distribution by Color */}
      <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>PIECE COLOR ANALYSIS</span>
            <Disc3 size={14} className="text-vault-text-muted" />
          </div>
          <h2 className="font-display text-xl font-medium text-vault-text-primary mt-1">
            Result Distribution by Color
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {/* White Pieces Ring Card */}
            <div className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                <span className="h-2.5 w-2.5 rounded-xs bg-slate-100 border border-slate-300" />
                <span className="font-semibold text-vault-text-primary">AS WHITE</span>
                <span className="text-vault-text-muted">({white.total.toLocaleString()}g)</span>
              </div>

              {/* Centered Donut */}
              <div className="relative h-28 w-28 my-1">
                {isChartInView && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomOutcomeTooltip total={white.total} />} />
                      <Pie
                        data={whiteData}
                        dataKey="value"
                        innerRadius={36}
                        outerRadius={48}
                        stroke="transparent"
                        paddingAngle={3}
                      >
                        {whiteData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-sm font-bold text-vault-text-primary">
                    {white.winPct}%
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                    WIN RATE
                  </span>
                </div>
              </div>

              {/* Record Summary */}
              <div className="font-mono text-[11px] text-vault-text-secondary mt-2 text-center">
                <span className="text-emerald-400 font-semibold">{white.wins}W</span> ·{" "}
                <span className="text-neutral-400">{white.draws}D</span> ·{" "}
                <span className="text-rose-400">{white.losses}L</span>
              </div>
            </div>

            {/* Black Pieces Ring Card */}
            <div className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                <span className="h-2.5 w-2.5 rounded-xs bg-neutral-900 border border-neutral-700" />
                <span className="font-semibold text-vault-text-primary">AS BLACK</span>
                <span className="text-vault-text-muted">({black.total.toLocaleString()}g)</span>
              </div>

              {/* Centered Donut */}
              <div className="relative h-28 w-28 my-1">
                {isChartInView && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomOutcomeTooltip total={black.total} />} />
                      <Pie
                        data={blackData}
                        dataKey="value"
                        innerRadius={36}
                        outerRadius={48}
                        stroke="transparent"
                        paddingAngle={3}
                      >
                        {blackData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-sm font-bold text-vault-text-primary">
                    {black.winPct}%
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                    WIN RATE
                  </span>
                </div>
              </div>

              {/* Record Summary */}
              <div className="font-mono text-[11px] text-vault-text-secondary mt-2 text-center">
                <span className="text-emerald-400 font-semibold">{black.wins}W</span> ·{" "}
                <span className="text-neutral-400">{black.draws}D</span> ·{" "}
                <span className="text-rose-400">{black.losses}L</span>
              </div>
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

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
            {/* Cadence Volume Donut */}
            <div className="relative h-36 w-36 shrink-0">
              {isChartInView && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0].payload;
                        return (
                          <div className="rounded bg-vault-surface-layer-3 border border-vault-border-base px-2.5 py-1.5 font-mono text-[10px] shadow-xl backdrop-blur-md">
                            <div className="font-semibold text-vault-text-primary">{item.name}</div>
                            <div className="text-vault-text-secondary">
                              {Number(item.value).toLocaleString()} games ({item.volumePct}%)
                            </div>
                            <div className="font-bold text-emerald-400 mt-0.5">
                              {item.winPct}% Win Rate
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Pie
                      data={cadenceData}
                      dataKey="value"
                      innerRadius={44}
                      outerRadius={62}
                      stroke="transparent"
                      paddingAngle={3}
                    >
                      {cadenceData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-xs font-bold text-vault-text-primary">
                  {cadenceData.reduce((acc, c) => acc + c.value, 0).toLocaleString()}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-vault-text-muted">
                  GAMES
                </span>
              </div>
            </div>

            {/* Cadence Metrics Legend */}
            <div className="flex-1 w-full flex flex-col gap-2 font-mono text-xs">
              {cadenceData.slice(0, 4).map((c) => (
                <div
                  key={c.timeClass}
                  className="flex items-center justify-between p-2 rounded bg-vault-surface-container-lowest/60 border border-vault-border-base/40"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-semibold text-vault-text-primary">{c.name}</span>
                    <span className="text-[10px] text-vault-text-muted">({c.volumePct}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[11px] text-vault-text-secondary">
                      {c.value.toLocaleString()}g
                    </span>
                    <span className="font-bold text-emerald-400 text-xs">
                      {c.winPct}% WR
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
