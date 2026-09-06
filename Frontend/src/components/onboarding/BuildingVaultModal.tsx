import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Compass, Folder, Server } from "lucide-react";

type BuildingVaultModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onComplete?: () => void;
};

const steps = [
  {
    id: "finding",
    title: "Finding your games",
    subtitle: "Located 1,432 matches",
    icon: Check,
  },
  {
    id: "bringing",
    title: "Bringing your chess history together",
    subtitle: "Importing notation data...",
    icon: Compass,
  },
  {
    id: "organizing",
    title: "Organizing your games",
    subtitle: "Parsing openings and variations",
    icon: Folder,
  },
  {
    id: "preparing",
    title: "Preparing your vault",
    subtitle: "Indexing for discovery",
    icon: Server,
  },
];

export function BuildingVaultModal({
  isOpen,
  onCancel,
  onComplete,
}: BuildingVaultModalProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(1);

  // Simulate progress through the archive building stages
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        setTimeout(() => {
          onComplete?.();
        }, 1500);
        return prev;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-vault border border-vault-outline-variant/80 bg-[#f7f3ea] p-8 sm:p-12 shadow-xl text-center"
        >
          {/* Header (Screenshot 5) */}
          <h1 className="font-display text-3xl font-bold italic text-vault-primary">
            Building your vault...
          </h1>
          <p className="mt-3 text-xs leading-5 text-vault-text-secondary max-w-xs mx-auto">
            We are carefully assembling your chess history into a personal archive.
            This may take a few moments.
          </p>

          {/* Compass / Insignia Spinner Icon */}
          <div className="my-10 flex justify-center">
            <div className="relative grid h-20 w-20 place-items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-vault-ochre/30 border-t-vault-ochre"
              />
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#eee7d8] text-vault-primary shadow-xs">
                <Compass size={22} className="text-vault-primary" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Steps Checklist (Screenshot 5) */}
          <div className="mx-auto max-w-sm space-y-5 text-left">
            {steps.map((step, index) => {
              const isFinished = index < activeStepIndex;
              const isCurrent = index === activeStepIndex;
              const isPending = index > activeStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 transition-opacity duration-300 ${
                    isPending ? "opacity-35" : "opacity-100"
                  }`}
                >
                  {/* Indicator Icon Circle */}
                  <div
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                      isFinished
                        ? "bg-[#eedaa2] text-[#8c6b2d]"
                        : isCurrent
                        ? "border-2 border-vault-primary bg-transparent text-vault-primary"
                        : "border border-vault-outline-variant/60 bg-white/40 text-vault-text-secondary"
                    }`}
                  >
                    {isFinished ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-vault-primary animate-pulse" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-vault-text-secondary/40" />
                    )}
                  </div>

                  {/* Step Title & Subtitle */}
                  <div>
                    <h3 className="text-xs font-bold text-vault-primary">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-vault-text-secondary font-medium mt-0.5">
                      {isCurrent || isFinished ? step.subtitle : "Pending..."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Cancel Button */}
          <div className="mt-12 pt-4">
            <button
              onClick={onCancel}
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-vault-text-secondary hover:text-vault-primary underline underline-offset-4 transition-colors"
            >
              Cancel Import
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
