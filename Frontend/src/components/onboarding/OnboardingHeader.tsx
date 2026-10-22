import { ShieldCheck } from "lucide-react";

export type OnboardingStage = "connect" | "verify" | "import";

type OnboardingHeaderProps = {
  currentStage: OnboardingStage;
};

export function OnboardingHeader({ currentStage }: OnboardingHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-vault-border-base pb-4 mb-6">
      <div className="flex items-center gap-6">
        <div
          className={`flex items-center gap-2 ${
            currentStage === "connect"
              ? "text-vault-bronze font-bold"
              : "text-vault-text-muted"
          }`}
        >
          <span
            className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-mono border ${
              currentStage === "connect"
                ? "border-vault-bronze bg-vault-bronze/10"
                : "border-vault-border-base"
            }`}
          >
            1
          </span>
          <span className="text-xs font-mono uppercase tracking-wider">Connect</span>
        </div>

        <span className="text-vault-border-interactive">/</span>

        <div
          className={`flex items-center gap-2 ${
            currentStage === "verify"
              ? "text-vault-bronze font-bold"
              : "text-vault-text-muted"
          }`}
        >
          <span
            className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-mono border ${
              currentStage === "verify"
                ? "border-vault-bronze bg-vault-bronze/10"
                : "border-vault-border-base"
            }`}
          >
            2
          </span>
          <span className="text-xs font-mono uppercase tracking-wider">Verify Stats</span>
        </div>

        <span className="text-vault-border-interactive">/</span>

        <div
          className={`flex items-center gap-2 ${
            currentStage === "import"
              ? "text-vault-bronze font-bold"
              : "text-vault-text-muted"
          }`}
        >
          <span
            className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-mono border ${
              currentStage === "import"
                ? "border-vault-bronze bg-vault-bronze/10"
                : "border-vault-border-base"
            }`}
          >
            3
          </span>
          <span className="text-xs font-mono uppercase tracking-wider">Import</span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-vault-text-muted">
        <ShieldCheck size={13} className="text-vault-win" />
        <span>Public API &bull; No passwords</span>
      </div>
    </div>
  );
}
