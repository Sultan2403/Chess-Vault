import { useEffect } from "react";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { useStatsPreview, useConnectLinkedAccounts } from "../../hooks/useAccount";
import { Spinner } from "../ui/Spinner";
import type { AccountDraft } from "./Step1ConnectAccounts";

interface Step2ConfirmPreviewProps {
  accounts: AccountDraft[];
  onBack: () => void;
  onSuccess: () => void;
}

export function Step2ConfirmPreview({
  accounts,
  onBack,
  onSuccess,
}: Step2ConfirmPreviewProps) {
  const previewMutation = useStatsPreview();
  const connectMutation = useConnectLinkedAccounts();

  useEffect(() => {
    previewMutation.mutate({ accounts });
  }, []);

  const handleConfirm = async () => {
    try {
      const result = await connectMutation.mutateAsync({ accounts });
      if (result.success) {
        onSuccess();
      }
    } catch {
      // Error handled by mutation state
    }
  };

  const previewData = previewMutation.data;
  const isPending = previewMutation.isPending || connectMutation.isPending;
  const errorMessage =
    connectMutation.error instanceof Error
      ? connectMutation.error.message
      : previewMutation.error instanceof Error
      ? previewMutation.error.message
      : null;

  // Build a flat list of preview items from the keyed response shape
  const previewItems = previewData
    ? [
        previewData.chessCom
          ? {
              platform: "chess.com" as const,
              username: previewData.chessCom.username,
              avatar: previewData.chessCom.profile?.avatar,
              totalGames: previewData.chessCom.stats
                ? Object.values(previewData.chessCom.stats as Record<string, { last?: { rating?: number }; record?: { win?: number; loss?: number; draw?: number } }>)
                    .reduce((sum, tc) => {
                      const r = tc?.record;
                      return sum + (r ? (r.win ?? 0) + (r.loss ?? 0) + (r.draw ?? 0) : 0);
                    }, 0)
                : undefined,
              ratings: {
                rapid: (previewData.chessCom.stats as Record<string, { last?: { rating?: number } }> | undefined)?.chess_rapid?.last?.rating,
                blitz: (previewData.chessCom.stats as Record<string, { last?: { rating?: number } }> | undefined)?.chess_blitz?.last?.rating,
                bullet: (previewData.chessCom.stats as Record<string, { last?: { rating?: number } }> | undefined)?.chess_bullet?.last?.rating,
              },
            }
          : null,
        previewData.lichess
          ? {
              platform: "lichess" as const,
              username: previewData.lichess.username,
              avatar: undefined,
              totalGames: previewData.lichess.stats?.count?.all,
              ratings: {
                rapid: previewData.lichess.stats?.perfs?.rapid?.rating,
                blitz: previewData.lichess.stats?.perfs?.blitz?.rating,
                bullet: previewData.lichess.stats?.perfs?.bullet?.rating,
              },
            }
          : null,
      ].filter(Boolean)
    : [];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-medium text-vault-text-primary">
          Does everything look right?
        </h1>
        <p className="text-sm text-vault-text-secondary">
          We found your public chess profiles. Confirm these are your accounts.
        </p>
      </div>

      <div className="bg-vault-surface-layer-1 border border-vault-border-base rounded-md p-6 space-y-6">
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-vault-loss/10 border border-vault-loss/30 text-vault-loss text-xs rounded-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {previewMutation.isPending ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-vault-text-muted">
            <Spinner className="w-6 h-6 text-vault-bronze" />
            <span className="text-xs font-mono">Fetching profile statistics...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {previewItems.map((item, idx) => {
              if (!item) return null;
              const { platform, username, avatar, totalGames, ratings } = item;
              return (
                <div
                  key={idx}
                  className="bg-vault-surface-layer-2 border border-vault-border-interactive rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username}
                        className="w-11 h-11 rounded-full object-cover border border-vault-border-base"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-vault-surface-layer-1 border border-vault-border-base flex items-center justify-center text-xs font-mono font-bold text-vault-bronze uppercase">
                        {username.slice(0, 2)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-vault-text-primary text-sm">
                          {username}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-vault-surface-layer-1 border border-vault-border-base text-vault-text-muted">
                          {platform}
                        </span>
                      </div>
                      <p className="text-xs text-vault-text-secondary font-mono mt-0.5">
                        ~{totalGames != null ? totalGames.toLocaleString() : 0} games recorded
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-vault-border-base">
                    {ratings.rapid || ratings.blitz || ratings.bullet ? (
                      <div className="flex items-center gap-2 text-xs font-mono text-vault-text-muted">
                        {ratings.rapid && (
                          <span>R: <strong className="text-vault-text-primary">{ratings.rapid}</strong></span>
                        )}
                        {ratings.blitz && (
                          <span>B: <strong className="text-vault-text-primary">{ratings.blitz}</strong></span>
                        )}
                        {ratings.bullet && (
                          <span>U: <strong className="text-vault-text-primary">{ratings.bullet}</strong></span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-vault-text-muted font-mono">No rated stats</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 border-t border-vault-border-base flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-mono text-vault-text-secondary hover:text-vault-text-primary transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>No, edit</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || previewMutation.isError}
            className="flex items-center gap-2 bg-vault-bronze hover:bg-vault-bronze-hover text-white text-sm font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {connectMutation.isPending ? (
              <>
                <Spinner className="w-4 h-4 text-white" />
                <span>Linking accounts...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
