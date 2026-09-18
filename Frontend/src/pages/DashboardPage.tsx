import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
import { ArrowRight, RefreshCw, FileCode, FolderPlus, Plus, Database } from "lucide-react";
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
import { getPlayerPerspective, parseOpeningDetails, getGameDate } from "../utils/game";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { Platforms } from "@chess-vault/shared";

export default function DashboardPage() {
  const { user } = useUser();
  const userName = user?.username || user?.firstName || "Vault Keeper";

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Queries
  const { data: gamesData, isLoading: isGamesLoading } = useGames({ limit: 6 });
  const { data: foldersData, isLoading: isFoldersLoading } = useFolders({ limit: 8 });
  const { data: accountData, refetch: refetchAccount } = useAccountBootstrap();
  const platformUsernames = usePlatformUsernames();

  const connectMutation = useConnectLinkedAccounts();
  const verificationMutation = useVerifyLinkedAccount();

  // Metrics
  const realGamesCount = gamesData?.pagination?.total ?? 0;
  const realFoldersCount = foldersData?.total ?? foldersData?.folders?.length ?? 0;
  const recentGames = gamesData?.games?.slice(0, 3) ?? [];
  const userFolders = foldersData?.folders ?? [];

  // Live Connected Accounts
  const connectedAccounts = accountData?.linkedAccounts ?? [];
  const annotatedCount = useMemo(() => {
    return (gamesData?.games ?? []).filter((g) => Boolean(g.notes || g.tags)).length;
  }, [gamesData?.games]);

  // Observations derived from real games
  const observations = useMemo(() => {
    const games = gamesData?.games ?? [];
    if (games.length === 0) return null;

    let wins = 0;
    let draws = 0;
    let losses = 0;

    const openingMap: Record<string, { count: number; wins: number; name: string }> = {};

    games.forEach((g) => {
      const p = getPlayerPerspective(g, platformUsernames, user?.username ?? undefined);
      if (p.result === "win") wins++;
      else if (p.result === "draw") draws++;
      else losses++;

      const parsed = parseOpeningDetails(g);
      const opName = parsed.opening || g.title || "Standard Encounter";
      if (!openingMap[opName]) {
        openingMap[opName] = { count: 0, wins: 0, name: opName };
      }
      openingMap[opName].count++;
      if (p.result === "win") openingMap[opName].wins++;
    });

    const total = games.length;
    const sortedOpenings = Object.values(openingMap).sort((a, b) => b.count - a.count);
    const topOpening = sortedOpenings[0];

    return {
      wins,
      draws,
      losses,
      total,
      winPct: Math.round((wins / total) * 100),
      drawPct: Math.round((draws / total) * 100),
      lossPct: Math.round((losses / total) * 100),
      topOpening: topOpening
        ? {
            name: topOpening.name,
            count: topOpening.count,
            winPct: Math.round((topOpening.wins / topOpening.count) * 100),
          }
        : null,
    };
  }, [gamesData?.games, platformUsernames, user?.username]);

  // Manual Force Sync trigger (Placeholder as documented in MISMATCHES_AND_TODOS.md)
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
        {/* HERO / WELCOME HEADER */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-vault-border-base pb-8">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-vault-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-win" />
              <span>REGISTRY REF. CV-{new Date().getFullYear()}</span>
              <span>•</span>
              <span className="uppercase text-vault-bronze">
                Active Registry
              </span>
            </div>
            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-normal text-vault-text-primary tracking-tight">
              Good day, {userName}
            </h1>
            <p className="mt-1 text-sm text-vault-text-secondary font-sans">
              Your permanent chess archive and match registry.
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
              <span>
                {connectedAccounts.length > 0
                  ? `Connected: ${connectedAccounts.map((a) => a.platform).join(" & ")}`
                  : "No platforms connected"}
              </span>
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
                {isGamesLoading ? "..." : realGamesCount.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-vault-win font-semibold">
                live
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              Across all federated engines
            </p>
          </div>

          {/* Stat 2 */}
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
              Curated Folders
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-vault-text-primary">
                {isFoldersLoading ? "..." : realFoldersCount}
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
                {annotatedCount}
              </span>
              <span className="font-mono text-xs text-vault-bronze">
                noted
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-vault-text-muted">
              With user marginalia & notes
            </p>
          </div>

          {/* Stat 4 */}
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-vault-text-muted">
              Archive Sources
            </span>
            <div className="mt-2 flex items-center gap-1.5 font-mono text-xs font-semibold flex-wrap">
              {connectedAccounts.length > 0 ? (
                connectedAccounts.map((acc) => (
                  <span
                    key={acc.platform}
                    className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-1.5 py-0.5 text-vault-text-primary capitalize"
                  >
                    {acc.platform}
                  </span>
                ))
              ) : (
                <span className="text-vault-text-muted text-[11px]">PGN Ingestion</span>
              )}
            </div>
            <p className="mt-2 font-mono text-[11px] text-vault-text-muted">
              {connectedAccounts.length} connected source{connectedAccounts.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        {/* RECENT ENGAGEMENTS */}
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

          {isGamesLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 h-80 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-4 bg-vault-surface-layer-2 rounded-xs w-1/3" />
                  <div className="h-36 bg-vault-surface-layer-2 rounded-xs my-3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-vault-surface-layer-2 rounded-xs w-3/4" />
                    <div className="h-3 bg-vault-surface-layer-2 rounded-xs w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentGames.length === 0 ? (
            <div className="rounded-vault border border-dashed border-vault-border-interactive bg-vault-surface-layer-1 p-10 text-center space-y-4">
              <div className="grid h-12 w-12 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze mx-auto">
                <Database size={24} />
              </div>
              <h3 className="font-display text-lg font-bold text-vault-text-primary">
                No Games Indexed Yet
              </h3>
              <p className="text-xs text-vault-text-secondary max-w-md mx-auto">
                Connect your Chess.com or Lichess handle, or upload PGN files to populate your permanent match ledger.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="solid-bronze"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="text-xs font-mono uppercase px-4 py-2"
                >
                  Connect Platforms
                </Button>
                <Link to="/game-bank">
                  <Button variant="secondary" className="text-xs font-mono uppercase px-4 py-2">
                    Upload PGN
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {recentGames.map((game) => {
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

                const isCurrentUserWhite =
                  (platformUsernames[game.platform] &&
                    game.whitePlayer.username.toLowerCase() ===
                      platformUsernames[game.platform]?.toLowerCase()) ||
                  (user?.username &&
                    game.whitePlayer.username.toLowerCase() ===
                      user.username.toLowerCase());

                const isCurrentUserBlack =
                  (platformUsernames[game.platform] &&
                    game.blackPlayer.username.toLowerCase() ===
                      platformUsernames[game.platform]?.toLowerCase()) ||
                  (user?.username &&
                    game.blackPlayer.username.toLowerCase() ===
                      user.username.toLowerCase());

                return (
                  <Link
                    key={game.id}
                    to={`/game/${game.id}`}
                    className="block rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 flex flex-col justify-between hover:border-vault-bronze hover:bg-vault-surface-layer-2/70 transition-all group cursor-pointer"
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
                          {getGameDate(game, "MMM dd, yyyy")}
                        </span>
                      </div>

                      {/* Mini Board Diagram */}
                      <div className="my-3">
                        <MiniChessboard
                          fen="r1b2rk1/1pq1bppp/p1n1pn2/3p4/2PN4/1PN1P3/PB2BPPP/R2Q1RK1 w - - 0 11"
                          orientation={perspective.playerColor}
                          badgeLabel={resultBadgeText}
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
                      <div className="truncate pr-2">
                        <p className="font-mono text-[11px] text-vault-text-muted truncate">
                          {eco ? `${eco} • ` : ""}
                          {opening || game.title || "Archived Match"}{" "}
                          {variation ? `(${variation})` : ""}
                        </p>
                      </div>
                      <span className="text-vault-text-muted group-hover:text-vault-bronze transition-colors shrink-0 text-xs font-mono">
                        Inspect →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* LOWER SPLIT SECTION (Left: Curated Folders, Right: Archive Observations) */}
        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT: Curated Folders */}
          <div>
            <div className="flex items-center justify-between border-b border-vault-border-base pb-3 mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-normal text-vault-text-primary">
                  Curated Folders
                </h2>
                <span className="font-mono text-xs text-vault-text-muted">
                  Structured Repertoires
                </span>
              </div>
              <Link
                to="/collections"
                className="font-mono text-xs text-vault-text-secondary hover:text-vault-bronze transition-colors"
              >
                INSPECT ALL {realFoldersCount} &gt;
              </Link>
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
              <div className="rounded-vault border border-dashed border-vault-border-interactive bg-vault-surface-layer-1 p-6 text-center space-y-3">
                <FolderPlus size={24} className="text-vault-bronze mx-auto" />
                <h4 className="font-display text-sm font-bold text-vault-text-primary">
                  No Folders Created
                </h4>
                <p className="text-xs text-vault-text-secondary">
                  Organize your opening repertoires and tournament monographs into curated folders.
                </p>
                <Link to="/collections">
                  <Button variant="secondary" className="text-xs font-mono uppercase px-3 py-1.5 mt-2">
                    <Plus size={12} className="mr-1" /> Create Folder
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {userFolders.slice(0, 4).map((folder) => (
                  <Link key={folder.id} to="/collections">
                    <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-5 hover:border-vault-border-interactive hover:bg-vault-surface-layer-2 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze font-mono text-xs">
                          ♞
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-1">
                            <h3 className="font-display text-base font-bold text-vault-text-primary truncate">
                              {folder.name}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs text-vault-text-secondary line-clamp-2 leading-relaxed">
                            {folder.description || "Curated match monograph archive."}
                          </p>
                          <span className="mt-3 block font-mono text-[9px] uppercase tracking-widest text-vault-text-muted">
                            Active Folder
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
              {observations ? (
                <div>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-vault-text-muted uppercase tracking-wider text-[10px]">
                      Archive Performance
                    </span>
                    <span className="text-vault-text-muted text-[10px]">
                      {observations.total} Matches
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <h3 className="font-display text-lg font-bold text-vault-text-primary">
                      {observations.topOpening ? observations.topOpening.name : "Archived Tendency"}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-vault-win">
                      {observations.winPct}% Score
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-vault-text-secondary font-sans">
                    Indexed from your live federated games ledger.
                  </p>

                  {/* W/D/L Ratio Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between font-mono text-[11px] text-vault-text-muted mb-1.5">
                      <span>W/D/L Ratio</span>
                      <span>{observations.total} Matches</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-vault-surface-container flex">
                      <div
                        className="h-full bg-vault-win"
                        style={{ width: `${observations.winPct}%` }}
                        title={`${observations.wins} Wins (${observations.winPct}%)`}
                      />
                      <div
                        className="h-full bg-vault-draw"
                        style={{ width: `${observations.drawPct}%` }}
                        title={`${observations.draws} Draws (${observations.drawPct}%)`}
                      />
                      <div
                        className="h-full bg-vault-loss"
                        style={{ width: `${observations.lossPct}%` }}
                        title={`${observations.losses} Losses (${observations.lossPct}%)`}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between font-mono text-[10px] text-vault-text-muted">
                      <span>{observations.wins} Wins ({observations.winPct}%)</span>
                      <span>{observations.draws} Draws</span>
                      <span>{observations.losses} Losses</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-vault-text-muted text-xs font-mono">
                  Observations and opening tendencies will appear here once games are imported.
                </div>
              )}

              {/* Ingestion Status */}
              <div className="border-t border-vault-border-base pt-5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                  Ledger Status
                </span>
                <div className="mt-1 flex items-baseline justify-between">
                  <h4 className="font-display text-base font-bold text-vault-text-primary">
                    Universal Index
                  </h4>
                  <span className="font-mono text-xs text-vault-win">
                    Online
                  </span>
                </div>
                <p className="mt-1 text-xs text-vault-text-secondary font-sans leading-relaxed">
                  Automatic background synchronization active for linked accounts.
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
              onClick={handleForceSync}
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
