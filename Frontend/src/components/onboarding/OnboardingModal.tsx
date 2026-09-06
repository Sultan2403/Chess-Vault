import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";


type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBeginSync: (platforms: { chessComUsername?: string; lichessUsername?: string }) => void;
};

export function OnboardingModal({ isOpen, onClose, onBeginSync }: OnboardingModalProps) {
  const [chessComUsername, setChessComUsername] = useState("");
  const [lichessUsername, setLichessUsername] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBeginSync({
      chessComUsername: chessComUsername.trim() || undefined,
      lichessUsername: lichessUsername.trim() || undefined,
    });
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
                      onChange={(e) => setChessComUsername(e.target.value)}
                      className="w-full bg-transparent text-xs text-vault-primary placeholder:text-vault-text-secondary/50 outline-none"
                    />
                  </div>
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
                      onChange={(e) => setLichessUsername(e.target.value)}
                      className="w-full bg-transparent text-xs text-vault-primary placeholder:text-vault-text-secondary/50 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-vault border border-vault-outline-variant/60 bg-white/70 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-vault-primary hover:bg-white transition-colors"
                  >
                    Skip for now
                  </button>
                  <Button
                    type="submit"
                    className="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                  >
                    Begin Archive <ArrowRight size={13} />
                  </Button>
                </div>
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
