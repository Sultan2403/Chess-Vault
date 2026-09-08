import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, ArrowRight, CheckCircle2 } from "lucide-react";
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-vault border border-vault-outline-variant/80 bg-[#f7f3ea] p-8 sm:p-10 shadow-xl"
        >
          {/* Top Brand Tag */}
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold italic text-vault-primary">
              Chess Vault
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-vault-text-secondary">
              Personal Archive
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-[1.15fr_0.85fr] items-center">
            {/* Left Form */}
            <div>
              <h1 className="font-display text-3xl font-bold text-vault-primary leading-tight">
                Let's build your vault.
              </h1>
              <p className="mt-3 text-xs leading-5 text-vault-text-secondary">
                Tell us where you play chess and we'll bring your games into Chess Vault.
              </p>
              <p className="mt-2 text-[11px] leading-5 text-vault-text-secondary">
                Enter your exact public username from each platform. We’ll verify it before you connect it.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-vault-text-secondary mb-1">
                    Chess.com Username
                  </label>
                  <div className="flex items-center gap-2 border border-vault-outline-variant/80 bg-white px-3 py-2 rounded-vault shadow-2xs">
                    <User size={14} className="text-vault-text-secondary/70 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. magnuscarlsen"
                      value={chessComUsername}
                      onChange={(e) => {
                        setChessComUsername(e.target.value);
                        setVerification((current) => ({ ...current, [Platforms.CHESS_COM]: { status: "idle" } }));
                      }}
                      onBlur={() => verifyAccount(Platforms.CHESS_COM, chessComUsername)}
                      className="w-full bg-transparent text-xs text-vault-primary placeholder:text-vault-text-secondary/50 outline-none"
                    />
                  </div>
                  {verification["chess.com"]?.status === "checking" && (
                    <p className="mt-1 text-[11px] text-vault-text-secondary">Checking Chess.com account...</p>
                  )}
                  {verification["chess.com"]?.status === "valid" && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-green-700"><CheckCircle2 size={12} /> {verification["chess.com"]?.message}</p>
                  )}
                  {verification["chess.com"]?.status === "invalid" && (
                    <p className="mt-1 text-[11px] text-red-700">{verification["chess.com"]?.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-vault-text-secondary mb-1">
                    Lichess Username
                  </label>
                  <div className="flex items-center gap-2 border border-vault-outline-variant/80 bg-white px-3 py-2 rounded-vault shadow-2xs">
                    <User size={14} className="text-vault-text-secondary/70 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. DrNykterstein"
                      value={lichessUsername}
                      onChange={(e) => {
                        setLichessUsername(e.target.value);
                        setVerification((current) => ({ ...current, [Platforms.LICHESS]: { status: "idle" } }));
                      }}
                      onBlur={() => verifyAccount(Platforms.LICHESS, lichessUsername)}
                      className="w-full bg-transparent text-xs text-vault-primary placeholder:text-vault-text-secondary/50 outline-none"
                    />
                  </div>
                  {verification.lichess?.status === "checking" && (
                    <p className="mt-1 text-[11px] text-vault-text-secondary">Checking Lichess account...</p>
                  )}
                  {verification.lichess?.status === "valid" && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-green-700"><CheckCircle2 size={12} /> {verification.lichess?.message}</p>
                  )}
                  {verification.lichess?.status === "invalid" && (
                    <p className="mt-1 text-[11px] text-red-700">{verification.lichess?.message}</p>
                  )}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  {!required && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-vault border border-vault-outline-variant/60 bg-white/70 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-vault-primary hover:bg-white transition-colors"
                    >
                      Skip for now
                    </button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                    disabled={!canConnect}
                  >
                    {isSubmitting ? "Connecting..." : "Connect accounts"} <ArrowRight size={13} />
                  </Button>
                </div>
                {error && (
                  <p className="text-xs leading-5 text-red-700" role="alert">
                    {error}
                  </p>
                )}
              </form>
            </div>

            {/* Right Artwork Stack (Screenshot 1) */}
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-vault border border-vault-outline-variant/60 shadow-xs aspect-4/3 bg-[#ebd8be]">
                <img
                  src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=500&auto=format&fit=crop&q=80"
                  alt="Chess knight piece"
                  className="h-full w-full object-cover sepia-50 brightness-95"
                />
              </div>
              <div className="overflow-hidden rounded-vault border border-vault-outline-variant/60 shadow-xs aspect-4/3 bg-[#e0ceb5] opacity-75">
                <img
                  src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=500&auto=format&fit=crop&q=80"
                  alt="Chess piece blurred"
                  className="h-full w-full object-cover sepia-75 brightness-90 blur-[1px]"
                />
              </div>
            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="mt-8 flex justify-center items-center gap-1.5">
            <span className="h-1 w-6 rounded-full bg-vault-ochre" />
            <span className="h-1 w-1 rounded-full bg-vault-outline-variant" />
            <span className="h-1 w-1 rounded-full bg-vault-outline-variant" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
