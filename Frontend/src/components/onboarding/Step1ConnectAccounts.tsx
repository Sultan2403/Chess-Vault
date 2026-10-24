import { useState } from "react";
import { Plus, Trash2, ArrowRight } from "lucide-react";
import type { PlatformType } from "@chess-vault/shared";
import { Platforms } from "@chess-vault/shared";
import { useVerifyLinkedAccount } from "../../hooks/useAccount";
import { Spinner } from "../ui/Spinner";

export interface AccountDraft {
  platform: PlatformType;
  username: string;
}

interface Step1ConnectAccountsProps {
  initialAccounts?: AccountDraft[];
  maxAccounts?: number;
  onContinue: (accounts: AccountDraft[]) => void;
}

export function Step1ConnectAccounts({
  initialAccounts = [{ platform: Platforms.CHESS_COM, username: "" }],
  maxAccounts = 2,
  onContinue,
}: Step1ConnectAccountsProps) {
  const [rows, setRows] = useState<AccountDraft[]>(
    initialAccounts.length > 0
      ? initialAccounts
      : [{ platform: Platforms.CHESS_COM, username: "" }]
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const verifyMutation = useVerifyLinkedAccount();

  const handleAddRow = () => {
    if (rows.length >= maxAccounts) return;
    setRows((prev) => [...prev, { platform: Platforms.LICHESS, username: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleChange = (index: number, field: keyof AccountDraft, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    // Clear error on edit
    if (errors[index]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const validateAndProceed = async () => {
    setGeneralError(null);
    const newErrors: Record<number, string> = {};

    // 1. Basic empty check
    rows.forEach((row, idx) => {
      if (!row.username.trim()) {
        newErrors[idx] = "Username is required";
      }
    });

    // 2. Duplicate check (same platform + same username case-insensitive)
    const seen = new Set<string>();
    rows.forEach((row, idx) => {
      const key = `${row.platform}:${row.username.trim().toLowerCase()}`;
      if (row.username.trim()) {
        if (seen.has(key)) {
          newErrors[idx] = "Duplicate account on same platform";
        }
        seen.add(key);
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 3. Verify accounts against platform APIs
    try {
      const verificationResults = await Promise.all(
        rows.map((row) =>
          verifyMutation.mutateAsync({
            platform: row.platform,
            username: row.username.trim(),
          })
        )
      );

      let hasVerificationFailure = false;
      verificationResults.forEach((res, idx) => {
        if (!res.success) {
          newErrors[idx] = res.message || "Player not found on platform";
          hasVerificationFailure = true;
        }
      });

      if (hasVerificationFailure) {
        setErrors(newErrors);
        return;
      }

      onContinue(
        rows.map((r, i) => ({
          platform: r.platform,
          username: verificationResults[i].username || r.username.trim(),
        }))
      );
    } catch (err: unknown) {
      setGeneralError(
        err instanceof Error ? err.message : "Unable to verify accounts right now. Please try again."
      );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-display font-medium text-vault-text-primary">
          Connect your accounts
        </h1>
        <p className="text-sm text-vault-text-secondary">
          Enter your Chess.com or Lichess usernames to bring your games together.
        </p>
      </div>

      <div className="bg-vault-surface-layer-1 border border-vault-border-base rounded-md p-6 space-y-4">
        {generalError && (
          <div className="p-3 bg-vault-loss/10 border border-vault-loss/30 text-vault-loss text-xs rounded-md">
            {generalError}
          </div>
        )}

        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <select
                  value={row.platform}
                  onChange={(e) =>
                    handleChange(idx, "platform", e.target.value as PlatformType)
                  }
                  className="bg-vault-surface-layer-2 border border-vault-border-interactive rounded-md px-3 py-2 text-sm text-vault-text-primary focus:outline-none focus:ring-1 focus:ring-vault-bronze"
                >
                  <option value={Platforms.CHESS_COM}>Chess.com</option>
                  <option value={Platforms.LICHESS}>Lichess</option>
                </select>

                <input
                  type="text"
                  placeholder="Username"
                  value={row.username}
                  onChange={(e) => handleChange(idx, "username", e.target.value)}
                  className="flex-1 bg-vault-surface-layer-2 border border-vault-border-interactive rounded-md px-3 py-2 text-sm text-vault-text-primary placeholder:text-vault-text-muted focus:outline-none focus:ring-1 focus:ring-vault-bronze"
                />

                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="p-2 text-vault-text-muted hover:text-vault-loss transition-colors"
                    aria-label="Remove account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {errors[idx] && (
                <p className="text-xs text-vault-loss font-mono pl-1">
                  {errors[idx]}
                </p>
              )}
            </div>
          ))}
        </div>

        {rows.length < maxAccounts && (
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 text-xs font-mono text-vault-bronze hover:text-vault-bronze-hover transition-colors pt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add another account ({rows.length}/{maxAccounts})</span>
          </button>
        )}

        <div className="pt-4 border-t border-vault-border-base flex justify-end">
          <button
            type="button"
            onClick={validateAndProceed}
            disabled={verifyMutation.isPending}
            className="flex items-center gap-2 bg-vault-bronze hover:bg-vault-bronze-hover text-white text-sm font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {verifyMutation.isPending ? (
              <>
                <Spinner className="w-4 h-4 text-white" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
