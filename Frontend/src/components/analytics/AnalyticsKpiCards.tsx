import { Trophy, Clock, History } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AnalyticsData } from "@chess-vault/shared";

interface OutcomeTooltipProps {
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

function OutcomeTooltip({ active, payload, totalGames }: OutcomeTooltipProps & { totalGames: number }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const pct = totalGames > 0
    ? ((Number(entry.value) / totalGames) * 100).toFixed(1)
    : "0";
  return (
    <div className="rounded bg-vault-surface-layer-3 border border-vault-border-base px-2 py-1 font-mono text-[10px] shadow-lg">
      <span className="font-semibold text-vault-text-primary">{entry.name}: </span>
      <span style={{ color: entry.payload.color }}>
        {Number(entry.value).toLocaleString()} ({pct}%)
      </span>
    </div>
  );
}

export function AnalyticsKpiCards({ data }: { data: AnalyticsData }) {
  const { overview, archiveSpan, byTimeClass, streaks } = data;
  const shouldReduceMotion = useReducedMotion();

  // Primary Cadence: highest total games
  const primaryCadence = byTimeClass.length > 0 ? byTimeClass[0] : null;

  // Format first log date
  const firstLogFormatted = archiveSpan.firstGameAt
    ? new Date(archiveSpan.firstGameAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  // Donut chart segments for Outcome split
  const outcomeData = [
    { name: "Wins", value: overview.wins, color: "#10b981" },
    { name: "Draws", value: overview.draws, color: "#737373" },
    { name: "Losses", value: overview.losses, color: "#f43f5e" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: shouldReduceMotion ? 0 : 0.08 },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* 1. OVERALL RECORD WITH INTERACTIVE DONUT */}
      <motion.div
        variants={cardVariants}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col justify-between rounded-lg border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
      >
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Overall Record</span>
            <span className="text-[10px] bg-vault-surface-layer-2 px-1.5 py-0.5 rounded text-vault-text-secondary border border-vault-border-base">
              W-D-L
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary">
                  {overview.winPct}%
                </span>
                <span className="font-mono text-xs text-vault-text-muted">
                  Win Rate
                </span>
              </div>
              <div className="font-mono text-xs text-vault-text-secondary mt-0.5">
                {overview.totalGames.toLocaleString()} Total Games
              </div>
            </div>

            {/* Mini Donut Chart */}
            <div className="h-16 w-16 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<OutcomeTooltip totalGames={overview.totalGames} />} />
                  <Pie
                    data={outcomeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    stroke="transparent"
                    paddingAngle={2}
                  >
                    {outcomeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Counts */}
          <div className="flex items-center justify-between font-mono text-xs mt-3 pt-2 border-t border-vault-border-base/40 text-vault-text-secondary">
            <span className="text-emerald-400 font-medium">
              {overview.wins.toLocaleString()} W <span className="text-vault-text-muted text-[10px]">({overview.winPct}%)</span>
            </span>
            <span className="text-neutral-400 font-medium">
              {overview.draws.toLocaleString()} D <span className="text-vault-text-muted text-[10px]">({overview.drawPct}%)</span>
            </span>
            <span className="text-rose-400 font-medium">
              {overview.losses.toLocaleString()} L <span className="text-vault-text-muted text-[10px]">({overview.lossPct}%)</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-3 font-mono text-[11px] text-vault-text-muted">
          <span>PRACTICAL OUTCOME: <strong className="text-vault-text-primary">{overview.practicalOutcomeIndex}%</strong></span>
          <span>STREAK: <strong className="text-vault-text-primary">+{streaks.longestWinStreak}W</strong></span>
        </div>
      </motion.div>

      {/* 2. PRIMARY CADENCE */}
      <motion.div
        variants={cardVariants}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col justify-between rounded-lg border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
      >
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Primary Cadence</span>
            <Clock size={14} className="text-vault-text-muted" />
          </div>

          <div className="mt-2">
            <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary capitalize">
              {primaryCadence ? primaryCadence.timeClass : "Standard"}
            </span>
          </div>

          <p className="font-mono text-xs text-vault-text-secondary mt-1">
            {primaryCadence
              ? `${primaryCadence.total.toLocaleString()} archived games (${primaryCadence.volumePct}% volume)`
              : "No games recorded"}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-4 font-mono text-[11px] text-vault-text-muted">
          <span>AVG PERFORMANCE:</span>
          <span className="text-emerald-400 font-semibold">
            {primaryCadence ? `${primaryCadence.winPct}% WR` : "—"}
          </span>
        </div>
      </motion.div>

      {/* 3. STREAK PERFORMANCE */}
      <motion.div
        variants={cardVariants}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col justify-between rounded-lg border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
      >
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Streak Performance</span>
            <Trophy size={14} className="text-vault-primary" />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary">
              {streaks.longestWinStreak}
            </span>
            <span className="font-mono text-xs text-vault-text-muted">Peak win run</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-vault-text-secondary mt-1">
            <span>Max Slump:</span>
            <span className="font-semibold text-rose-400">
              {streaks.longestLossStreak} {streaks.longestLossStreak === 1 ? "Loss" : "Losses"}
            </span>
            {streaks.longestDrawStreak > 1 && (
              <span className="text-vault-text-muted">· {streaks.longestDrawStreak}D</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-4 font-mono text-[11px] text-vault-text-muted">
          <span>CURRENT RUN:</span>
          <span
            className={`font-semibold ${
              streaks.currentStreak.type === "win"
                ? "text-emerald-400"
                : streaks.currentStreak.type === "loss"
                  ? "text-rose-400"
                  : "text-vault-text-primary"
            }`}
          >
            {streaks.currentStreak.type === "win"
              ? `+${streaks.currentStreak.count} Wins`
              : streaks.currentStreak.type === "loss"
                ? `-${streaks.currentStreak.count} Losses`
                : `${streaks.currentStreak.count} ${streaks.currentStreak.type}`}
          </span>
        </div>
      </motion.div>

      {/* 4. ARCHIVE SPAN */}
      <motion.div
        variants={cardVariants}
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col justify-between rounded-lg border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
      >
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-vault-text-muted">
            <span>Archive Span</span>
            <History size={14} className="text-vault-text-muted" />
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display text-3xl md:text-4xl font-medium text-vault-text-primary">
              {archiveSpan.formattedSpan}
            </span>
          </div>

          <p className="font-mono text-xs text-vault-text-secondary mt-1">
            Continuous archival records
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-vault-border-base/40 pt-3 mt-4 font-mono text-[11px] text-vault-text-muted">
          <span>FIRST LOG:</span>
          <span className="text-vault-text-primary font-medium">{firstLogFormatted}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
