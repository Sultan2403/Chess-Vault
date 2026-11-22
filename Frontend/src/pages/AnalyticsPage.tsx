import { useState, useMemo } from "react";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { useAnalytics } from "../hooks/useAnalytics";
import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { AnalyticsKpiCards } from "../components/analytics/AnalyticsKpiCards";
import { ActivityVolumeChart } from "../components/analytics/ActivityVolumeChart";
import { ColorAndCadenceSection } from "../components/analytics/ColorAndCadenceSection";
import { GameLengthSection } from "../components/analytics/GameLengthSection";
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
          <>
            {/* 1. Header & Filters */}
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

            {/* 2. Headline 4 KPI Cards */}
            <AnalyticsKpiCards data={data} />

            {/* 3. Activity & Game Volume Area Chart */}
            <ActivityVolumeChart
              trends={data.activityTrends}
              optimalWindow={data.optimalWindow}
            />

            {/* 4. Color & Cadence Performance (2-Column) */}
            <ColorAndCadenceSection
              overview={data.overview}
              byTimeClass={data.byTimeClass}
            />

            {/* 5. Game Length & Move Duration Histogram */}
            <GameLengthSection
              gameLength={data.gameLength}
              moveBuckets={data.moveBuckets}
            />

            {/* 6. Opening Repertoire Distribution (As White / As Black) */}
            <OpeningRepertoireSection openings={data.openings} />

            {/* 7. Frequent Opponents & Rivalries */}
            <RivalriesSection opponents={data.opponents} />

            {/* 8. Active Elo Ratings & Rating Brackets */}
            <RatingsAndBracketsSection ratingBrackets={data.ratingBrackets} />

            {/* 9. Vault Intelligence Inferences / Insights Link */}
            <ArchivalInferencesSection />
          </>
        )}
      </div>
    );
  }
