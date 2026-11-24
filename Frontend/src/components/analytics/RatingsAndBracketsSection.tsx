import { useState } from "react";
import { Trophy, BarChart2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useAccountBootstrap } from "../../hooks/useAccount";
import type {
  AnalyticsPlatformRatingBrackets,
  AnalyticsRatingBracket,
  PlatformType,
} from "@chess-vault/shared";

interface RatingsAndBracketsSectionProps {
  ratingBrackets: AnalyticsPlatformRatingBrackets[];
}

export function RatingsAndBracketsSection({
  ratingBrackets,
}: RatingsAndBracketsSectionProps) {
  const { data: accountData } = useAccountBootstrap();
  const linkedAccounts = accountData?.linkedAccounts ?? [];
  const shouldReduceMotion = useReducedMotion();

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

          <div className="mt-5">
            {platformList.length === 0 || activeBrackets.length === 0 ? (
              <p className="font-mono text-xs text-vault-text-muted">
                No opponent rating bracket data available for this selection.
              </p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePlatformData?.platform ?? "single"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3.5"
                >
                  {activeBrackets.map((bracket) => {
                    return (
                      <div key={bracket.bracket} className="space-y-1">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-medium text-vault-text-primary">
                            {bracket.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-vault-text-muted">
                              {bracket.total.toLocaleString()} games
                            </span>
                            <span
                              className={`font-semibold ${
                                bracket.winPct >= 50
                                  ? "text-emerald-400"
                                  : "text-vault-text-secondary"
                              }`}
                            >
                              {bracket.winPct}% WR
                            </span>
                          </div>
                        </div>

                        {/* Horizontal Bar */}
                        <div className="h-2 w-full overflow-hidden rounded bg-vault-surface-layer-2">
                          <motion.div
                            initial={shouldReduceMotion ? false : { width: 0 }}
                            animate={{ width: `${bracket.winPct}%` }}
                            transition={{
                              duration: 0.6,
                              delay: shouldReduceMotion ? 0 : 0.1,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className={`h-full rounded ${
                              bracket.winPct >= 50 ? "bg-emerald-500" : "bg-vault-primary"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
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
