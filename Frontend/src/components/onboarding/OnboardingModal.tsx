import { Modal } from "../ui/Modal";
import type { PlatformType } from "@chess-vault/shared";
import { OnboardingHeader, type OnboardingStage } from "./OnboardingHeader";
import { ConnectAccountsStep } from "./ConnectAccountsStep";
import { VerifyStatsStep } from "./VerifyStatsStep";
import { ImportProgressStep } from "./ImportProgressStep";
import { useOnboardingState } from "../../hooks/useOnboardingState";

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  required?: boolean;
  initialStage?: OnboardingStage;
  initialAccounts?: Array<{ platform: PlatformType; username: string }>;
  onSuccess?: () => void;
};

export function OnboardingModal({
  isOpen,
  onClose,
  required = false,
  initialStage = "connect",
  initialAccounts = [],
  onSuccess,
}: OnboardingModalProps) {
  const {
    currentStage,
    setCurrentStage,
    platformMode,
    setPlatformMode,
    chessComUsername,
    setChessComUsername,
    lichessUsername,
    setLichessUsername,
    verification,
    handleVerifySingle,
    statsPreview,
    isLoadingStats,
    statsError,
    handleProceedToVerify,
    retryFetchStats,
    handleStartImport,
    importStatusMessage,
    importProgress,
    importComplete,
    importError,
  } = useOnboardingState({
    isOpen,
    initialStage,
    initialAccounts,
    onSuccess,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={required ? () => {} : onClose}
      blurScreen={true}
      maxWidth="3xl"
      showCloseButton={!required}
      closeOnBackdropClick={!required}
      closeOnEscape={!required}
      className="p-6 sm:p-8"
    >
      <div>
        <OnboardingHeader currentStage={currentStage} />

        {currentStage === "connect" && (
          <ConnectAccountsStep
            platformMode={platformMode}
            onPlatformModeChange={setPlatformMode}
            chessComUsername={chessComUsername}
            onChessComUsernameChange={setChessComUsername}
            lichessUsername={lichessUsername}
            onLichessUsernameChange={setLichessUsername}
            verification={verification}
            onVerifySingle={handleVerifySingle}
            onProceed={handleProceedToVerify}
            isLoadingStats={isLoadingStats}
            error={statsError ?? undefined}
            required={required}
            onClose={onClose}
          />
        )}

        {currentStage === "verify" && (
          <VerifyStatsStep
            statsPreview={statsPreview}
            isLoading={isLoadingStats}
            error={statsError}
            onRetry={retryFetchStats}
            onBack={() => setCurrentStage("connect")}
            onContinue={handleStartImport}
          />
        )}

        {currentStage === "import" && (
          <ImportProgressStep
            importStatusMessage={importStatusMessage}
            importProgress={importProgress}
            importComplete={importComplete}
            error={importError ?? undefined}
            onRetry={handleStartImport}
            onGoToDashboard={onClose}
          />
        )}
      </div>
    </Modal>
  );
}
