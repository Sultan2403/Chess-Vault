import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { useAnalytics } from "../hooks/useAnalytics";
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { AnalyticsKpiCards } from "../components/analytics/AnalyticsKpiCards";
import { ActivityVolumeChart } from "../components/analytics/ActivityVolumeChart";
import { ColorAndCadenceSection } from "../components/analytics/ColorAndCadenceSection";
import { GameLengthSection } from "../components/analytics/GameLengthSection";
import { TerminationsSection } from "../components/analytics/TerminationsSection";
import { OpeningRepertoireSection } from "../components/analytics/OpeningRepertoireSection";
import { RivalriesSection } from "../components/analytics/RivalriesSection";
import { RatingsAndBracketsSection } from "../components/analytics/RatingsAndBracketsSection";
import { ArchivalInferencesSection } from "../components/analytics/ArchivalInferencesSection";
import { AnalyticsSkeleton } from "../components/analytics/AnalyticsSkeleton";
import type { PlatformType, TimeClassType } from "@chess-vault/shared";

export default function AnalyticsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | "all">("all");
  const [selectedTimeClass, setSelectedTimeClass] = useState<TimeClassType | "all">("all");
  const [selectedRange, setSelectedRange] = useState<string>("all");

  // Derive `from` ISO string based on selected range
  const fromDate = useMemo(() => {
    if (selectedRange === "all") return undefined;
    const now = new Date();
    if (selectedRange === "12m") {
      now.setFullYear(now.getFullYear() - 1);
    } else if (selectedRange === "90d") {
      now.setDate(now.getDate() - 90);
    } else if (selectedRange === "30d") {
      now.setDate(now.getDate() - 30);
    }
    return now.toISOString();
  }, [selectedRange]);

  const { data, isLoading, isError, error, refetch } = useAnalytics({
    platform: selectedPlatform,
    timeClass: selectedTimeClass,
    from: fromDate,
  });

  const chessComGames = useMemo(() => {
    const found = data?.byPlatform.find((p) => p.platform === "chess.com");
    return found ? found.total : 0;
  }, [data?.byPlatform]);

  const lichessGames = useMemo(() => {
    const found = data?.byPlatform.find((p) => p.platform === "lichess");
    return found ? found.total : 0;
  }, [data?.byPlatform]);

  const shouldReduceMotion = useReducedMotion();

  const sectionVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="mx-auto max-w-content w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
      {isLoading && <AnalyticsSkeleton />}

      {isError && (
        <ErrorBanner
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {data && !isLoading && (
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
          className="flex flex-col gap-8"
        >
          {/* 1. Header & Filters */}
          <motion.section variants={sectionVariants}>
            <AnalyticsHeader
              totalGames={data.overview.totalGames}
              formattedSpan={data.archiveSpan.formattedSpan}
              chessComGames={chessComGames}
              lichessGames={lichessGames}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              selectedTimeClass={selectedTimeClass}
              onSelectTimeClass={setSelectedTimeClass}
              selectedRange={selectedRange}
              onSelectRange={setSelectedRange}
            />
          </motion.section>

          {/* 2. Headline 4 KPI Cards */}
          <motion.section variants={sectionVariants}>
            <AnalyticsKpiCards data={data} />
          </motion.section>

          {/* 3. Activity & Game Volume Area Chart */}
          <motion.section variants={sectionVariants}>
            <ActivityVolumeChart
              trends={data.activityTrends}
              optimalWindow={data.optimalWindow}
            />
          </motion.section>

          {/* 4. Color & Cadence Performance (2-Column) */}
          <motion.section variants={sectionVariants}>
            <ColorAndCadenceSection
              overview={data.overview}
              byTimeClass={data.byTimeClass}
            />
          </motion.section>

          {/* 5. Game Length & Move Duration Histogram */}
          <motion.section variants={sectionVariants}>
            <GameLengthSection
              gameLength={data.gameLength}
              moveBuckets={data.moveBuckets}
            />
          </motion.section>

          {/* 6. Decisive Terminations & Battle Endings */}
          <motion.section variants={sectionVariants}>
            <TerminationsSection terminations={data.terminations} />
          </motion.section>

          {/* 7. Opening Repertoire Distribution (As White / As Black) */}
          <motion.section variants={sectionVariants}>
            <OpeningRepertoireSection openings={data.openings} />
          </motion.section>

          {/* 7. Frequent Opponents & Rivalries */}
          <motion.section variants={sectionVariants}>
            <RivalriesSection opponents={data.opponents} />
          </motion.section>

          {/* 8. Active Elo Ratings & Rating Brackets */}
          <motion.section variants={sectionVariants}>
            <RatingsAndBracketsSection ratingBrackets={data.ratingBrackets} />
          </motion.section>

          {/* 9. Vault Intelligence Inferences / Insights Link */}
          <motion.section variants={sectionVariants}>
            <ArchivalInferencesSection />
          </motion.section>
        </motion.div>
      )}
    </div>
  );
}
