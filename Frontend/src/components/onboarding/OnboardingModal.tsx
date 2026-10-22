import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Platforms } from "@chess-vault/shared";
import type {
  PlatformType,
  VerifyLinkedAccountResult,
  AccountsStatsPreviewResult,
} from "@chess-vault/shared";
import { useStatsPreview } from "../../hooks/useAccount";
import { useImportProgress } from "../../hooks/useSocket";
import { OnboardingHeader, type OnboardingStage } from "./OnboardingHeader";
import { ConnectAccountsStep, type PlatformMode } from "./ConnectAccountsStep";
import { VerifyStatsStep } from "./VerifyStatsStep";
import { ImportProgressStep } from "./ImportProgressStep";

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBeginSync: (platforms: {
    chessComUsername?: string;
    lichessUsername?: string;
  }) => Promise<void>;
  onVerifyAccount: (account: {
    platform: PlatformType;
    username: string;
  }) => Promise<VerifyLinkedAccountResult>;
  required?: boolean;
  initialStage?: OnboardingStage;
  initialAccounts?: Array<{ platform: PlatformType; username: string }>;
};

export function OnboardingModal({
  isOpen,
  onClose,
  onBeginSync,
  onVerifyAccount,
  required = false,
  initialStage = "connect",
  initialAccounts = [],
}: OnboardingModalProps) {
  // Stage management
  const [currentStage, setCurrentStage] = useState<OnboardingStage>(initialStage);

  const initialChessCom = initialAccounts.find((a) => a.platform === Platforms.CHESS_COM)?.username || "";
  const initialLichess = initialAccounts.find((a) => a.platform === Platforms.LICHESS)?.username || "";

  const defaultMode: PlatformMode =
    initialChessCom && !initialLichess
      ? "chessCom"
      : !initialChessCom && initialLichess
      ? "lichess"
      : "both";

  const [platformMode, setPlatformMode] = useState<PlatformMode>(defaultMode);

  // Form input states
  const [chessComUsername, setChessComUsername] = useState(initialChessCom);
  const [lichessUsername, setLichessUsername] = useState(initialLichess);
  const [error, setError] = useState<string>();
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Inline verification per platform (debounced in Step 1)
  const [verification, setVerification] = useState<
    Partial<
      Record<
        PlatformType,
        { status: "idle" | "checking" | "valid" | "invalid"; message?: string }
      >
    >
  >({
    ...(initialChessCom ? { [Platforms.CHESS_COM]: { status: "valid", message: `Found @${initialChessCom}` } } : {}),
    ...(initialLichess ? { [Platforms.LICHESS]: { status: "valid", message: `Found @${initialLichess}` } } : {}),
  });

  // Verified profile & stats data for Step 2
  const [statsPreview, setStatsPreview] = useState<AccountsStatsPreviewResult>(
    {},
  );

  // Step 3 Import progress and triggering
  const [isImportTriggered, setIsImportTriggered] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string>(
    "Connecting accounts and initiating import...",
  );
  const { importProgress, importComplete } = useImportProgress();
  const statsPreviewMutation = useStatsPreview();

  // Watch for import socket completion
  useEffect(() => {
    if (importComplete && isImportTriggered) {
      if (importComplete.success) {
        setImportStatusMessage("All games indexed successfully!");
      } else {
        setImportStatusMessage(
          importComplete.message || "Import completed with issues.",
        );
      }
    }
  }, [importComplete, isImportTriggered]);

  // If opening directly into stage "verify" with existing accounts, auto-fetch stats
  useEffect(() => {
    if (isOpen && initialStage === "verify" && initialAccounts.length > 0) {
      setIsLoadingStats(true);
      statsPreviewMutation
        .mutateAsync({ accounts: initialAccounts })
        .then((res) => {
          const payload = (res as any)?.data ?? res ?? {};
          setStatsPreview(payload);
        })
        .catch(() => undefined)
        .finally(() => setIsLoadingStats(false));
    }
  }, [isOpen, initialStage]);

  const showChessCom = platformMode === "both" || platformMode === "chessCom";
  const showLichess = platformMode === "both" || platformMode === "lichess";

  // Single account check function passed down to Step 1
  const handleVerifySingle = async (
    platform: PlatformType,
    username: string,
  ) => {
    const cleaned = username.trim();
    if (!cleaned) return { success: false, username };

    setVerification((prev) => ({
      ...prev,
      [platform]: { status: "checking" },
    }));

    try {
      const res = await onVerifyAccount({ platform, username: cleaned });
      setVerification((prev) => ({
        ...prev,
        [platform]: {
          status: res.success ? "valid" : "invalid",
          message: res.success ? `Found @${res.username}` : res.message,
        },
      }));
      return res;
    } catch {
      setVerification((prev) => ({
        ...prev,
        [platform]: {
          status: "invalid",
          message: `Unable to verify ${platform} account.`,
        },
      }));
      return { success: false, username };
    }
  };

  // Transition from Step 1 to Step 2: Fetch stats for verified accounts in ONE batch call
  const handleProceedToVerify = async () => {
    setError(undefined);
    setIsLoadingStats(true);

    try {
      const accountsToVerify: Array<{
        platform: PlatformType;
        username: string;
      }> = [];
      if (showChessCom && chessComUsername.trim()) {
        accountsToVerify.push({
          platform: Platforms.CHESS_COM,
          username: chessComUsername.trim(),
        });
      }
      if (showLichess && lichessUsername.trim()) {
        accountsToVerify.push({
          platform: Platforms.LICHESS,
          username: lichessUsername.trim(),
        });
      }

      if (accountsToVerify.length === 0) {
        setError("Please enter at least one username.");
        setIsLoadingStats(false);
        return;
      }

      // Ensure any unverified account is confirmed first
      for (const acc of accountsToVerify) {
        if (verification[acc.platform]?.status !== "valid") {
          const res = await handleVerifySingle(acc.platform, acc.username);
          if (!res.success) {
            setIsLoadingStats(false);
            return;
          }
        }
      }

      // Single batch call accepting array of accounts to fetch stats exclusively in Step 2
      const previewRes = await statsPreviewMutation.mutateAsync({
        accounts: accountsToVerify,
      });

      const payload = previewRes;
      setStatsPreview(payload);
      setCurrentStage("verify");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please check your usernames.",
      );
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Transition from Step 2 to Step 3: Trigger real import
  const handleStartImport = async () => {
    setError(undefined);
    setCurrentStage("import");
    setIsImportTriggered(true);

    try {
      await onBeginSync({
        chessComUsername: showChessCom
          ? chessComUsername.trim() || undefined
          : undefined,
        lichessUsername: showLichess
          ? lichessUsername.trim() || undefined
          : undefined,
      });
      setImportStatusMessage(
        "Accounts connected! Ingestion queue running in background...",
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to initiate import.",
      );
    }
  };

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
            onChessComUsernameChange={(val) => {
              setChessComUsername(val);
              setVerification((prev) => ({
                ...prev,
                [Platforms.CHESS_COM]: { status: "idle" },
              }));
            }}
            lichessUsername={lichessUsername}
            onLichessUsernameChange={(val) => {
              setLichessUsername(val);
              setVerification((prev) => ({
                ...prev,
                [Platforms.LICHESS]: { status: "idle" },
              }));
            }}
            verification={verification}
            onVerifySingle={handleVerifySingle}
            onProceed={handleProceedToVerify}
            isLoadingStats={isLoadingStats}
            error={error}
            required={required}
            onClose={onClose}
          />
        )}

        {currentStage === "verify" && (
          <VerifyStatsStep
            statsPreview={statsPreview}
            onBack={() => setCurrentStage("connect")}
            onContinue={handleStartImport}
          />
        )}

        {currentStage === "import" && (
          <ImportProgressStep
            importStatusMessage={importStatusMessage}
            importProgress={importProgress}
            importComplete={importComplete}
            onGoToDashboard={onClose}
          />
        )}
      </div>
    </Modal>
  );
}
