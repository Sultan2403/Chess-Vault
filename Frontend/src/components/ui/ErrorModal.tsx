import { AlertTriangle, RefreshCw } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { getApiErrorMessage } from "../../utils/apiError";

type ErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  closeLabel?: string;
};

export function ErrorModal({
  isOpen,
  onClose,
  title = "Something went wrong",
  description,
  message,
  error,
  onRetry,
  isRetrying = false,
  retryLabel = "Try again",
  closeLabel = "Close",
}: ErrorModalProps) {
  const displayMessage = error
    ? getApiErrorMessage(error)
    : (message ?? "An unexpected error occurred. Please try again.");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      showCloseButton={true}
      title={
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-vault-error-container">
            <AlertTriangle size={16} className="text-vault-error" />
          </div>
          <span>{title}</span>
        </div>
      }
      description={description}
    >
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-vault-text-secondary break-words">
          {displayMessage}
        </p>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {closeLabel}
          </Button>
          {onRetry && (
            <Button
              type="button"
              variant="destructive"
              onClick={onRetry}
              disabled={isRetrying}
            >
              <RefreshCw
                size={13}
                className={isRetrying ? "animate-spin" : ""}
              />
              <span>{isRetrying ? "Retrying…" : retryLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
