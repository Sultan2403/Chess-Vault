import { AlertTriangle } from "lucide-react";

export function ErrorBanner({
  message = "An error occurred",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-vault border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-600" />
          <div>{message}</div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-vault bg-red-600 px-3 py-1 text-xs font-bold text-white"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
