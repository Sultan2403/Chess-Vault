import { useImportNotifications } from "../../hooks/useImportNotifications";
import { Spinner } from "./Spinner";

export function ImportNotificationToast() {
  const { activeNotification, importProgress, dismiss } = useImportNotifications();

  if (!activeNotification && !importProgress) return null;

  if (activeNotification) {
    const isSuccess = activeNotification.type === "success";
    const isWarning = activeNotification.type === "warning";

    return (
      <>
        {/* Mobile Slim Top Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 text-xs font-medium shadow-md md:hidden transition-all duration-300 ease-out bg-vault-surface-container-high border-b border-vault-border-base text-vault-text-primary">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                isSuccess
                  ? "bg-emerald-500"
                  : isWarning
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
            />
            <span className="truncate">{activeNotification.message}</span>
          </div>
          <button
            onClick={dismiss}
            className="ml-3 text-vault-text-muted hover:text-vault-text-primary text-sm p-1"
          >
            ✕
          </button>
        </div>

        {/* Desktop / Tablet Bottom-Right Toast */}
        <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-3.5 rounded-xl border border-vault-border-interactive bg-vault-surface-container-highest/95 backdrop-blur-md px-4 py-3 shadow-xl max-w-sm text-sm text-vault-text-primary animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div
            className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${
              isSuccess
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                : isWarning
                  ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                  : "bg-rose-500/15 text-rose-500 border border-rose-500/30"
            }`}
          >
            {isSuccess ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : isWarning ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <p className="text-xs leading-snug font-medium flex-1 text-vault-text-primary">
            {activeNotification.message}
          </p>

          <button
            onClick={dismiss}
            className="text-vault-text-muted hover:text-vault-text-primary transition-colors text-xs font-semibold p-1"
          >
            ✕
          </button>
        </div>
      </>
    );
  }

  // Live in-progress toast
  if (!importProgress) return null;

  const platformLabel = importProgress.platform === "chess.com" ? "Chess.com" : "Lichess";
  const progressMessage = `${platformLabel} importing: ${importProgress.counters.inserted.toLocaleString()} games added...`;

  return (
    <>
      {/* Mobile Slim Top Banner (In-Progress) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 text-xs font-medium shadow-md md:hidden bg-vault-surface-container-high border-b border-vault-border-base text-vault-text-primary">
        <div className="flex items-center gap-2 truncate">
          <span className="h-2 w-2 rounded-full flex-shrink-0 bg-vault-bronze animate-pulse" />
          <span className="truncate">{progressMessage}</span>
        </div>
      </div>

      {/* Desktop / Tablet Bottom-Right Toast (In-Progress) */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-3.5 rounded-xl border border-vault-border-interactive bg-vault-surface-container-highest/95 backdrop-blur-md px-4 py-3 shadow-xl max-w-sm text-sm text-vault-text-primary animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-vault-bronze/15 text-vault-bronze border border-vault-bronze/30">
          <Spinner className="h-4 w-4 text-vault-bronze" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs leading-snug font-medium text-vault-text-primary truncate">
            {progressMessage}
          </p>
          {importProgress.vaultUsage && (
            <p className="text-[10px] font-mono text-vault-text-muted mt-0.5">
              Vault: {importProgress.vaultUsage.current.toLocaleString()} / {importProgress.vaultUsage.limit.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </>
  );
}