import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Platforms } from "@chess-vault/shared";
import type { PlatformType, VerifyLinkedAccountResult } from "@chess-vault/shared";

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBeginSync: (platforms: { chessComUsername?: string; lichessUsername?: string }) => Promise<void>;
  onVerifyAccount: (account: {
    platform: PlatformType;
    username: string;
  }) => Promise<VerifyLinkedAccountResult>;
  required?: boolean;
};

export function OnboardingModal({
  isOpen,
  onClose,
  onBeginSync,
  onVerifyAccount,
  required = false,
}: OnboardingModalProps) {
  const [chessComUsername, setChessComUsername] = useState("");
  const [lichessUsername, setLichessUsername] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState<
    Partial<Record<PlatformType, { status: "idle" | "checking" | "valid" | "invalid"; message?: string }>>
  >({});

  const hasChessComUsername = Boolean(chessComUsername.trim());
  const hasLichessUsername = Boolean(lichessUsername.trim());
  const hasAtLeastOneUsername = hasChessComUsername || hasLichessUsername;
  const areEnteredAccountsVerified =
    (!hasChessComUsername || verification[Platforms.CHESS_COM]?.status === "valid") &&
    (!hasLichessUsername || verification[Platforms.LICHESS]?.status === "valid");
  const canConnect =
    hasAtLeastOneUsername && areEnteredAccountsVerified && !isSubmitting;

  if (!isOpen) return null;

  const verifyAccount = async (platform: PlatformType, username: string) => {
    const cleanedUsername = username.trim();
    if (!cleanedUsername) return false;

    setVerification((current) => ({
      ...current,
      [platform]: { status: "checking" },
    }));

    try {
      const result = await onVerifyAccount({ platform, username: cleanedUsername });
      setVerification((current) => ({
        ...current,
        [platform]: {
          status: result.success ? "valid" : "invalid",
          message: result.success ? `Found ${result.username}` : result.message,
        },
      }));
      return result.success;
    } catch {
      setVerification((current) => ({
        ...current,
        [platform]: {
          status: "invalid",
          message: "We couldn't verify that account right now.",
        },
      }));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const platforms = {
      chessComUsername: chessComUsername.trim() || undefined,
      lichessUsername: lichessUsername.trim() || undefined,
    };

    if (!platforms.chessComUsername && !platforms.lichessUsername) {
      setError("Connect at least one chess account to build your vault.");
      return;
    }

    const accountsToVerify: Array<{ platform: PlatformType; username: string }> = [];
    if (platforms.chessComUsername) {
      accountsToVerify.push({ platform: Platforms.CHESS_COM, username: platforms.chessComUsername });
    }
    if (platforms.lichessUsername) {
      accountsToVerify.push({ platform: Platforms.LICHESS, username: platforms.lichessUsername });
    }

    for (const account of accountsToVerify) {
      if (verification[account.platform]?.status !== "valid") {
        const isValid = await verifyAccount(account.platform, account.username);
        if (!isValid) return;
      }
    }

    setError(undefined);
    setIsSubmitting(true);
    try {
      await onBeginSync(platforms);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We couldn't connect those accounts. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-vault border border-vault-border-interactive bg-vault-surface-layer-1 p-6 sm:p-8 shadow-2xl text-vault-text-primary"
        >
          {/* Top Brand Tag */}
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-normal text-vault-text-primary tracking-tight">
              Chess Vault
            </h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-vault-bronze">
              Personal Archive & Registry
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-[1.2fr_0.8fr] items-center">
            {/* Left Form */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-normal text-vault-text-primary leading-tight tracking-tight">
                Let's build your vault.
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-vault-text-secondary">
                Tell us where you play chess and we'll bring your games into your permanent archive.
              </p>
              <p className="mt-1.5 font-mono text-[11px] leading-5 text-vault-text-muted">
                Enter your exact public username. We'll verify it before connecting.
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-vault-text-muted mb-1.5">
                    Chess.com Username
                  </label>
                  <div className="flex items-center gap-2.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-3 py-2 transition-colors focus-within:border-vault-bronze">
                    <User size={14} className="text-vault-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. magnuscarlsen"
                      value={chessComUsername}
                      onChange={(e) => {
                        setChessComUsername(e.target.value);
                        setVerification((current) => ({ ...current, [Platforms.CHESS_COM]: { status: "idle" } }));
                      }}
                      onBlur={() => verifyAccount(Platforms.CHESS_COM, chessComUsername)}
                      className="w-full bg-transparent font-mono text-xs text-vault-text-primary placeholder:text-vault-text-muted/50 outline-none"
                    />
                  </div>
                  {verification["chess.com"]?.status === "checking" && (
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-text-muted">
                      <Loader2 size={12} className="animate-spin text-vault-bronze" /> Checking Chess.com account...
                    </p>
                  )}
                  {verification["chess.com"]?.status === "valid" && (
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> {verification["chess.com"]?.message}
                    </p>
                  )}
                  {verification["chess.com"]?.status === "invalid" && (
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-rose-400">
                      <AlertCircle size={13} className="text-rose-400 shrink-0" /> {verification["chess.com"]?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-vault-text-muted mb-1.5">
                    Lichess Username
                  </label>
                  <div className="flex items-center gap-2.5 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 px-3 py-2 transition-colors focus-within:border-vault-bronze">
                    <User size={14} className="text-vault-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. DrNykterstein"
                      value={lichessUsername}
                      onChange={(e) => {
                        setLichessUsername(e.target.value);
                        setVerification((current) => ({ ...current, [Platforms.LICHESS]: { status: "idle" } }));
                      }}
                      onBlur={() => verifyAccount(Platforms.LICHESS, lichessUsername)}
                      className="w-full bg-transparent font-mono text-xs text-vault-text-primary placeholder:text-vault-text-muted/50 outline-none"
                    />
                  </div>
                  {verification.lichess?.status === "checking" && (
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-vault-text-muted">
                      <Loader2 size={12} className="animate-spin text-vault-bronze" /> Checking Lichess account...
                    </p>
                  )}
                  {verification.lichess?.status === "valid" && (
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> {verification.lichess?.message}
                    </p>
                  )}
                  {verification.lichess?.status === "invalid" && (
                    <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-rose-400">
                      <AlertCircle size={13} className="text-rose-400 shrink-0" /> {verification.lichess?.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-vault border border-vault-loss/40 bg-vault-loss/10 p-2.5 font-mono text-xs text-rose-300 flex items-start gap-2" role="alert">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
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
                    type="submit"
                    variant="solid-bronze"
                    className="flex-1 font-mono text-xs uppercase py-2.5"
                    disabled={!canConnect}
                  >
                    {isSubmitting ? "Connecting..." : "Connect accounts"} <ArrowRight size={13} />
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Archival Preview */}
            <div className="flex flex-col gap-3 rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-3.5">
              <div className="relative overflow-hidden rounded-vault border border-vault-border-interactive aspect-4/3 bg-vault-surface-container-lowest">
                <img
                  src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=500&auto=format&fit=crop&q=80"
                  alt="Chess piece archive"
                  className="h-full w-full object-cover opacity-60 brightness-90 contrast-110 grayscale-[40%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-vault-surface-layer-1 via-vault-surface-layer-1/20 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 font-mono text-[10px] text-vault-text-secondary">
                  <span className="text-vault-bronze font-semibold">LEDGER REGISTRY</span>
                  <p className="text-[11px] font-sans text-vault-text-primary mt-0.5 font-medium leading-tight">
                    Multi-platform game ingestion & opening classification
                  </p>
                </div>
              </div>
              <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1/80 p-2.5 font-mono text-[10px] text-vault-text-muted space-y-1">
                <div className="flex items-center justify-between">
                  <span>FEDERATION</span>
                  <span className="text-vault-win font-semibold">ONLINE</span>
                </div>
                <div className="text-vault-text-secondary font-sans text-xs">
                  Chess.com &bull; Lichess.org
                </div>
              </div>
            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="mt-6 flex justify-center items-center gap-1.5">
            <span className="h-1 w-6 rounded-full bg-vault-bronze" />
            <span className="h-1 w-1.5 rounded-full bg-vault-border-interactive" />
            <span className="h-1 w-1.5 rounded-full bg-vault-border-interactive" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
