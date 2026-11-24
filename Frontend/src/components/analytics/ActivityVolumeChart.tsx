import { Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { AnalyticsActivityTrend, AnalyticsOptimalWindow } from "@chess-vault/shared";

interface ActivityVolumeChartProps {
  trends: AnalyticsActivityTrend[];
  optimalWindow: AnalyticsOptimalWindow | null;
}

interface ActivityTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AnalyticsActivityTrend;
  }>;
}

function CustomActivityTooltip({ active, payload }: ActivityTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-2/95 p-3 shadow-xl backdrop-blur-sm text-xs font-mono">
      <div className="flex items-center justify-between gap-3 mb-1.5 border-b border-vault-border-base/40 pb-1">
        <span className="font-bold text-vault-primary text-sm">{item.period}</span>
        <span className="font-semibold text-vault-text-primary">
          {item.count.toLocaleString()} games
        </span>
      </div>
      <div className="flex flex-col gap-1 text-vault-text-secondary">
        <div className="flex items-center justify-between gap-4">
          <span>Record:</span>
          <span className="font-semibold">
            <span className="text-emerald-400">{item.wins}W</span> ·{" "}
            <span className="text-neutral-400">{item.draws}D</span> ·{" "}
            <span className="text-rose-400">{item.losses}L</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Win Rate:</span>
          <span className="font-bold text-emerald-400">{item.winPct}%</span>
        </div>
      </div>
    </div>
  );
}

export function ActivityVolumeChart({ trends, optimalWindow }: ActivityVolumeChartProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6">
        <h3 className="font-display text-lg font-medium text-vault-text-primary">Activity & Game Volume</h3>
        <p className="font-mono text-xs text-vault-text-muted mt-2">No historical activity data recorded yet.</p>
      </div>
    );
  }

  // Calculate peak for summary header
  const peak = trends.reduce((max, t) => (t.count > max.count ? t : max), trends[0]);

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col gap-6">
      {/* Title & Filter Options */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-vault-text-muted">
            VOLUME OVER TIME
          </span>
          <h2 className="font-display text-xl md:text-2xl font-medium text-vault-text-primary mt-0.5">
            Activity & Game Volume
          </h2>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-vault-text-secondary self-start sm:self-auto">
          {peak && (
            <span>
              Peak Month: <strong className="text-vault-primary">{peak.period}</strong> ({peak.count.toLocaleString()} games)
            </span>
          )}
          <span className="px-2.5 py-1 rounded border border-vault-border-base bg-vault-surface-container-lowest text-vault-text-primary font-medium text-[11px]">
            ALL ARCHIVED MONTHS
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full pt-4 pb-2 px-2 rounded-md bg-vault-surface-container-lowest/60 border border-vault-border-base/40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="vaultActivityGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#d4af37" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="period"
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<CustomActivityTooltip />}
              cursor={{ stroke: "#d4af37", strokeWidth: 1.5, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#d4af37"
              strokeWidth={2.5}
              fill="url(#vaultActivityGold)"
              dot={{ fill: "#d4af37", r: 3, strokeWidth: 0 }}
              activeDot={{ fill: "#f59e0b", r: 6, stroke: "#18181b", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Optimal Performance Window Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-vault-primary/20 bg-vault-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-7 w-7 place-items-center rounded bg-vault-primary/20 text-vault-primary shrink-0">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-vault-primary">
              Optimal Performance Window
            </div>
            <p className="text-xs sm:text-sm text-vault-text-secondary mt-0.5">
              {optimalWindow ? (
                <>
                  You play most decisively on{" "}
                  <strong className="text-vault-text-primary">
                    {optimalWindow.dayOfWeek} {optimalWindow.timeSlot.toLowerCase()}
                  </strong>{" "}
                  ({optimalWindow.gamesCount} games,{" "}
                  <strong className="text-emerald-400">{optimalWindow.winPct}% Win Rate</strong>).
                </>
              ) : (
                "Decisive performance windows calculate continuously as games accumulate."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px] text-vault-text-muted self-end sm:self-auto">
          <span>Activity Concentration</span>
          <div className="flex items-center gap-0.5 ml-1">
            <span className="h-2 w-2 rounded-xs bg-vault-surface-layer-2" />
            <span className="h-2 w-2 rounded-xs bg-vault-primary/40" />
            <span className="h-2 w-2 rounded-xs bg-vault-primary/80" />
            <span className="h-2 w-2 rounded-xs bg-vault-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
