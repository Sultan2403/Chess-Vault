import { Link } from "react-router-dom";
import { Swords, Zap, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { AnalyticsGameLength, AnalyticsMoveBucket } from "@chess-vault/shared";

interface GameLengthSectionProps {
  gameLength: AnalyticsGameLength;
  moveBuckets: AnalyticsMoveBucket[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: AnalyticsMoveBucket;
  }>;
}

function CustomHistogramTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-2/95 p-3 shadow-xl backdrop-blur-sm text-xs font-mono">
      <div className="font-semibold text-vault-text-primary mb-1 text-sm">
        {item.label}
      </div>
      <div className="flex flex-col gap-1 text-vault-text-secondary">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Games Played:
          </span>
          <span className="font-bold text-vault-text-primary">
            {item.count.toLocaleString()} ({item.percentage}%)
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Win Rate:
          </span>
          <span className="font-bold text-emerald-400">
            {item.winPct}% ({item.wins.toLocaleString()} wins)
          </span>
        </div>
      </div>
    </div>
  );
}

export function GameLengthSection({ gameLength, moveBuckets }: GameLengthSectionProps) {
  const { meanMoves, medianMoves, quickestWin, longestGame } = gameLength;

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

      {/* Move Count Distribution Frequency Histogram & Win Rate Spline */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[11px] uppercase tracking-wider text-vault-text-muted">
            MOVE COUNT DISTRIBUTION & WIN CONVERSION SPLINE
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-vault-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-indigo-500" />
              Volume (Games)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Win Rate %
            </span>
          </div>
        </div>

        <div className="h-56 w-full pt-4 pb-2 px-2 rounded-md bg-vault-surface-container-lowest/60 border border-vault-border-base/40">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={moveBuckets}
              margin={{ top: 12, right: 16, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="label"
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#71717a"
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                unit="%"
                stroke="#10b981"
                tick={{ fill: "#10b981", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomHistogramTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
              />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
              <Line
                yAxisId="right"
                dataKey="winPct"
                type="monotone"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                activeDot={{ fill: "#34d399", r: 6, stroke: "#065f46", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
