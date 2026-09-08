import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "../ui/Button";
import {
  useAccountBootstrap,
  useSyncLinkedAccount,
} from "../../hooks/useAccount";
import { useGames } from "../../hooks/useGames";

export function ImportGamesPrompt() {
  const { data: accountData } = useAccountBootstrap();
  const { data: gamesData, isLoading: areGamesLoading } = useGames({ limit: 1 });
  const syncMutation = useSyncLinkedAccount();
  const [message, setMessage] = useState<string>();

  const linkedAccounts = accountData?.linkedAccounts ?? [];
  const hasGames = (gamesData?.pagination.total ?? 0) > 0;

  if (areGamesLoading || hasGames || linkedAccounts.length === 0) return null;

  const handleImport = async () => {
    setMessage(undefined);
    const results = [];

    for (const account of linkedAccounts) {
      results.push(await syncMutation.mutateAsync(account.id));
    }

    const failures = results.filter((result) => !result.success);
    setMessage(
      failures.length
        ? "Some accounts could not be imported. You can try again shortly."
        : "Your games have been imported into the vault.",
    );
  };

  return (
    <section className="mt-10 rounded-vault border border-vault-outline-variant/60 bg-[#f7f3ea] p-7 shadow-xs">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-vault-ochre">
        Your vault is ready
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-vault-primary">
        Bring in your chess history.
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-vault-text-secondary">
        Your connected accounts are ready. Import their games whenever you are ready to begin building your archive.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button onClick={handleImport} disabled={syncMutation.isPending}>
          <Download size={16} />
          {syncMutation.isPending ? "Importing games..." : "Import games"}
        </Button>
        {message && <p className="text-xs text-vault-text-secondary">{message}</p>}
      </div>
    </section>
  );
}
