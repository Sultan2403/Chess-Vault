import { useState, useEffect, useCallback, useMemo } from "react";
import { Platforms } from "@chess-vault/shared";
import type {
  PlatformType,
  VerifyLinkedAccountResult,
  AccountsStatsPreviewResult,
} from "@chess-vault/shared";
import {
  useConnectLinkedAccounts,
  useVerifyLinkedAccount,
  useStatsPreview,
} from "./useAccount";
import { useImportGames } from "./useGames";
import { useImportProgress } from "./useSocket";
import { getApiErrorMessage } from "../utils/apiError";
import type { OnboardingStage } from "../components/onboarding/OnboardingHeader";
import type { PlatformMode } from "../components/onboarding/ConnectAccountsStep";

export type VerificationState = Partial<
  Record<
    PlatformType,
    { status: "idle" | "checking" | "valid" | "invalid"; message?: string }
  >
>;

export type UseOnboardingStateProps = {
  isOpen: boolean;
  initialStage?: OnboardingStage;
  initialAccounts?: Array<{ platform: PlatformType; username: string }>;
  onSuccess?: () => void;
};

export function useOnboardingState({
  isOpen,
  initialStage = "connect",
  initialAccounts = [],
  onSuccess,
}: UseOnboardingStateProps) {
  // Extract initial platform values safely
  const initialChessCom = useMemo(
    () =>
      initialAccounts.find((a) => a.platform === Platforms.CHESS_COM)
        ?.username || "",
    [initialAccounts],
  );
  const initialLichess = useMemo(
    () =>
      initialAccounts.find((a) => a.platform === Platforms.LICHESS)?.username ||
      "",
    [initialAccounts],
  );

  const computeInitialMode = useCallback((): PlatformMode => {
    if (initialChessCom && !initialLichess) return "chessCom";
    if (!initialChessCom && initialLichess) return "lichess";
    return "both";
  }, [initialChessCom, initialLichess]);

  // Core Stage & Mode State
  const [currentStage, setCurrentStage] = useState<OnboardingStage>(initialStage);
  const [platformMode, setPlatformMode] = useState<PlatformMode>(computeInitialMode);

  // Usernames
  const [chessComUsername, setChessComUsername] = useState(initialChessCom);
  const [lichessUsername, setLichessUsername] = useState(initialLichess);

  // Verification state map
  const [verification, setVerification] = useState<VerificationState>({});

  // Stats Preview State (Step 2)
  const [statsPreview, setStatsPreview] = useState<AccountsStatsPreviewResult | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Import State (Step 3)
  const [isImportTriggered, setIsImportTriggered] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string>(
    "Connecting accounts and starting import...",
  );
  const [importError, setImportError] = useState<string | null>(null);

  // External mutations & queries
  const verificationMutation = useVerifyLinkedAccount();
  const statsPreviewMutation = useStatsPreview();
  const connectMutation = useConnectLinkedAccounts();
  const importGamesMutation = useImportGames();
  const { importProgress, importComplete } = useImportProgress();

  // Reset or hydrate state whenever the modal opens or initial values change
  useEffect(() => {
    if (!isOpen) return;

    setCurrentStage(initialStage);
    setPlatformMode(computeInitialMode());
    setChessComUsername(initialChessCom);
    setLichessUsername(initialLichess);

    const initialVerification: VerificationState = {};
    if (initialChessCom) {
      initialVerification[Platforms.CHESS_COM] = {
        status: "valid",
        message: `Found @${initialChessCom}`,
      };
    }
    if (initialLichess) {
      initialVerification[Platforms.LICHESS] = {
        status: "valid",
        message: `Found @${initialLichess}`,
      };
    }
    setVerification(initialVerification);

    setStatsError(null);
    setImportError(null);
    setIsImportTriggered(false);

    // If opening straight into "verify", immediately fetch stats
    if (initialStage === "verify" && initialAccounts.length > 0) {
      setIsLoadingStats(true);
      statsPreviewMutation
        .mutateAsync({ accounts: initialAccounts })
        .then((data) => {
          setStatsPreview(data);
        })
        .catch((err) => {
          setStatsError(getApiErrorMessage(err));
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    } else {
      setStatsPreview(null);
    }
  }, [isOpen, initialStage, initialChessCom, initialLichess]);

  // Mode-based visibility
  const showChessCom = platformMode === "both" || platformMode === "chessCom";
  const showLichess = platformMode === "both" || platformMode === "lichess";

  // Watch for socket completion
  useEffect(() => {
    if (importComplete && isImportTriggered) {
      if (importComplete.success) {
        setImportStatusMessage("All games indexed successfully!");
        onSuccess?.();
      } else {
        setImportStatusMessage(
          importComplete.message || "Import completed with issues.",
        );
      }
    }
  }, [importComplete, isImportTriggered, onSuccess]);

  // Change platform mode & clean up dormant states
  const handlePlatformModeChange = useCallback(
    (mode: PlatformMode) => {
      setPlatformMode(mode);
      setVerification((prev) => {
        const next = { ...prev };
        if (mode === "chessCom") {
          delete next[Platforms.LICHESS];
        } else if (mode === "lichess") {
          delete next[Platforms.CHESS_COM];
        }
        return next;
      });
      setStatsError(null);
    },
    [],
  );

  // Single account verification
  const handleVerifySingle = useCallback(
    async (
      platform: PlatformType,
      username: string,
    ): Promise<VerifyLinkedAccountResult> => {
      const cleaned = username.trim();
      if (!cleaned) return { success: false, username };

      setVerification((prev) => ({
        ...prev,
        [platform]: { status: "checking" },
      }));

      try {
        const res = await verificationMutation.mutateAsync({
          platform,
          username: cleaned,
        });
        setVerification((prev) => ({
          ...prev,
          [platform]: {
            status: res.success ? "valid" : "invalid",
            message: res.success ? `Found @${res.username}` : res.message,
          },
        }));
        return res;
      } catch (err: unknown) {
        const msg = getApiErrorMessage(err);
        setVerification((prev) => ({
          ...prev,
          [platform]: {
            status: "invalid",
            message: msg || `Unable to verify ${platform} account.`,
          },
        }));
        return { success: false, username };
      }
    },
    [verificationMutation],
  );

  // Active accounts based on current mode and inputs
  const activeAccounts = useMemo(() => {
    const list: Array<{ platform: PlatformType; username: string }> = [];
    if (showChessCom && chessComUsername.trim()) {
      list.push({
        platform: Platforms.CHESS_COM,
        username: chessComUsername.trim(),
      });
    }
    if (showLichess && lichessUsername.trim()) {
      list.push({
        platform: Platforms.LICHESS,
        username: lichessUsername.trim(),
      });
    }
    return list;
  }, [showChessCom, showLichess, chessComUsername, lichessUsername]);

  // Transition: Step 1 -> Step 2 (Batch Stats Fetch)
  const handleProceedToVerify = useCallback(async () => {
    setStatsError(null);

    if (activeAccounts.length === 0) {
      setStatsError("Please enter at least one player username.");
      return;
    }

    setIsLoadingStats(true);

    try {
      // Verify any unverified account first
      for (const acc of activeAccounts) {
        if (verification[acc.platform]?.status !== "valid") {
          const res = await handleVerifySingle(acc.platform, acc.username);
          if (!res.success) {
            setIsLoadingStats(false);
            return;
          }
        }
      }

      const previewRes = await statsPreviewMutation.mutateAsync({
        accounts: activeAccounts,
      });

      setStatsPreview(previewRes);
      setCurrentStage("verify");
    } catch (err: unknown) {
      setStatsError(getApiErrorMessage(err));
    } finally {
      setIsLoadingStats(false);
    }
  }, [
    activeAccounts,
    verification,
    handleVerifySingle,
    statsPreviewMutation,
  ]);

  // Transition: Step 2 -> Step 3 (Connect Linked Accounts & Queue Imports)
  const handleStartImport = useCallback(async () => {
    setImportError(null);
    setCurrentStage("import");
    setIsImportTriggered(true);
    setImportStatusMessage("Connecting accounts to your vault...");

    try {
      const connectResult = await connectMutation.mutateAsync({
        accounts: activeAccounts,
      });

      if (!connectResult.success) {
        throw new Error(
          connectResult.results
            .map((conn) => conn.message)
            .filter(Boolean)
            .join(" ") || connectResult.message,
        );
      }

      setImportStatusMessage("Queueing match history import...");

      // Queue background imports for each account
      for (const acc of activeAccounts) {
        try {
          await importGamesMutation.mutateAsync({
            platform: acc.platform,
            username: acc.username,
          });
        } catch (importErr) {
          console.error("Failed to queue background import for", acc.platform, importErr);
        }
      }

      setImportStatusMessage(
        "Accounts connected! Ingestion queue running in background...",
      );
    } catch (err: unknown) {
      setImportError(getApiErrorMessage(err));
    }
  }, [activeAccounts, connectMutation, importGamesMutation]);

  return {
    currentStage,
    setCurrentStage,
    platformMode,
    setPlatformMode: handlePlatformModeChange,
    chessComUsername,
    setChessComUsername: (val: string) => {
      setChessComUsername(val);
      setVerification((prev) => ({
        ...prev,
        [Platforms.CHESS_COM]: { status: "idle" },
      }));
    },
    lichessUsername,
    setLichessUsername: (val: string) => {
      setLichessUsername(val);
      setVerification((prev) => ({
        ...prev,
        [Platforms.LICHESS]: { status: "idle" },
      }));
    },
    verification,
    handleVerifySingle,
    statsPreview,
    isLoadingStats,
    statsError,
    handleProceedToVerify,
    retryFetchStats: handleProceedToVerify,
    handleStartImport,
    importStatusMessage,
    importProgress,
    importComplete,
    importError,
    showChessCom,
    showLichess,
  };
}
