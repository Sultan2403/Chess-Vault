import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "@clerk/react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Search,
  Upload,
  Plus,
  Folder,
  Trophy,
  Flame,
  Clock,
  BookOpen,
  Users,
  Compass,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { MiniChessboard } from "../components/ui/MiniChessboard";
import { useDashboard } from "../hooks/useDashboard";
import { useFolders } from "../hooks/useFolders";
import { useAccountBootstrap } from "../hooks/useAccount";
import {
  getPlayerPerspective,
  parseOpeningDetails,
  getGameDate,
} from "../utils/game";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { BuildingVaultModal } from "../components/onboarding/BuildingVaultModal";
import { Platforms } from "@chess-vault/shared";

export default function DashboardPage() {
  const { user } = useUser();
  const userName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "Player";

  const [selectedRediscoverIndex, setSelectedRediscoverIndex] = useState(0);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isBuildingVaultOpen, setIsBuildingVaultOpen] = useState(false);

  // Queries
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboard();

  const { data: foldersData, isLoading: isFoldersLoading } = useFolders({
    limit: 4,
  });

  const { data: accountData } = useAccountBootstrap();
  const connectedAccounts = accountData?.linkedAccounts ?? [];

  // Metrics
  const metrics = dashboardData?.metrics;
  const rediscoverItems = dashboardData?.rediscover ?? [];
  const recentGames = dashboardData?.recentGames ?? [];
  const tendencies = dashboardData?.tendencies;
  const userFolders = foldersData?.folders ?? [];

  const activeRediscover =
    rediscoverItems.length > 0
      ? rediscoverItems[
          Math.min(selectedRediscoverIndex, rediscoverItems.length - 1)
        ]
      : null;

  return (
    <>
      <div className="mx-auto max-w-content px-6 py-10 space-y-12">
        {/* TOP STATUS & WELCOME HEADER */}
        <section className="flex flex-col gap-6 border-b border-vault-border-base pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status breadcrumb */}
            <div className="flex items-center gap-2 font-mono text-xs text-vault-text-muted">
              <span className="h-2 w-2 rounded-full bg-vault-win animate-pulse" />
              <span className="text-vault-text-secondary">
                {connectedAccounts.length > 0
                  ? `${connectedAccounts.map((a) => (a.platform === Platforms.CHESS_COM ? "Chess.com" : "Lichess")).join(" & ")} Connected`
                  : "No platform connected"}
              </span>
              <span>•</span>
              <span className="text-vault-text-muted">
                Background sync active
              </span>
            </div>
          </div>

          {/* Greeting and Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
                Good day, {userName}
              </h1>
              <p className="mt-2 text-sm text-vault-text-secondary font-sans max-w-xl">
                Your chess history, preserved in one place.{" "}
                {metrics?.totalGames !== undefined
                  ? `${metrics.totalGames.toLocaleString()} games indexed in your vault.`
                  : "Preserve and rediscover your match history."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <NavLink to="/game-bank">
                <Button
                  variant="secondary"
                  className="font-mono text-xs px-4 py-2 flex items-center gap-2"
                >
                  <Search size={13} />
                  <span>Search Games</span>
                </Button>
              </NavLink>
              <Button
                variant="solid-bronze"
                onClick={() => setIsOnboardingOpen(true)}
                className="font-mono text-xs px-4 py-2 flex items-center gap-2"
              >
                <Upload size={13} />
                <span>Import PGN</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ERROR NOTIFICATION */}
        {isDashboardError && (
          <ErrorBanner
            error={dashboardError}
            message="Unable to load dashboard data."
            onRetry={() => refetchDashboard()}
          />
        )}

        {/* 4-TIER STATS ROW */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Card 1: Games Preserved */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
            }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="rounded-vault border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
          >
            <div className="flex items-center justify-between text-vault-text-muted">
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Games Preserved
              </span>
              <Shield size={14} className="text-vault-bronze" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                {isDashboardLoading
                  ? "..."
                  : (metrics?.totalGames ?? 0).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              {metrics?.dateRange?.firstGameAt
                ? `Since ${new Date(metrics.dateRange.firstGameAt).getFullYear()}`
                : "All match records"}
            </p>
          </motion.div>

          {/* Card 2: Unique Opponents */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
            }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="rounded-vault border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
          >
            <div className="flex items-center justify-between text-vault-text-muted">
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Unique Opponents
              </span>
              <Users size={14} className="text-vault-bronze" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                {isDashboardLoading
                  ? "..."
                  : (metrics?.uniqueOpponents ?? 0).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              Opponents faced across games
            </p>
          </motion.div>

          {/* Card 3: Active Collections */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
            }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="rounded-vault border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
          >
            <div className="flex items-center justify-between text-vault-text-muted">
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Collections
              </span>
              <Folder size={14} className="text-vault-bronze" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                {isDashboardLoading ? "..." : (metrics?.totalCollections ?? 0)}
              </span>
              <span className="font-mono text-xs text-vault-text-secondary">
                folders
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              Organized game folders
            </p>
          </motion.div>

          {/* Card 4: Deep Studies / Notes */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
            }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="rounded-vault border border-vault-border-base hover:border-vault-border-interactive bg-vault-surface-layer-1 p-5 transition-colors"
          >
            <div className="flex items-center justify-between text-vault-text-muted">
              <span className="font-mono text-[10px] uppercase tracking-widest">
                Notes & Studies
              </span>
              <BookOpen size={14} className="text-vault-bronze" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                {isDashboardLoading ? "..." : (metrics?.deepStudies ?? 0)}
              </span>
              <span className="font-mono text-xs text-vault-bronze">
                annotated
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              Annotated with personal notes
            </p>
          </motion.div>
        </motion.section>

        {/* REDISCOVER FROM YOUR VAULT */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-vault-border-base pb-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <Compass size={15} className="text-vault-bronze" />
              <span className="font-semibold text-vault-text-primary uppercase tracking-wider">
                Rediscover From Your Vault
              </span>
            </div>
            {rediscoverItems.length > 0 && (
              <div className="flex items-center gap-2 font-mono text-xs text-vault-text-muted">
                <span>
                  {selectedRediscoverIndex + 1} / {rediscoverItems.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRediscoverIndex((prev) =>
                        prev > 0 ? prev - 1 : rediscoverItems.length - 1,
                      )
                    }
                    className="rounded-xs border border-vault-border-base px-2 py-0.5 hover:border-vault-border-interactive hover:text-vault-text-primary"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRediscoverIndex((prev) =>
                        prev < rediscoverItems.length - 1 ? prev + 1 : 0,
                      )
                    }
                    className="rounded-xs border border-vault-border-base px-2 py-0.5 hover:border-vault-border-interactive hover:text-vault-text-primary"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rediscover Category Selector Tabs */}
          {rediscoverItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {rediscoverItems.map((item, idx) => {
                const isSelected = idx === selectedRediscoverIndex;
                let Icon = Trophy;
                if (item.category === "marathonBattle") Icon = Clock;
                if (item.category === "notedStudy") Icon = BookOpen;
                if (item.category === "quickDecisive") Icon = Flame;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedRediscoverIndex(idx)}
                    className={`flex items-center gap-2 rounded-xs border px-3 py-1.5 font-mono text-xs transition-all ${
                      isSelected
                        ? "border-vault-bronze bg-vault-surface-layer-2 text-vault-text-primary shadow-xs"
                        : "border-vault-border-base bg-vault-surface-layer-1 text-vault-text-muted hover:text-vault-text-secondary"
                    }`}
                  >
                    <Icon
                      size={12}
                      className={isSelected ? "text-vault-bronze" : ""}
                    />
                    <span>{item.label}</span>
                    <span className="text-[10px] text-vault-text-muted bg-vault-surface-container px-1.5 py-0.2 rounded-xs">
                      {item.badgeText}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Feature Showcase Card */}
          {isDashboardLoading ? (
            <div className="h-72 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 animate-pulse" />
          ) : !activeRediscover ? (
            <div className="rounded-vault border border-dashed border-vault-border-base bg-vault-surface-layer-1 p-8 text-center text-vault-text-muted font-mono text-xs">
              No games indexed yet. Import games to rediscover key moments from
              your archive.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRediscover.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 md:p-8"
              >
                <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] items-center">
                  {/* Left Column: Story & Meta */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="rounded-xs border border-vault-bronze/40 bg-vault-bronze/10 px-2 py-0.5 text-vault-bronze font-semibold">
                        {activeRediscover.label.toUpperCase()}
                      </span>
                      <span className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 px-2 py-0.5 text-vault-text-secondary uppercase">
                        {activeRediscover.game.userResult}
                      </span>
                      <span className="text-vault-text-muted capitalize">
                        {activeRediscover.game.time.timeClass}
                      </span>
                    </div>

                    {/* Opening Details */}
                    {activeRediscover.game.opening?.name && (
                      <p className="font-mono text-xs text-vault-text-muted">
                        {activeRediscover.game.opening.eco
                          ? `${activeRediscover.game.opening.eco} • `
                          : ""}
                        {activeRediscover.game.opening.name}
                        {activeRediscover.game.opening.variation
                          ? ` (${activeRediscover.game.opening.variation})`
                          : ""}
                        {" • "}
                        {getGameDate(activeRediscover.game, "MMM dd, yyyy")}
                      </p>
                    )}

                    {/* Matchup Header */}
                    <div>
                      <h3 className="font-display text-2xl font-bold text-vault-text-primary tracking-tight">
                        {activeRediscover.game.whitePlayer.username}{" "}
                        <span className="text-base font-normal font-mono text-vault-text-muted">
                          ({activeRediscover.game.whitePlayer.rating})
                        </span>{" "}
                        <span className="text-vault-bronze font-mono text-lg">
                          vs
                        </span>{" "}
                        {activeRediscover.game.blackPlayer.username}{" "}
                        <span className="text-base font-normal font-mono text-vault-text-muted">
                          ({activeRediscover.game.blackPlayer.rating})
                        </span>
                      </h3>
                      <p className="font-mono text-xs text-vault-text-muted mt-1">
                        Played on{" "}
                        {activeRediscover.game.platform === "chess.com"
                          ? "Chess.com"
                          : "Lichess"}
                        {activeRediscover.game.moves?.count
                          ? ` • ${activeRediscover.game.moves.count} full moves`
                          : ""}
                      </p>
                    </div>

                    {/* Reflection / Custom Quote */}
                    {activeRediscover.customQuote && (
                      <div className="rounded-xs border-l-2 border-vault-bronze bg-vault-surface-layer-2/80 p-4 font-mono text-xs text-vault-text-secondary leading-relaxed">
                        <span className="block text-[10px] uppercase tracking-wider text-vault-bronze mb-1 font-semibold">
                          Match Commentary & Notes
                        </span>
                        &ldquo;{activeRediscover.customQuote}&rdquo;
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <NavLink to={`/game/${activeRediscover.game.id}`}>
                        <Button
                          variant="solid-bronze"
                          className="font-mono text-xs px-4 py-2 flex items-center gap-1.5"
                        >
                          <span>Replay in Game Viewer</span>
                          <ArrowRight size={13} />
                        </Button>
                      </NavLink>
                      <NavLink
                        to={`/game-bank?search=${encodeURIComponent(activeRediscover.game.opening?.name || "")}`}
                        className="font-mono text-xs text-vault-text-secondary hover:text-vault-bronze transition-colors flex items-center gap-1"
                      >
                        <span>Find similar games</span>
                        <ArrowUpRight size={12} />
                      </NavLink>
                    </div>
                  </div>

                  {/* Right Column: Board preview */}
                  <div className="max-w-[320px] mx-auto w-full">
                    <MiniChessboard
                      fen={activeRediscover.game.finalFen}
                      orientation={activeRediscover.game.userPlayedAs}
                      badgeLabel={activeRediscover.badgeText}
                    />
                    <div className="mt-2 text-center font-mono text-[11px] text-vault-text-muted">
                      Final Position • Playing as{" "}
                      {activeRediscover.game.userPlayedAs}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </section>

        {/* RECENT GAMES (3 COMPACT CARDS) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-normal text-vault-text-primary">
                Recent Games
              </h2>
              <span className="font-mono text-xs text-vault-text-muted">
                Latest Archive Entries
              </span>
            </div>
            <NavLink
              to="/game-bank"
              className="font-mono text-xs text-vault-text-secondary hover:text-vault-bronze transition-colors flex items-center gap-1"
            >
              <span>View all games in Game Bank</span>
              <ArrowRight size={12} />
            </NavLink>
          </div>

          {isDashboardLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 h-80 animate-pulse"
                />
              ))}
            </div>
          ) : recentGames.length === 0 ? (
            <div className="rounded-vault border border-dashed border-vault-border-base bg-vault-surface-layer-1 p-8 text-center space-y-3 font-mono text-xs text-vault-text-muted">
              <p>No games found for this platform filter.</p>
              <Button
                variant="secondary"
                onClick={() => setIsOnboardingOpen(true)}
                className="text-xs font-mono uppercase"
              >
                Import Games
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {recentGames.map((game) => {
                const perspective = getPlayerPerspective(game);
                const { opening, eco } = parseOpeningDetails(game);

                const resultBadgeClasses =
                  game.userResult === "win"
                    ? "bg-vault-win/15 text-vault-win border-vault-win/30"
                    : game.userResult === "loss"
                      ? "bg-vault-loss/15 text-vault-loss border-vault-loss/30"
                      : "bg-vault-draw/15 text-vault-draw border-vault-draw/30";

                const isCurrentUserWhite = game.userPlayedAs === "white";
                const isCurrentUserBlack = game.userPlayedAs === "black";

                return (
                  <NavLink
                    key={game.id}
                    to={`/game/${game.id}`}
                    className="block rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 flex flex-col justify-between hover:border-vault-bronze hover:bg-vault-surface-layer-2/70 transition-all group cursor-pointer"
                  >
                    <div>
                      {/* Top Bar: Platform & Format */}
                      <div className="flex items-center justify-between text-xs font-mono mb-3">
                        <span className="text-vault-text-muted capitalize">
                          {game.platform} • {game.time.timeClass}
                        </span>
                        <span
                          className={`rounded-xs border px-2 py-0.5 font-bold uppercase text-[10px] ${resultBadgeClasses}`}
                        >
                          {game.userResult}
                        </span>
                      </div>

                      {/* Mini Board */}
                      <div className="my-2">
                        <MiniChessboard
                          fen={game.finalFen}
                          orientation={perspective.playerColor}
                          badgeLabel={getGameDate(game, "MMM dd")}
                        />
                      </div>

                      {/* Players */}
                      <div className="space-y-1 mt-4 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${isCurrentUserWhite ? "bg-vault-bronze" : "bg-vault-text-muted"}`}
                            />
                            <span className="font-semibold text-vault-text-primary truncate">
                              {game.whitePlayer.username}{" "}
                              {isCurrentUserWhite ? "(You)" : ""}
                            </span>
                          </div>
                          <span className="text-vault-text-secondary shrink-0 ml-2">
                            {game.whitePlayer.rating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${isCurrentUserBlack ? "bg-vault-bronze" : "bg-vault-border-interactive"}`}
                            />
                            <span className="font-semibold text-vault-text-primary truncate">
                              {game.blackPlayer.username}{" "}
                              {isCurrentUserBlack ? "(You)" : ""}
                            </span>
                          </div>
                          <span className="text-vault-text-secondary shrink-0 ml-2">
                            {game.blackPlayer.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Opening Title & Subline */}
                    <div className="mt-4 pt-3 border-t border-vault-border-base flex items-center justify-between">
                      <p className="font-mono text-[11px] text-vault-text-muted truncate pr-2">
                        {eco ? `${eco} • ` : ""}
                        {opening || game.title || "Standard Game"}
                      </p>
                      <span className="text-vault-text-muted group-hover:text-vault-bronze transition-colors shrink-0 text-xs font-mono">
                        Inspect →
                      </span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          )}
        </section>

        {/* LOWER SPLIT SECTION (Left: Collections, Right: Tendencies) */}
        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: Collections */}
          <div>
            <div className="flex items-center justify-between border-b border-vault-border-base pb-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-normal text-vault-text-primary">
                  Collections
                </h2>
                <span className="font-mono text-xs text-vault-text-muted">
                  Personal Study Lists
                </span>
              </div>
              <NavLink to="/collections">
                <Button
                  variant="secondary"
                  className="font-mono text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>New Collection</span>
                </Button>
              </NavLink>
            </div>

            {isFoldersLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 h-28 animate-pulse"
                  />
                ))}
              </div>
            ) : userFolders.length === 0 ? (
              <div className="rounded-vault border border-dashed border-vault-border-base bg-vault-surface-layer-1 p-6 text-center space-y-3 font-mono text-xs">
                <Folder size={24} className="text-vault-bronze mx-auto" />
                <h4 className="font-display text-sm font-bold text-vault-text-primary">
                  No Collections Yet
                </h4>
                <p className="text-vault-text-secondary">
                  Create collections to organize your favorite matches, opening
                  studies, and tournaments.
                </p>
                <NavLink to="/collections">
                  <Button
                    variant="secondary"
                    className="text-xs font-mono uppercase px-3 py-1.5 mt-2"
                  >
                    <Plus size={12} className="mr-1" /> Create Collection
                  </Button>
                </NavLink>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  {userFolders.map((folder) => (
                    <NavLink key={folder.id} to={`/collections/${folder.id}`}>
                      <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 hover:border-vault-border-interactive hover:bg-vault-surface-layer-2 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze font-mono text-sm">
                            <Folder size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-base font-bold text-vault-text-primary truncate">
                              {folder.name}
                            </h3>
                            <p className="mt-1 text-xs text-vault-text-secondary line-clamp-2 leading-relaxed">
                              {folder.description || "Personal collection."}
                            </p>
                            <span className="mt-2 block font-mono text-[10px] text-vault-text-muted">
                              Active Collection
                            </span>
                          </div>
                        </div>
                      </div>
                    </NavLink>
                  ))}
                </div>
                <div className="pt-2">
                  <NavLink
                    to="/collections"
                    className="font-mono text-xs text-vault-text-secondary hover:text-vault-bronze transition-colors flex items-center gap-1"
                  >
                    <span>Explore all collections</span>
                    <ArrowRight size={12} />
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Archive Tendencies */}
          <div>
            <div className="border-b border-vault-border-base pb-3 mb-6">
              <h2 className="font-display text-xl font-normal text-vault-text-primary">
                Game Tendencies
              </h2>
              <span className="font-mono text-xs text-vault-text-muted">
                Insights across your indexed games
              </span>
            </div>

            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 space-y-6">
              {tendencies && tendencies.total > 0 ? (
                <>
                  {/* Lifetime Outcomes Bar */}
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs mb-2">
                      <span className="text-vault-text-muted uppercase tracking-wider text-[10px]">
                        Lifetime Outcomes
                      </span>
                      <span className="text-vault-text-muted text-[10px]">
                        {tendencies.total.toLocaleString()} Games
                      </span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-vault-surface-container flex">
                      <div
                        className="h-full bg-vault-win"
                        style={{ width: `${tendencies.winPct}%` }}
                        title={`${tendencies.wins} Wins (${tendencies.winPct}%)`}
                      />
                      <div
                        className="h-full bg-vault-draw"
                        style={{ width: `${tendencies.drawPct}%` }}
                        title={`${tendencies.draws} Draws (${tendencies.drawPct}%)`}
                      />
                      <div
                        className="h-full bg-vault-loss"
                        style={{ width: `${tendencies.lossPct}%` }}
                        title={`${tendencies.losses} Losses (${tendencies.lossPct}%)`}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between font-mono text-xs text-vault-text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-vault-win" />
                        <span>
                          {tendencies.winPct}% Win (
                          {tendencies.wins.toLocaleString()})
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-vault-draw" />
                        <span>
                          {tendencies.drawPct}% Draw (
                          {tendencies.draws.toLocaleString()})
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-vault-loss" />
                        <span>
                          {tendencies.lossPct}% Loss (
                          {tendencies.losses.toLocaleString()})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Highlights Grid: Top Opening & Longest Game */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Top Opening */}
                    <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 p-3 font-mono text-xs">
                      <span className="text-[10px] text-vault-text-muted uppercase tracking-wider block">
                        Top Opening
                      </span>
                      {tendencies.topOpenings[0] ? (
                        <div className="mt-1">
                          <p className="font-semibold text-vault-text-primary truncate">
                            {tendencies.topOpenings[0].name}
                          </p>
                          <p className="text-[11px] text-vault-text-muted mt-0.5">
                            {tendencies.topOpenings[0].count} games •{" "}
                            {tendencies.topOpenings[0].winRate}% win rate
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-vault-text-muted mt-1">
                          None yet
                        </p>
                      )}
                    </div>

                    {/* Longest Game */}
                    <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 p-3 font-mono text-xs">
                      <span className="text-[10px] text-vault-text-muted uppercase tracking-wider block">
                        Longest Battle
                      </span>
                      {tendencies.longestGame ? (
                        <div className="mt-1">
                          <p className="font-semibold text-vault-text-primary">
                            {tendencies.longestGame.movesCount} moves
                          </p>
                          <p className="text-[11px] text-vault-text-muted mt-0.5 truncate">
                            vs {tendencies.longestGame.opponentUsername} (
                            {tendencies.longestGame.result})
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-vault-text-muted mt-1">
                          None yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Side performance */}
                  <div className="pt-2 border-t border-vault-border-base flex items-center justify-between font-mono text-xs">
                    <span className="text-vault-text-secondary">
                      White: {tendencies.sidePerformance.whiteWinPct}% win •
                      Black: {tendencies.sidePerformance.blackWinPct}% win
                    </span>
                    <NavLink
                      to="/game-bank"
                      className="text-vault-bronze hover:underline flex items-center gap-1"
                    >
                      <span>Explore in Game Bank</span>
                      <ArrowRight size={11} />
                    </NavLink>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-vault-text-muted text-xs font-mono">
                  Tendencies and statistics will appear here as games are added
                  to your vault.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Onboarding / Import Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialStage={connectedAccounts.length > 0 ? "verify" : "connect"}
        initialAccounts={connectedAccounts.map((a) => ({
          platform: a.platform,
          username: a.username,
        }))}
        onSuccess={() => refetchDashboard()}
      />

      {/* Building Vault Progress Modal */}
      <BuildingVaultModal
        isOpen={isBuildingVaultOpen}
        onCancel={() => setIsBuildingVaultOpen(false)}
        onComplete={() => {
          setIsBuildingVaultOpen(false);
          refetchDashboard();
        }}
      />
    </>
  );
}
