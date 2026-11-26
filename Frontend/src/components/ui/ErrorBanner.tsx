import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { motion } from "motion/react";
import { getApiErrorMessage } from "../../utils/apiError";
import { cn } from "../../utils/cn";

type ErrorBannerProps = {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  onDismiss?: () => void;
  compact?: boolean;
  className?: string;
};

export function ErrorBanner({
  title,
  message,
  error,
  onRetry,
  isRetrying = false,
  onDismiss,
  compact = false,
  className = "",
}: ErrorBannerProps) {
  const displayMessage = error
    ? getApiErrorMessage(error)
    : (message ?? "An unexpected error occurred.");

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "rounded-vault border border-vault-border-base border-l-2 border-l-vault-loss bg-vault-surface-layer-1/90 shadow-xs",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <div
        className={cn(
          "flex justify-between gap-3",
          title ? "items-start" : "items-center",
        )}
      >
        <div
          className={cn(
            "flex gap-3 min-w-0",
            title ? "items-start" : "items-center",
          )}
        >
          <div
            className={cn(
              "grid shrink-0 place-items-center rounded-md bg-vault-error-container",
              compact ? "h-7 w-7" : "h-8 w-8",
              title && !compact && "mt-0.5",
            )}
          >
            <AlertTriangle
              size={compact ? 14 : 16}
              className="text-vault-error"
            />
          </div>
          <div className="min-w-0 space-y-0.5">
            {title && (
              <p className="text-sm font-semibold text-vault-text-primary leading-snug">
                {title}
              </p>
            )}
            <p
              className={cn(
                "text-vault-text-secondary leading-relaxed break-words",
                compact ? "text-xs" : "text-xs sm:text-sm",
              )}
            >
              {displayMessage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1.5 rounded-vault border border-vault-loss/40 bg-vault-loss/10 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-vault-loss transition-colors hover:bg-vault-loss/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw
                size={12}
                className={isRetrying ? "animate-spin" : ""}
              />
              <span>{isRetrying ? "Retrying…" : "Retry"}</span>
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss error"
              className="rounded-vault p-1 text-vault-text-muted transition-colors hover:bg-vault-surface-layer-2 hover:text-vault-text-primary cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
