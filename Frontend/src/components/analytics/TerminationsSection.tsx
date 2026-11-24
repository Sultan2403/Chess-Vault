import { Skull, Timer, Flag } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { AnalyticsTerminations } from "@chess-vault/shared";

interface TerminationsSectionProps {
  terminations: AnalyticsTerminations;
}

interface TermTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    name: string;
    value: number;
    payload: {
      method: string;
      wins: number;
      losses: number;
      winLabel: string;
      lossLabel: string;
    };
  }>;
}

function CustomTermTooltip({ active, payload }: TermTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const total = data.wins + data.losses;
  const winPct = total > 0 ? ((data.wins / total) * 100).toFixed(1) : "0.0";

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-2/95 p-3 shadow-xl backdrop-blur-sm text-xs font-mono">
      <div className="font-semibold text-vault-text-primary mb-1.5 text-sm">
        {data.method} Resolution
      </div>
      <div className="flex flex-col gap-1 text-vault-text-secondary">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {data.winLabel}:
          </span>
          <span className="font-bold text-emerald-400">
            {data.wins.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            {data.lossLabel}:
          </span>
          <span className="font-bold text-rose-400">
            {data.losses.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-vault-border-base/40">
          <span>Decisive Win Rate:</span>
          <span className="font-bold text-vault-text-primary">{winPct}%</span>
        </div>
      </div>
    </div>
  );
}

export function TerminationsSection({ terminations }: TerminationsSectionProps) {
  const { winWays, lossWays } = terminations;

  const comparisonData = [
    {
      method: "Resignation",
      wins: winWays.resignation,
      losses: lossWays.resignation,
      winLabel: "Opponent Resigned",
      lossLabel: "You Resigned",
    },
    {
      method: "Checkmate",
      wins: winWays.checkmate,
      losses: lossWays.checkmate,
      winLabel: "Delivered Checkmate",
      lossLabel: "Checkmated",
    },
    {
      method: "Timeout (Flag)",
      wins: winWays.timeout,
      losses: lossWays.timeout,
      winLabel: "Opponent Flagged",
      lossLabel: "You Flagged",
    },
    {
      method: "Other Rules",
      wins: winWays.other,
      losses: lossWays.other,
      winLabel: "Rules Victory",
      lossLabel: "Rules Defeat",
    },
  ];

  const totalWins = winWays.checkmate + winWays.resignation + winWays.timeout + winWays.other;
  const totalLosses = lossWays.checkmate + lossWays.resignation + lossWays.timeout + lossWays.other;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vault-text-muted">
            DECISIVE RESOLUTION
          </span>
          <h2 className="font-display text-xl md:text-2xl font-medium text-vault-text-primary mt-0.5">
            Termination Breakdown & Battle Endings
          </h2>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs text-vault-text-secondary self-start sm:self-auto">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Decisive Wins: <strong className="text-vault-text-primary">{totalWins.toLocaleString()}</strong></span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Decisive Losses: <strong className="text-vault-text-primary">{totalLosses.toLocaleString()}</strong></span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Resignation */}
        <div className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded bg-emerald-500/10 text-emerald-400 shrink-0">
              <Flag size={16} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                OPPONENT RESIGNED
              </div>
              <div className="font-display text-lg font-semibold text-vault-text-primary mt-0.5">
                {winWays.resignation.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-vault-text-muted">
            vs {lossWays.resignation.toLocaleString()} you resigned
          </div>
        </div>

        {/* Checkmate */}
        <div className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded bg-indigo-500/10 text-indigo-400 shrink-0">
              <Skull size={16} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                CHECKMATES DELIVERED
              </div>
              <div className="font-display text-lg font-semibold text-vault-text-primary mt-0.5">
                {winWays.checkmate.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-vault-text-muted">
            vs {lossWays.checkmate.toLocaleString()} conceded
          </div>
        </div>

        {/* Timeout */}
        <div className="rounded-lg border border-vault-border-base bg-vault-surface-container-lowest/80 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded bg-amber-500/10 text-amber-400 shrink-0">
              <Timer size={16} />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                WON ON TIME (FLAG)
              </div>
              <div className="font-display text-lg font-semibold text-vault-text-primary mt-0.5">
                {winWays.timeout.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-vault-text-muted">
            vs {lossWays.timeout.toLocaleString()} you flagged
          </div>
        </div>
      </div>

      {/* Vertical Grouped Bar Chart */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[11px] uppercase tracking-wider text-vault-text-muted">
            DECISIVE RESOLUTION COMPARISON (VICTORIES VS DEFEATS)
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-vault-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-emerald-500" />
              Victories (You Won)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-rose-500" />
              Defeats (You Lost)
            </span>
          </div>
        </div>

        <div className="h-60 w-full pt-4 pb-2 px-2 rounded-md bg-vault-surface-container-lowest/60 border border-vault-border-base/40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 12, right: 16, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
              <XAxis
                dataKey="method"
                stroke="transparent"
                tick={{ fill: "var(--color-vault-text-muted)", fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="transparent"
                tick={{ fill: "var(--color-vault-text-muted)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTermTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 8, fontSize: 11, fontFamily: "monospace" }}
                iconSize={8}
              />
              <Bar
                dataKey="wins"
                name="Victories"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={42}
              />
              <Bar
                dataKey="losses"
                name="Defeats"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
