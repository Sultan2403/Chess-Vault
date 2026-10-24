import { useState } from "react";
import { useAccountBootstrap } from "../hooks/useAccount";
import { useStartImport } from "../hooks/useImports";
import { OnboardingStepper } from "../components/onboarding/OnboardingStepper";
import { Step1ConnectAccounts, type AccountDraft } from "../components/onboarding/Step1ConnectAccounts";
import { Step2ConfirmPreview } from "../components/onboarding/Step2ConfirmPreview";
import { Step3ImportReady } from "../components/onboarding/Step3ImportReady";
import { Step3LiveStatus } from "../components/onboarding/Step3LiveStatus";
import { Step3WelcomeCelebration } from "../components/onboarding/Step3WelcomeCelebration";
import { useCompleteOnboarding } from "../hooks/useAccount";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";

type Step3View = "ready" | "live" | "welcome";

interface ImportSummaryItem {
  platform: string;
  inserted: number;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { data: bootstrap, isLoading } = useAccountBootstrap();
  const startImport = useStartImport();
  const completeOnboarding = useCompleteOnboarding();

  // Derive initial step from resume state
  const linkedAccounts = bootstrap?.linkedAccounts ?? [];
  const initialStep = linkedAccounts.length > 0 ? 3 : 1;

  const [step, setStep] = useState<1 | 2 | 3 | null>(null);
  const [accountDrafts, setAccountDrafts] = useState<AccountDraft[]>([]);
  const [step3View, setStep3View] = useState<Step3View>("ready");
  const [importSummary, setImportSummary] = useState<ImportSummaryItem[]>([]);
  const [isStartingImport, setIsStartingImport] = useState(false);

  // Resolve effective step (null = waiting for bootstrap)
  const effectiveStep = step ?? (isLoading ? null : initialStep);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleStep1Continue = (accounts: AccountDraft[]) => {
    setAccountDrafts(accounts);
    setStep(2);
  };

  const handleStep2Back = () => {
    setStep(1);
  };

  const handleStep2Success = () => {
    setStep(3);
    setStep3View("ready");
  };

  const handleStartImport = async () => {
    const accounts = bootstrap?.linkedAccounts ?? [];
    if (accounts.length === 0) return;

    setIsStartingImport(true);
    try {
      await Promise.all(
        accounts.map((account) =>
          startImport.mutateAsync({ linkedAccountId: account.id })
        )
      );
      setStep3View("live");
    } catch {
      // mutation error state handled inside Step3ImportReady — show live screen anyway
      // so the user can see any partial progress
      setStep3View("live");
    } finally {
      setIsStartingImport(false);
    }
  };

  const handleImportComplete = (summary: ImportSummaryItem[]) => {
    setImportSummary(summary);
    setStep3View("welcome");
  };

  const handleSkipToApp = async () => {
    try {
      await completeOnboarding.mutateAsync();
    } finally {
      navigate("/dashboard");
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (isLoading || effectiveStep === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-vault-background">
        <Spinner className="w-8 h-8 text-vault-bronze" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-vault-background flex flex-col items-center px-4 py-12">
      <OnboardingStepper currentStep={effectiveStep as 1 | 2 | 3} />

      <div className="w-full">
        {effectiveStep === 1 && (
          <Step1ConnectAccounts
            maxAccounts={bootstrap?.account.plan.linkedAccountLimit ?? 2}
            onContinue={handleStep1Continue}
          />
        )}

        {effectiveStep === 2 && (
          <Step2ConfirmPreview
            accounts={accountDrafts}
            onBack={handleStep2Back}
            onSuccess={handleStep2Success}
          />
        )}

        {effectiveStep === 3 && step3View === "ready" && (
          <Step3ImportReady
            linkedAccounts={linkedAccounts}
            onStartImport={handleStartImport}
            isStarting={isStartingImport}
          />
        )}

        {effectiveStep === 3 && step3View === "live" && (
          <Step3LiveStatus
            linkedAccountIds={linkedAccounts.map((a) => a.id)}
            onComplete={handleImportComplete}
            onSkip={handleSkipToApp}
          />
        )}

        {effectiveStep === 3 && step3View === "welcome" && (
          <Step3WelcomeCelebration summary={importSummary} />
        )}
      </div>
    </div>
  );
}
