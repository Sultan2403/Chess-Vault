import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Compass, Folder, Server } from "lucide-react";
import { Button } from "../ui/Button";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-lg overflow-hidden rounded-vault border border-vault-border-interactive bg-vault-surface-layer-1 p-8 sm:p-10 shadow-2xl text-center text-vault-text-primary"
        >
          {/* Header */}
          <h1 className="font-display text-2xl sm:text-3xl font-normal text-vault-text-primary tracking-tight">
            Building your vault...
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-vault-text-secondary max-w-xs mx-auto">
            We are carefully assembling your chess history into your personal archive.
          </p>

          {/* Compass / Insignia Spinner Icon */}
          <div className="my-8 flex justify-center">
            <div className="relative grid h-20 w-20 place-items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-vault-bronze/20 border-t-vault-bronze"
              />
              <div className="grid h-12 w-12 place-items-center rounded-full border border-vault-border-base bg-vault-surface-layer-2 text-vault-bronze shadow-inner">
                <Compass size={22} className="text-vault-bronze" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Steps Checklist */}
          <div className="mx-auto max-w-sm space-y-4 text-left">
            {steps.map((step, index) => {
              const isFinished = index < activeStepIndex;
              const isCurrent = index === activeStepIndex;
              const isPending = index > activeStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3.5 transition-opacity duration-300 ${
                    isPending ? "opacity-35" : "opacity-100"
                  }`}
                >
                  {/* Indicator Icon Circle */}
                  <div
                    className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                      isFinished
                        ? "border border-vault-bronze/40 bg-vault-bronze/20 text-vault-bronze"
                        : isCurrent
                        ? "border-2 border-vault-bronze bg-transparent text-vault-bronze"
                        : "border border-vault-border-base bg-vault-surface-layer-2/50 text-vault-text-muted"
                    }`}
                  >
                    {isFinished ? (
                      <Check size={13} strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-vault-bronze animate-pulse" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-vault-text-muted/40" />
                    )}
                  </div>

                  {/* Step Title & Subtitle */}
                  <div>
                    <h3 className="text-xs font-semibold text-vault-text-primary">
                      {step.title}
                    </h3>
                    <p className="text-[11px] font-mono text-vault-text-muted mt-0.5">
                      {isCurrent || isFinished ? step.subtitle : "Pending..."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Cancel Button */}
          <div className="mt-8 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="font-mono text-xs uppercase text-vault-text-muted hover:text-vault-text-primary"
            >
              Cancel Import
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
