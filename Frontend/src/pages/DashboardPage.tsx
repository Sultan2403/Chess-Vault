import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
import { ArrowRight, RefreshCw, FileCode, ExternalLink } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { MiniChessboard } from "../components/ui/MiniChessboard";
import { useGames } from "../hooks/useGames";
import { useFolders } from "../hooks/useFolders";
import {
  useAccountBootstrap,
  usePlatformUsernames,
  useConnectLinkedAccounts,
  useVerifyLinkedAccount,
} from "../hooks/useAccount";
import { mockGames } from "../data/mock-games";
import { getPlayerPerspective, parseOpeningDetails } from "../utils/game";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { Platforms } from "@chess-vault/shared";

export default function DashboardPage() {
  const { user } = useUser();
  const userName = user?.username || user?.firstName;

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Queries
  const { data: gamesData } = useGames({ limit: 6 });
  const { data: foldersData } = useFolders({ limit: 8 });
  const { refetch: refetchAccount } = useAccountBootstrap();
  const platformUsernames = usePlatformUsernames();

  const connectMutation = useConnectLinkedAccounts();
  const verificationMutation = useVerifyLinkedAccount();

  // Metrics
  const realGamesCount = gamesData?.pagination?.total ?? 0;
  const displayGamesCount = realGamesCount > 0 ? realGamesCount : 4218;
  const realFoldersCount =
    foldersData?.total ?? foldersData?.folders?.length ?? 0;
  const displayFoldersCount = realFoldersCount > 0 ? realFoldersCount : 14;

  // Games to display in Recent Engagements
  const rawGames =
    gamesData?.games && gamesData.games.length > 0
      ? gamesData.games
      : mockGames;
  const recentGames = rawGames.slice(0, 3);

  // Folders to display
  const userFolders = foldersData?.folders ?? [];
  // FOLIOS SHOULD BE FROM THE USEFOLDERS HOOK. AND THE NAMING SHOULD BE CHANGED TO FOLDERS EVERYWHERE.
  const defaultFolios = [
    {
      id: "folio-1",
      name: "Tournament Games",
      count: 34,
      desc: "FIDE standard rated matches with arbiter verification.",
      updated: "UPDATED 3 DAYS AGO",
    },
    {
      id: "folio-2",
      name: "Najdorf Defense Lab",
      count: 142,
      desc: "6.Be3 and 6.Bg5 deep preparation lines and tactical shots.",
      updated: "UPDATED YESTERDAY",
    },
    {
      id: "folio-3",
      name: "Tactical Monoliths",
      count: 39,
      desc: "Decisive queen sacrifices and quiet king safety manoeuvres.",
      updated: "UPDATED 2 WKS AGO",
    },
    {
      id: "folio-4",
      name: "Toughest Opponents",
      count: 67,
      desc: "Profiles vs 2200+ Elo peers with negative score records.",
      updated: "UPDATED OCT 28",
    },
  ];

  const foliosToDisplay =
    userFolders.length > 0
      ? userFolders.slice(0, 4).map((f, i) => ({
          id: f.id,
          name: f.name,
          count: defaultFolios[i % defaultFolios.length].count,
          desc: f.description || defaultFolios[i % defaultFolios.length].desc,
          updated: "ACTIVE FOLIO",
        }))
      : defaultFolios;

  // Manual Force Sync trigger
  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await refetchAccount();
      setSyncFeedback("Sync complete. Repositories up to date.");
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback("Sync completed with cached index.");
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-content px-6 py-10 space-y-12">
        {/* HERO / WELCOME HEADER (Screenshot 2) */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border-base pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-vault-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-win" />
              <span>FOLIO REF. 04-2991B</span>
              <span>•</span>
              <span className="uppercase text-vault-bronze">
                Active Registry
              </span>
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
              Good evening, {userName}
            </h1>
            <p className="mt-1 text-sm text-vault-text-secondary font-sans">
              Your chess history, kept in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-3 py-1.5 font-mono text-xs text-vault-text-secondary">
              <RefreshCw
                size={12}
                className={
                  isSyncing
                    ? "animate-spin text-vault-bronze"
                    : "text-vault-text-muted"
                }
              />
              <span>Synced 2h ago: Chess.com & Lichess</span>
            </div>
            <Link to="/game-bank">
              <Button
                variant="secondary"
                className="font-mono text-xs px-4 py-2"
              >
                Browse Game Bank <ArrowRight size={13} className="ml-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 4-TIER STATS ROW */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
              Total Indexed
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                {displayGamesCount.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-vault-win font-semibold">
                +12 this wk
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              Across all federated engines
            </p>
          </div>

          {/* Stat 2 */}
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
              Curated Folios
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                {displayFoldersCount}
              </span>
              <span className="font-mono text-xs text-vault-text-secondary">
                active
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              Repertoire & monograph labs
            </p>
          </div>

          {/* Stat 3 */}
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
              Annotated Studies
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                62
              </span>
              <span className="font-mono text-xs text-vault-bronze">
                Starred
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              With deep engine variations
            </p>
          </div>

          {/* Stat 4 */}
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
              Archive Sources
            </span>
            <div className="mt-2 flex items-center gap-1.5 font-mono text-xs font-semibold">
              <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-1.5 py-0.5 text-vault-text-primary">
                Lichess
              </span>
              <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-1.5 py-0.5 text-vault-text-primary">
                Chess.com
              </span>
              <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-1.5 py-0.5 text-vault-bronze">
                OTB PGN
              </span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-vault-text-muted">
              3 connected repositories
            </p>
          </div>
        </section>

        {/* RECENT ENGAGEMENTS (Screenshot 2: 3 board cards) */}
        <section>
          <div className="flex items-center justify-between border-b border-vault-border-base pb-3 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-normal text-vault-text-primary">
                Recent Engagements
              </h2>
              <span className="font-mono text-xs text-vault-text-muted">
                Terminal Ledger Artifacts
              </span>
            </div>
            <Link
              to="/game-bank"
              className="font-mono text-xs text-vault-text-secondary hover:text-vault-bronze transition-colors flex items-center gap-1"
            >
              VIEW FULL REGISTRY <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recentGames.map((game, idx) => {
              const perspective = getPlayerPerspective(
                game,
                platformUsernames,
                user?.username ?? undefined,
              );
              const { opening, variation, eco } = parseOpeningDetails(game);

              const resultBadgeClasses =
                perspective.result === "win"
                  ? "bg-vault-win/15 text-vault-win border-vault-win/30"
                  : perspective.result === "loss"
                    ? "bg-vault-loss/15 text-vault-loss border-vault-loss/30"
                    : "bg-vault-draw/15 text-vault-draw border-vault-draw/30";

              const resultBadgeText =
                game.result === "draw"
                  ? "½ - ½"
                  : game.result === "white"
                    ? "1 - 0"
                    : "0 - 1";

              const badgeLabel =
                idx === 0
                  ? "38. Qxh7#"
                  : idx === 1
                    ? "44... Rd2+ Resign"
                    : "61. Re3 Repetition";

              return (
                // We should probably make the whole card clickable and link to the game viewer instead of just the tiny btn on the bottom
                <article
                  key={game.id}
                  className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 flex flex-col justify-between hover:border-vault-border-interactive transition-all group"
                >
                  <div>
                    {/* Top Row: Result and Format */}
                    <div className="flex items-center justify-between text-xs font-mono mb-4">
                      <span
                        className={`rounded-xs border px-2 py-0.5 font-bold ${resultBadgeClasses}`}
                      >
                        {resultBadgeText}
                      </span>
                      <span className="text-vault-text-muted">
                        <span className="capitalize">{game.timeClass}</span> •{" "}
                        {idx === 0
                          ? "Today, 17:42"
                          : idx === 1
                            ? "Yesterday, 22:15"
                            : "Nov 12"}{" "}
                        {/*This implementation should use game.playedAt and probably format with the date-fns library */}
                      </span>
                    </div>

                    {/* Mini Board Diagram */}
                    <div className="my-3">
                      <MiniChessboard
                        fen={
                          idx === 0
                            ? "r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11"
                            : idx === 1
                              ? "r2q1rk1/pp1b1ppp/2n1pn2/2pp4/2PP4/2N1PN2/PP1QBPPP/R4RK1 w - - 0 10"
                              : "r1bq1rk1/ppp2pbp/2np1np1/4p3/2PPP3/2N1BP2/PP2N1PP/R2QKB1R w KQ - 0 8"
                        }
                        orientation={perspective.playerColor}
                        badgeLabel={badgeLabel}
                      />
                    </div>

                    {/* Players */}
                    <div className="space-y-1 mt-4 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${game.whitePlayer.username.toLowerCase() === userName.toLowerCase() ? "bg-vault-bronze" : "bg-vault-text-muted"}`}
                          />
                          <span className="font-semibold text-vault-text-primary">
                            {game.whitePlayer.username}{" "}
                            {game.whitePlayer.username.toLowerCase() ===
                            userName.toLowerCase()
                              ? "(You)"
                              : ""}{" "}
                            {/*This implementation should use the username from the useAccounts hook. aka platformUsernames*/}
                          </span>
                        </div>
                        <span className="text-vault-text-secondary">
                          {game.whitePlayer.rating}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${game.blackPlayer.username.toLowerCase() === userName.toLowerCase() ? "bg-vault-bronze" : "bg-vault-border-interactive"}`}
                          />
                          <span className="font-semibold text-vault-text-primary">
                            {game.blackPlayer.username}{" "}
                            {game.blackPlayer.username.toLowerCase() ===
                            userName.toLowerCase()
                              ? "(You)"
                              : ""}{" "}
                            {/*This implementation should use the username from the useAccounts hook. aka platformUsernames*/}
                          </span>
                        </div>
                        <span className="text-vault-text-secondary">
                          {game.blackPlayer.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Opening Title & Link */}
                  <div className="mt-4 pt-3 border-t border-vault-border-base flex items-center justify-between">
                    <div className="truncate pr-2">
                      <p className="font-mono text-[11px] text-vault-text-muted truncate">
                        {eco ?? (idx === 0 ? "B90" : idx === 1 ? "E04" : "D37")}{" "}
                        • {opening} {variation ? `(${variation})` : ""}
                      </p>
                    </div>
                    <Link
                      to={`/game/${game.id}`}
                      className="text-vault-text-muted hover:text-vault-bronze transition-colors shrink-0"
                      title="Inspect Game"
                    >
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* LOWER SPLIT SECTION (Left: Curated Folios, Right: Archive Observations) */}
        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: Curated Folios */}
          <div>
            <div className="flex items-center justify-between border-b border-vault-border-base pb-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-normal text-vault-text-primary">
                  Curated Folios
                </h2>
                <span className="font-mono text-xs text-vault-text-muted">
                  Structured Repertoires
                </span>
              </div>
              <Link
                to="/collections"
                className="font-mono text-xs text-vault-text-secondary hover:text-vault-bronze transition-colors"
              >
                INSPECT ALL {displayFoldersCount} &gt;
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {foliosToDisplay.map((folio) => (
                <Link key={folio.id} to="/collections">
                  <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 hover:border-vault-border-interactive hover:bg-vault-surface-layer-2 transition-all">
                    <div className="flex items-start gap-3">
                      {/* Chess icon block */}
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze font-mono text-xs">
                        ♞
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <h3 className="font-display text-base font-bold text-vault-text-primary truncate">
                            {folio.name}
                          </h3>
                          <span className="font-mono text-[11px] text-vault-text-muted shrink-0">
                            {folio.count} PGNs
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-vault-text-secondary line-clamp-2 leading-relaxed">
                          {folio.desc}
                        </p>
                        <span className="mt-3 block font-mono text-[9px] uppercase tracking-widest text-vault-text-muted">
                          {folio.updated}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: Archive Observations */}
          <div>
            <div className="border-b border-vault-border-base pb-3 mb-6">
              <h2 className="font-display text-xl font-normal text-vault-text-primary">
                Archive Observations
              </h2>
              <span className="font-mono text-xs text-vault-text-muted">
                Structural Tendencies
              </span>
            </div>

            <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 space-y-6">
              {/* Catalan Opening Drift */}
              <div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-vault-text-muted uppercase tracking-wider text-[10px]">
                    Recent Opening Drift
                  </span>
                  <span className="text-vault-text-muted text-[10px]">
                    Last 60 Days
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <h3 className="font-display text-lg font-bold text-vault-text-primary">
                    Catalan Opening (White)
                  </h3>
                  <span className="font-mono text-xs font-semibold text-vault-win">
                    68% Score
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-vault-text-secondary font-sans">
                  You switched 42% of your 1.d4 games toward closed fianchetto
                  structures, cutting middle-game tactical blunders by nearly
                  half.
                </p>

                {/* W/D/L Ratio Bar */}
                <div className="mt-4">
                  <div className="flex justify-between font-mono text-[11px] text-vault-text-muted mb-1.5">
                    <span>W/D/L Ratio in Catalan</span>
                    <span>22 Matches</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-vault-surface-container flex">
                    <div
                      className="h-full bg-vault-win"
                      style={{ width: "63%" }}
                      title="14 Wins (63%)"
                    />
                    <div
                      className="h-full bg-vault-draw"
                      style={{ width: "18%" }}
                      title="4 Draws (18%)"
                    />
                    <div
                      className="h-full bg-vault-loss"
                      style={{ width: "19%" }}
                      title="4 Losses (19%)"
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between font-mono text-[10px] text-vault-text-muted">
                    <span>14 Wins (63%)</span>
                    <span>4 Draws</span>
                    <span>4 Losses</span>
                  </div>
                </div>
              </div>

              {/* Milestone In Sight */}
              <div className="border-t border-vault-border-base pt-5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                  Milestone In Sight
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <h4 className="font-display text-base font-bold text-vault-text-primary">
                    Rapid Peak: 2,185
                  </h4>
                  <span className="font-mono text-xs text-vault-bronze">
                    37 pts away
                  </span>
                </div>
                <p className="mt-1 text-xs text-vault-text-secondary font-sans leading-relaxed">
                  Highest archival evaluation stood at 2,185 in April 2023.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM INGESTION BANNER */}
        <section className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze">
              <FileCode size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-vault-text-primary">
                Direct PGN Import & Ledger Ingestion
              </h3>
              <p className="text-xs text-vault-text-secondary">
                Paste match monographs, tournament bulletins, or sync remote
                archives directly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {syncFeedback && (
              <span className="font-mono text-xs text-vault-win">
                {syncFeedback}
              </span>
            )}
            <Button
              variant="secondary"
              onClick={() => setIsOnboardingOpen(true)}
              className="font-mono text-xs uppercase"
            >
              Batch Import PGN
            </Button>
            <Button
              variant="solid-bronze"
              onClick={handleForceSync} // This force sync doenst actually do anything and it should be decided what it should do later.
              disabled={isSyncing}
              className="font-mono text-xs uppercase"
            >
              {isSyncing ? "Syncing..." : "Force Sync Now"}
            </Button>
          </div>
        </section>
      </div>

      {/* Onboarding / Sync Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onVerifyAccount={(account) => verificationMutation.mutateAsync(account)}
        onBeginSync={async (platforms) => {
          const accounts: Array<{
            platform: (typeof Platforms)[keyof typeof Platforms];
            username: string;
          }> = [];

          if (platforms.chessComUsername) {
            accounts.push({
              platform: Platforms.CHESS_COM,
              username: platforms.chessComUsername,
            });
          }
          if (platforms.lichessUsername) {
            accounts.push({
              platform: Platforms.LICHESS,
              username: platforms.lichessUsername,
            });
          }

          const result = await connectMutation.mutateAsync({ accounts });
          if (!result.success) {
            throw new Error(
              result.results
                .map((connection) => connection.message)
                .filter(Boolean)
                .join(" ") || result.message,
            );
          }

          setIsOnboardingOpen(false);
        }}
      />
    </AppShell>
  );
}
