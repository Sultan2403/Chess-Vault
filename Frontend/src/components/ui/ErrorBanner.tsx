import { AlertTriangle, RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "../../utils/apiError";

type ErrorBannerProps = {
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
};

export function ErrorBanner({
  message,
  error,
  onRetry,
  className = "",
}: ErrorBannerProps) {
  const displayMessage = error
    ? getApiErrorMessage(error)
    : message ?? "An unexpected error occurred.";

  return (
    <div
      role="alert"
      className={`rounded-vault border border-vault-loss/40 bg-vault-loss/10 p-4 font-mono text-xs text-vault-loss ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle size={16} className="text-vault-loss shrink-0" />
          <span className="leading-relaxed">{displayMessage}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-xs border border-vault-loss/50 bg-vault-loss/20 px-3 py-1 text-[11px] font-bold text-vault-loss hover:bg-vault-loss/30 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw size={11} />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
}
