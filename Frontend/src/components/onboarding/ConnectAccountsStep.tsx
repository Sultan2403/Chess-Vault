import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Platforms } from "@chess-vault/shared";
import type { PlatformType, VerifyLinkedAccountResult } from "@chess-vault/shared";

export type PlatformMode = "both" | "chessCom" | "lichess";

type ConnectAccountsStepProps = {
  platformMode: PlatformMode;
  onPlatformModeChange: (mode: PlatformMode) => void;
  chessComUsername: string;
  onChessComUsernameChange: (value: string) => void;
  lichessUsername: string;
  onLichessUsernameChange: (value: string) => void;
  verification: Partial<
    Record<PlatformType, { status: "idle" | "checking" | "valid" | "invalid"; message?: string }>
  >;
  onVerifySingle: (platform: PlatformType, username: string) => Promise<VerifyLinkedAccountResult>;
  onProceed: () => void;
  isLoadingStats: boolean;
  error?: string;
  required?: boolean;
  onClose: () => void;
};

export function ConnectAccountsStep({
  platformMode,
  onPlatformModeChange,
  chessComUsername,
  onChessComUsernameChange,
  lichessUsername,
  onLichessUsernameChange,
  verification,
  onVerifySingle,
  onProceed,
  isLoadingStats,
  error,
  required = false,
  onClose,
}: ConnectAccountsStepProps) {
  const showChessCom = platformMode === "both" || platformMode === "chessCom";
  const showLichess = platformMode === "both" || platformMode === "lichess";

  const hasChessComUsername = Boolean(chessComUsername.trim());
  const hasLichessUsername = Boolean(lichessUsername.trim());

  // Debounced auto-verification on input type
  const chessComTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lichessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showChessCom || !hasChessComUsername) return;
    if (chessComTimerRef.current) clearTimeout(chessComTimerRef.current);

    chessComTimerRef.current = setTimeout(() => {
      onVerifySingle(Platforms.CHESS_COM, chessComUsername);
    }, 500);

    return () => {
      if (chessComTimerRef.current) clearTimeout(chessComTimerRef.current);
    };
  }, [chessComUsername, showChessCom]);

  useEffect(() => {
    if (!showLichess || !hasLichessUsername) return;
    if (lichessTimerRef.current) clearTimeout(lichessTimerRef.current);

    lichessTimerRef.current = setTimeout(() => {
      onVerifySingle(Platforms.LICHESS, lichessUsername);
    }, 500);

    return () => {
      if (lichessTimerRef.current) clearTimeout(lichessTimerRef.current);
    };
  }, [lichessUsername, showLichess]);

  const hasRequiredUsernames =
    (showChessCom && hasChessComUsername) || (showLichess && hasLichessUsername);

  const canProceed =
    hasRequiredUsernames &&
    (!showChessCom || hasChessComUsername) &&
    (!showLichess || hasLichessUsername) &&
    !isLoadingStats;

  return (
    <div className="grid gap-8 sm:grid-cols-[1.3fr_0.9fr] items-start">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-vault-bronze">
          Account Discovery
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-normal text-vault-text-primary tracking-tight mt-1">
          Where do you play chess?
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-vault-text-secondary">
          Enter your player usernames. We query public rating servers to verify your accounts before retrieving your profile stats.
        </p>

        {/* Platform Selector Tabs */}
        <div className="mt-5 inline-flex items-center rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-1 gap-1">
          <button
            type="button"
            onClick={() => onPlatformModeChange("both")}
            className={`rounded-xs px-3 py-1 font-mono text-xs transition-colors ${
              platformMode === "both"
                ? "bg-vault-surface-layer-1 text-vault-text-primary shadow-xs border border-vault-border-base"
                : "text-vault-text-muted hover:text-vault-text-secondary"
            }`}
          >
            Both Platforms
          </button>
          <button
            type="button"
            onClick={() => onPlatformModeChange("chessCom")}
            className={`rounded-xs px-3 py-1 font-mono text-xs transition-colors ${
              platformMode === "chessCom"
                ? "bg-vault-surface-layer-1 text-vault-text-primary shadow-xs border border-vault-border-base"
                : "text-vault-text-muted hover:text-vault-text-secondary"
            }`}
          >
            Chess.com Only
          </button>
          <button
            type="button"
            onClick={() => onPlatformModeChange("lichess")}
            className={`rounded-xs px-3 py-1 font-mono text-xs transition-colors ${
              platformMode === "lichess"
                ? "bg-vault-surface-layer-1 text-vault-text-primary shadow-xs border border-vault-border-base"
                : "text-vault-text-muted hover:text-vault-text-secondary"
            }`}
          >
            Lichess Only
          </button>
        </div>

        {/* Input Fields */}
        <div className="mt-5 space-y-4">
          {showChessCom && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                  Chess.com Username
                </label>
                <span className="font-mono text-[10px] text-vault-text-muted">api.chess.com</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-3 py-2 transition-colors focus-within:border-vault-bronze">
                <span className="font-mono text-xs text-vault-text-muted select-none">@</span>
                <input
                  type="text"
                  placeholder="e.g. Sultan_K"
                  value={chessComUsername}
                  onChange={(e) => onChessComUsernameChange(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs text-vault-text-primary placeholder:text-vault-text-muted/50 outline-none"
                />
              </div>
              {verification["chess.com"]?.status === "checking" && (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-text-muted">
                  <Loader2 size={12} className="animate-spin text-vault-bronze" /> Checking Chess.com account...
                </p>
              )}
              {verification["chess.com"]?.status === "valid" && (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-win">
                  <CheckCircle2 size={13} className="text-vault-win shrink-0" /> {verification["chess.com"]?.message}
                </p>
              )}
              {verification["chess.com"]?.status === "invalid" && (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-loss">
                  <AlertCircle size={13} className="text-vault-loss shrink-0" /> {verification["chess.com"]?.message}
                </p>
              )}
            </div>
          )}

          {showLichess && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-vault-text-muted">
                  Lichess Handle
                </label>
                <span className="font-mono text-[10px] text-vault-text-muted">lichess.org/api</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-3 py-2 transition-colors focus-within:border-vault-bronze">
                <span className="font-mono text-xs text-vault-text-muted select-none">@</span>
                <input
                  type="text"
                  placeholder="e.g. Sultan_Knight"
                  value={lichessUsername}
                  onChange={(e) => onLichessUsernameChange(e.target.value)}
                  className="w-full bg-transparent font-mono text-xs text-vault-text-primary placeholder:text-vault-text-muted/50 outline-none"
                />
              </div>
              {verification.lichess?.status === "checking" && (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-text-muted">
                  <Loader2 size={12} className="animate-spin text-vault-bronze" /> Checking Lichess account...
                </p>
              )}
              {verification.lichess?.status === "valid" && (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-win">
                  <CheckCircle2 size={13} className="text-vault-win shrink-0" /> {verification.lichess?.message}
                </p>
              )}
              {verification.lichess?.status === "invalid" && (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-loss">
                  <AlertCircle size={13} className="text-vault-loss shrink-0" /> {verification.lichess?.message}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-vault border border-vault-loss/40 bg-vault-loss/10 p-2.5 font-mono text-xs text-vault-loss flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-vault-loss" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-3 flex items-center gap-3">
            {!required && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="font-mono text-xs uppercase px-4 py-2.5"
              >
                Skip for now
              </Button>
            )}
            <Button
              type="button"
              variant="solid-bronze"
              className="flex-1 font-mono text-xs uppercase py-2.5 flex items-center justify-center gap-2"
              onClick={onProceed}
              disabled={!canProceed}
            >
              {isLoadingStats ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Fetching stats...
                </>
              ) : (
                <>
                  Find my chess profile <ArrowRight size={13} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Guide Column */}
      <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-5 space-y-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-vault-bronze font-semibold">
          How It Works
        </span>

        <div className="space-y-3 font-sans text-xs text-vault-text-secondary leading-relaxed">
          <div className="flex items-start gap-2.5">
            <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-vault-surface-container font-mono text-[10px] text-vault-text-primary">
              1
            </div>
            <div>
              <p className="font-medium text-vault-text-primary">Profile Discovery</p>
              <p className="text-vault-text-muted text-[11px]">We query public rating servers to confirm your accounts as you type.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-vault-surface-container font-mono text-[10px] text-vault-text-primary">
              2
            </div>
            <div>
              <p className="font-medium text-vault-text-primary">Catalog Preview</p>
              <p className="text-vault-text-muted text-[11px]">Review your matches, peak ratings, and format stats before committing to import.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-vault-surface-container font-mono text-[10px] text-vault-text-primary">
              3
            </div>
            <div>
              <p className="font-medium text-vault-text-primary">Ingestion &amp; Analysis</p>
              <p className="text-vault-text-muted text-[11px]">Rapid, Blitz, Bullet, and Daily games are stored permanently into your vault.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-1 p-3 text-[11px] font-mono text-vault-text-muted space-y-1">
          <span className="text-vault-text-secondary font-semibold block">Supported Formats:</span>
          <p>&bull; Standard Chess &amp; Three-Check</p>
          <p>&bull; PGN notation, clocks &amp; ECO openings</p>
        </div>
      </div>
    </div>
  );
}
