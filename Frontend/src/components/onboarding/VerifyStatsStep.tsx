import { ArrowLeft, ArrowRight, Clock, Flame, Trophy, Zap, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import type { AccountsStatsPreviewResult } from "@chess-vault/shared";

type VerifyStatsStepProps = {
  statsPreview: AccountsStatsPreviewResult | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export function VerifyStatsStep({
  statsPreview = {},
  isLoading = false,
  error = null,
  onRetry,
  onBack,
  onContinue,
}: VerifyStatsStepProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <div className="grid h-12 w-12 mx-auto place-items-center rounded-full bg-vault-surface-layer-2 border border-vault-border-base">
          <Loader2 size={24} className="animate-spin text-vault-bronze" />
        </div>
        <div>
          <h2 className="font-display text-xl font-normal text-vault-text-primary">
            Retrieving Player Profiles...
          </h2>
          <p className="text-xs text-vault-text-secondary mt-1">
            Querying public rating servers and calculating your lifetime match statistics.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center max-w-md mx-auto space-y-5">
        <div className="grid h-12 w-12 mx-auto place-items-center rounded-full bg-vault-loss/10 border border-vault-loss/30">
          <AlertCircle size={24} className="text-vault-loss" />
        </div>
        <div>
          <h2 className="font-display text-xl font-normal text-vault-text-primary">
            Unable to retrieve player profiles
          </h2>
          <p className="text-xs text-vault-text-secondary mt-1 leading-relaxed">
            {error}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            className="font-mono text-xs uppercase px-4 py-2"
          >
            Edit Usernames
          </Button>
          {onRetry && (
            <Button
              type="button"
              variant="solid-bronze"
              onClick={onRetry}
              className="font-mono text-xs uppercase px-4 py-2 flex items-center gap-2"
            >
              <RefreshCw size={12} /> Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  const { chessCom, lichess } = statsPreview ?? {};

  // Calculate estimated match count
  const chessComGamesCount = (() => {
    if (!chessCom?.stats) return 0;
    const s = chessCom.stats;
    const r = (stat?: { record?: { win: number; loss: number; draw: number } }) =>
      stat?.record ? stat.record.win + stat.record.loss + stat.record.draw : 0;
    return r(s.chess_rapid) + r(s.chess_blitz) + r(s.chess_bullet) + r(s.chess_daily);
  })();

  const lichessGamesCount = lichess?.stats?.count?.all ?? 0;
  const totalDetectedGames = chessComGamesCount + lichessGamesCount;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-normal text-vault-text-primary tracking-tight">
            Does everything look right?
          </h1>
          <p className="text-xs text-vault-text-secondary mt-1">
            Here is what we discovered across your connected accounts. Confirm your profile to start importing.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="font-mono text-xs text-vault-text-muted hover:text-vault-text-primary self-start sm:self-center flex items-center gap-1.5"
        >
          <ArrowLeft size={12} /> Edit usernames
        </Button>
      </div>

      {/* Profile Cards Grid */}
      <div className={`grid gap-5 ${chessCom && lichess ? "md:grid-cols-2" : "max-w-xl mx-auto"}`}>
        {/* Chess.com Card */}
        {chessCom && (
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Header: Platform & Verification Status */}
              <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-vault-win" />
                  <span className="font-mono text-xs font-semibold text-vault-text-primary">Chess.com</span>
                  <span className="font-mono text-[11px] text-vault-text-muted">@{chessCom.username}</span>
                </div>
                <span className="rounded-xs border border-vault-win/30 bg-vault-win/10 px-2 py-0.5 font-mono text-[10px] text-vault-win font-semibold">
                  Verified
                </span>
              </div>

              {/* User Monogram / Info */}
              <div className="mt-4 flex items-center gap-3">
                {chessCom.profile.avatar ? (
                  <img
                    src={chessCom.profile.avatar}
                    alt={chessCom.username}
                    className="h-11 w-11 rounded-full object-cover border border-vault-border-base"
                  />
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-vault-surface-container font-mono text-sm font-bold text-vault-bronze border border-vault-border-base">
                    {chessCom.username.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-vault-text-primary">
                      {chessCom.username}
                    </h3>
                    {chessCom.profile.title && (
                      <span className="rounded-xs bg-vault-loss/20 border border-vault-loss/40 px-1.5 py-0.2 font-mono text-[10px] text-vault-loss font-bold">
                        {chessCom.profile.title}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-vault-text-muted">
                    {chessCom.profile.joined
                      ? `Joined ${new Date(chessCom.profile.joined * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                      : "Registered Player"}
                    {chessCom.profile.fide ? ` &bull; FIDE ${chessCom.profile.fide}` : ""}
                  </p>
                </div>
              </div>

              {/* Competitive Ratings */}
              <div className="mt-5 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-vault-text-muted block">
                  Competitive Ratings
                </span>

                {/* Rapid */}
                {chessCom.stats?.chess_rapid && (
                  <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="flex items-center gap-1.5 text-vault-text-secondary">
                        <Clock size={12} className="text-vault-bronze" /> Rapid
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-vault-text-primary text-sm">
                          {chessCom.stats.chess_rapid.last?.rating ?? "—"}
                        </span>
                        {chessCom.stats.chess_rapid.best?.rating && (
                          <span className="text-[10px] text-vault-text-muted">
                            Peak {chessCom.stats.chess_rapid.best.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    {chessCom.stats.chess_rapid.record && (
                      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-vault-text-muted">
                        <span>
                          {chessCom.stats.chess_rapid.record.win +
                            chessCom.stats.chess_rapid.record.loss +
                            chessCom.stats.chess_rapid.record.draw}{" "}
                          games
                        </span>
                        <span>
                          {chessCom.stats.chess_rapid.record.win}W /{" "}
                          {chessCom.stats.chess_rapid.record.draw}D /{" "}
                          {chessCom.stats.chess_rapid.record.loss}L
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Blitz & Bullet Subgrid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-2.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-vault-text-muted flex items-center gap-1">
                        <Zap size={11} className="text-vault-bronze" /> Blitz
                      </span>
                      <span className="font-bold text-vault-text-primary">
                        {chessCom.stats?.chess_blitz?.last?.rating ?? "—"}
                      </span>
                    </div>
                    {chessCom.stats?.chess_blitz?.record && (
                      <p className="mt-1 text-[10px] text-vault-text-muted truncate">
                        {chessCom.stats.chess_blitz.record.win +
                          chessCom.stats.chess_blitz.record.loss +
                          chessCom.stats.chess_blitz.record.draw}{" "}
                        played
                      </p>
                    )}
                  </div>

                  <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-2.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-vault-text-muted flex items-center gap-1">
                        <Flame size={11} className="text-vault-bronze" /> Bullet
                      </span>
                      <span className="font-bold text-vault-text-primary">
                        {chessCom.stats?.chess_bullet?.last?.rating ?? "—"}
                      </span>
                    </div>
                    {chessCom.stats?.chess_bullet?.record && (
                      <p className="mt-1 text-[10px] text-vault-text-muted truncate">
                        {chessCom.stats.chess_bullet.record.win +
                          chessCom.stats.chess_bullet.record.loss +
                          chessCom.stats.chess_bullet.record.draw}{" "}
                        played
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chess.com Footer */}
            <div className="border-t border-vault-border-base pt-3 flex items-center justify-between font-mono text-[11px] text-vault-text-muted">
              <span>
                {chessCom.stats?.tactics?.highest?.rating
                  ? `Tactics Rating: ${chessCom.stats.tactics.highest.rating}`
                  : "Ready for ingestion"}
              </span>
              {chessCom.stats?.puzzle_rush?.best?.score !== undefined && (
                <span className="text-vault-bronze">
                  Rush: {chessCom.stats.puzzle_rush.best.score}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lichess Card */}
        {lichess && (
          <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-5 flex flex-col justify-between space-y-5">
            <div>
              {/* Header: Platform & Verification Status */}
              <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-vault-win" />
                  <span className="font-mono text-xs font-semibold text-vault-text-primary">Lichess.org</span>
                  <span className="font-mono text-[11px] text-vault-text-muted">@{lichess.username}</span>
                </div>
                <span className="rounded-xs border border-vault-win/30 bg-vault-win/10 px-2 py-0.5 font-mono text-[10px] text-vault-win font-semibold">
                  Verified
                </span>
              </div>

              {/* User Info */}
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-vault-surface-container font-mono text-sm font-bold text-vault-bronze border border-vault-border-base">
                  {lichess.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-vault-text-primary">
                      {lichess.username}
                    </h3>
                    {lichess.profile.title && (
                      <span className="rounded-xs bg-vault-loss/20 border border-vault-loss/40 px-1.5 py-0.2 font-mono text-[10px] text-vault-loss font-bold">
                        {lichess.profile.title}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-vault-text-muted">
                    {lichess.profile.createdAt
                      ? `Joined ${new Date(lichess.profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                      : "Registered Player"}
                    {lichess.stats.count?.all ? ` &bull; ${lichess.stats.count.all.toLocaleString()} games total` : ""}
                  </p>
                </div>
              </div>

              {/* Glicko-2 Ratings */}
              <div className="mt-5 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-vault-text-muted block">
                  Glicko-2 Rating Profiles
                </span>

                {/* Rapid */}
                {lichess.stats.perfs.rapid && (
                  <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-3">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="flex items-center gap-1.5 text-vault-text-secondary">
                        <Clock size={12} className="text-vault-bronze" /> Rapid
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-vault-text-primary text-sm">
                          {lichess.stats.perfs.rapid.rating}
                        </span>
                        <span className="text-[10px] text-vault-text-muted">
                          {lichess.stats.perfs.rapid.rd <= 65 ? "Stable" : `RD ±${lichess.stats.perfs.rapid.rd}`}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-vault-text-muted">
                      <span>{lichess.stats.perfs.rapid.games} games played</span>
                      <span>{lichess.stats.perfs.rapid.prov ? "Provisional" : "Official rating"}</span>
                    </div>
                  </div>
                )}

                {/* Blitz & Classical Subgrid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-2.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-vault-text-muted flex items-center gap-1">
                        <Zap size={11} className="text-vault-bronze" /> Blitz
                      </span>
                      <span className="font-bold text-vault-text-primary">
                        {lichess.stats.perfs.blitz?.rating ?? "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-vault-text-muted truncate">
                      {lichess.stats.perfs.blitz?.games ?? 0} played
                    </p>
                  </div>

                  <div className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 p-2.5 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-vault-text-muted flex items-center gap-1">
                        <Trophy size={11} className="text-vault-bronze" /> Classical
                      </span>
                      <span className="font-bold text-vault-text-primary">
                        {lichess.stats.perfs.classical?.rating ?? "—"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-vault-text-muted truncate">
                      {lichess.stats.perfs.classical?.games ?? 0} played
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lichess Footer */}
            <div className="border-t border-vault-border-base pt-3 flex items-center justify-between font-mono text-[11px] text-vault-text-muted">
              <span>
                {lichess.profile.tosViolation ? "Account flagged" : "Fair Play: Verified Clean"}
              </span>
              {lichess.stats.perfs.puzzle && (
                <span className="text-vault-bronze">
                  Puzzles: {lichess.stats.perfs.puzzle.rating}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stage 2 Action Footer */}
      <div className="mt-8 pt-4 border-t border-vault-border-base flex items-center justify-between">
        <span className="font-mono text-xs text-vault-text-muted">
          {totalDetectedGames > 0
            ? `~${totalDetectedGames.toLocaleString()} matches found across accounts.`
            : "Accounts ready to connect."}
        </span>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            className="font-mono text-xs uppercase px-4 py-2"
          >
            Back
          </Button>
          <Button
            type="button"
            variant="solid-bronze"
            onClick={onContinue}
            className="font-mono text-xs uppercase px-5 py-2 flex items-center gap-2"
          >
            Continue &bull; Start Importing <ArrowRight size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}
