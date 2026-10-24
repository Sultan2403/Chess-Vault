import { Check } from "lucide-react";

interface OnboardingStepperProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { step: 1, title: "Connect" },
  { step: 2, title: "Confirm" },
  { step: 3, title: "Import" },
] as const;

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
  return (
    <div className="w-full max-w-xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[1px] bg-vault-border-base -z-0" />

        {STEPS.map(({ step, title }) => {
          const isCompleted = currentStep > step;
          const isCurrent = currentStep === step;

          return (
            <div key={step} className="flex flex-col items-center gap-2 relative z-10 bg-vault-background px-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-colors border ${
                  isCompleted
                    ? "bg-vault-bronze text-white border-vault-bronze"
                    : isCurrent
                    ? "bg-vault-surface-layer-1 text-vault-text-primary border-vault-bronze ring-2 ring-vault-bronze/20 font-bold"
                    : "bg-vault-surface-layer-1 text-vault-text-muted border-vault-border-base"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step}
              </div>
              <span
                className={`text-xs font-mono uppercase tracking-wider ${
                  isCurrent
                    ? "text-vault-text-primary font-semibold"
                    : isCompleted
                    ? "text-vault-bronze"
                    : "text-vault-text-muted"
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
