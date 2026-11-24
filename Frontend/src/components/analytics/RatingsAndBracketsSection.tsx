import { useRef, useState } from "react";
import { Trophy, BarChart2 } from "lucide-react";
import { useInView } from "motion/react";
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
import { useAccountBootstrap } from "../../hooks/useAccount";
import type {
  AnalyticsPlatformRatingBrackets,
  AnalyticsRatingBracket,
  PlatformType,
} from "@chess-vault/shared";

interface RatingsAndBracketsSectionProps {
  ratingBrackets: AnalyticsPlatformRatingBrackets[];
}

interface BracketTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AnalyticsRatingBracket;
  }>;
}

function CustomBracketTooltip({ active, payload }: BracketTooltipProps) {
  if (!active || !payload?.length) return null;
  const b = payload[0].payload;

  return (
    <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-2/95 p-3 shadow-xl backdrop-blur-sm text-xs font-mono">
      <div className="font-semibold text-vault-primary mb-1 text-sm">
        Opponent Elo: {b.label}
      </div>
      <div className="flex flex-col gap-1 text-vault-text-secondary">
        <div className="flex items-center justify-between gap-4">
          <span>Volume:</span>
          <span className="font-bold text-vault-text-primary">
            {b.total.toLocaleString()} games
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Victories:</span>
          <span className="font-bold text-emerald-400">
            {b.wins.toLocaleString()} ({b.winPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export function RatingsAndBracketsSection({
  ratingBrackets,
}: RatingsAndBracketsSectionProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const isChartInView = useInView(chartRef, { once: true, amount: 0.2 });
  const { data: accountData } = useAccountBootstrap();
  const linkedAccounts = accountData?.linkedAccounts ?? [];

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | null>(null);

  // Normalize data defensively in case client has cached legacy flat brackets or new grouped brackets
  const isPlatformGrouped =
    ratingBrackets.length > 0 &&
    typeof ratingBrackets[0] === "object" &&
    "brackets" in ratingBrackets[0];

  const platformList: AnalyticsPlatformRatingBrackets[] = isPlatformGrouped
    ? ratingBrackets
    : ([
        {
          platform: "chess.com" as PlatformType,
          brackets: ratingBrackets as unknown as AnalyticsRatingBracket[],
        },
      ] as AnalyticsPlatformRatingBrackets[]);

  const activePlatformData =
    platformList.find((p) => p.platform === selectedPlatform) ?? platformList[0];
  const activeBrackets = activePlatformData?.brackets ?? [];

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
            <h2 className="font-display text-xl font-medium text-vault-text-primary">
              Performance by Rating Bracket
            </h2>

            {/* Platform tab switcher when multiple platforms exist */}
            {platformList.length > 1 && (
              <div className="inline-flex items-center rounded border border-vault-border-base bg-vault-surface-container-lowest p-0.5 text-xs font-mono self-start sm:self-auto">
                {platformList.map((pData) => {
                  const isSelected = activePlatformData?.platform === pData.platform;
                  return (
                    <button
                      key={pData.platform}
                      onClick={() => setSelectedPlatform(pData.platform)}
                      className={`px-2.5 py-0.5 rounded transition-colors ${
                        isSelected
                          ? "bg-vault-surface-layer-2 text-vault-text-primary font-semibold shadow-xs"
                          : "text-vault-text-muted hover:text-vault-text-secondary"
                      }`}
                    >
                      {pData.platform === "chess.com" ? "Chess.com" : "Lichess"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4">
            {platformList.length === 0 || activeBrackets.length === 0 ? (
              <p className="font-mono text-xs text-vault-text-muted py-8 text-center">
                No opponent rating bracket data available for this selection.
              </p>
            ) : (
              <div
                ref={chartRef}
                className="h-48 w-full pt-2 rounded-md bg-vault-surface-container-lowest/60 border border-vault-border-base/40 p-2"
              >
                {isChartInView && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={activeBrackets}
                      margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="transparent"
                        tick={{ fill: "rgb(var(--color-vault-text-muted))", fontSize: 10 }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="transparent"
                        tick={{ fill: "rgb(var(--color-vault-text-muted))", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 100]}
                        unit="%"
                        stroke="transparent"
                        tick={{ fill: "#10b981", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomBracketTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
                      <Bar
                        yAxisId="left"
                        dataKey="total"
                        name="Volume"
                        fill="#d4af37"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={36}
                      />
                      <Line
                        yAxisId="right"
                        dataKey="winPct"
                        name="Win Rate"
                        type="monotone"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ fill: "#34d399", r: 6 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-vault-border-base/40 pt-4 mt-6 text-xs text-vault-text-secondary font-mono">
          {activePlatformData?.platform
            ? `Calibrated specifically for ${activePlatformData.platform === "chess.com" ? "Chess.com" : "Lichess"} opponent rating distributions.`
            : "Lifelong rating calibration: Measure your win conversion and drawing margin against opponent tiers."}
        </div>
      </div>
    </div>
  );
}
