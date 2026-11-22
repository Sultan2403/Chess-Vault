import { useState, useId } from "react";
import { Sparkles } from "lucide-react";
import type { AnalyticsActivityTrend, AnalyticsOptimalWindow } from "@chess-vault/shared";

interface ActivityVolumeChartProps {
  trends: AnalyticsActivityTrend[];
  optimalWindow: AnalyticsOptimalWindow | null;
}

export function ActivityVolumeChart({ trends, optimalWindow }: ActivityVolumeChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gradientId = useId();

  // If no trend data
  if (!trends || trends.length === 0) {
    return (
      <div className="rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6">
        <h3 className="font-display text-lg font-medium text-vault-text-primary">Activity & Game Volume</h3>
        <p className="font-mono text-xs text-vault-text-muted mt-2">No historical activity data recorded yet.</p>
      </div>
    );
  }

  // Find max count for Y scale
  const counts = trends.map((t) => t.count);
  const maxCount = Math.max(...counts, 10);
  const peakIndex = counts.indexOf(Math.max(...counts));

  // Chart Dimensions
  const width = 1000;
  const height = 240;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate points
  const points = trends.map((t, idx) => {
    const x = paddingX + (idx / Math.max(trends.length - 1, 1)) * chartWidth;
    const y = height - paddingBottom - (t.count / maxCount) * chartHeight;
    return { x, y, data: t };
  });

  // Construct SVG Path (smooth or straight)
  const linePath = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    // Bezier control points
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, "");

  // Area path closing at the bottom
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[peakIndex];

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

        <div className="flex items-center gap-1.5 self-start sm:self-auto rounded border border-vault-border-base bg-vault-surface-container-lowest p-0.5 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-vault-surface-layer-2 text-vault-text-primary font-medium text-[11px]">
            ALL HISTORY
          </span>
        </div>
      </div>

      {/* Interactive SVG Area Chart */}
      <div className="relative w-full overflow-hidden rounded-md bg-vault-surface-container-lowest/60 border border-vault-border-base/40 p-2 sm:p-4">
        {/* Active Hover / Peak Tooltip */}
        {activePoint && (
          <div
            className="absolute top-4 pointer-events-none transition-all duration-150 z-10"
            style={{
              left: `${Math.min(Math.max(activePoint.x - 90, 16), width - 200)}px`,
            }}
          >
            <div className="rounded border border-vault-primary/40 bg-vault-surface-layer-2/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-vault-primary">
                  {activePoint.data.period} {hoveredIndex === null ? "[Peak]" : ""}
                </span>
                <span className="font-mono text-xs text-vault-text-primary font-semibold">
                  {activePoint.data.count.toLocaleString()} games
                </span>
              </div>
              <div className="font-mono text-[10px] text-vault-text-secondary mt-0.5 flex items-center gap-1.5">
                <span className="text-emerald-400">{activePoint.data.wins} W</span>
                <span>·</span>
                <span className="text-neutral-400">{activePoint.data.draws} D</span>
                <span>·</span>
                <span className="text-rose-400">{activePoint.data.losses} L</span>
                <span className="text-vault-text-muted">({activePoint.data.winPct}% WR)</span>
              </div>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-64 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
            className="text-vault-text-muted"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
            className="text-vault-text-muted"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="currentColor"
            strokeOpacity="0.15"
            className="text-vault-text-muted"
          />

          {/* Gradient Area */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {points
            .filter((_, idx) => idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1 || idx === peakIndex)
            .map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                className="fill-vault-text-muted text-[11px] font-mono"
              >
                {p.data.period} {p === points[peakIndex] ? "(Peak)" : ""}
              </text>
            ))}

          {/* Interactive Hover Hit Areas */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={p.x - 12}
                y={paddingTop}
                width={24}
                height={chartHeight}
                fill="transparent"
              />
              {/* Highlight Dot for Hover or Peak */}
              {(hoveredIndex === idx || (hoveredIndex === null && idx === peakIndex)) && (
                <>
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={height - paddingBottom}
                    stroke="#D4AF37"
                    strokeOpacity="0.4"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#D4AF37"
                    stroke="#18181B"
                    strokeWidth="2"
                  />
                </>
              )}
            </g>
          ))}
        </svg>
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
