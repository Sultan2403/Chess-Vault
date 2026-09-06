import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { GameCard } from "../components/library/GameCard";
import { useGames, useImportGames } from "../hooks/useGames";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { BuildingVaultModal } from "../components/onboarding/BuildingVaultModal";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { EmptyState } from "../components/ui/EmptyState";

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isBuildingOpen, setIsBuildingOpen] = useState(false);

  // Hook into TanStack Query (live-only)
  const { data: gamesData, isLoading, isError, error, refetch } = useGames({
    search: searchTerm || undefined,
  });

  const importMutation = useImportGames();

  const gamesList = gamesData?.games ?? [];

  const filteredGames = gamesList.filter((game) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      game.title?.toLowerCase().includes(term) ||
      game.whitePlayer.username.toLowerCase().includes(term) ||
      game.blackPlayer.username.toLowerCase().includes(term)
    );
  });

  return (
    <AppShell>
      <div className="mx-auto min-h-[calc(100vh-18rem)] max-w-content px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-vault-outline-variant/60 pb-8">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-vault-primary sm:text-5xl">
              Game Bank
            </h1>
            <p className="mt-2 text-sm text-vault-text-secondary">
              A curated collection of your entire stored chess history.
            </p>
          </div>
          <Button onClick={() => setIsOnboardingOpen(true)}>
            <Plus size={16} strokeWidth={2.2} /> Sync Accounts
          </Button>
        </div>

        {/* Ledger-styled Search & Filter Bar */}
        <section className="mt-10 grid gap-5 border-b border-vault-outline-variant/60 pb-8 md:grid-cols-[2fr_repeat(3,1fr)_auto] items-end">
          <label className="border-b border-vault-outline bg-white/70 px-3 py-2.5 rounded-t-vault flex items-center gap-3">
            <span className="sr-only">Search archive</span>
            <Search className="text-vault-text-secondary shrink-0" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-vault-primary outline-none placeholder:text-vault-text-secondary/60"
              placeholder="Player, Opening, or Event..."
            />
          </label>

          {["All Sources", "Any Result", "All Speeds"].map((label) => (
            <button
              key={label}
              className="border-b border-vault-outline-variant py-2.5 px-1 text-left text-xs font-bold uppercase tracking-[0.14em] text-vault-text-secondary hover:text-vault-primary hover:border-vault-primary transition-colors"
            >
              {label}
            </button>
          ))}

          <button className="flex items-center justify-center gap-2 border border-vault-outline-variant/80 bg-[#f7f3ea] py-2 px-3 rounded-vault text-xs font-bold uppercase tracking-[0.14em] text-vault-primary hover:bg-[#eae4d5] transition-colors">
            <Filter size={15} /> Filters
          </button>
        </section>

        {/* Games Grid */}
        <div className="mt-10">
          {isLoading ? (
            <div className="py-20">
              <Spinner />
            </div>
          ) : isError ? (
            <ErrorBanner message={(error as any)?.message ?? "Unable to load games."} onRetry={() => refetch()} />
          ) : gamesList.length === 0 ? (
            <EmptyState
              title="No games yet"
              description="You don't have any games stored. Connect your accounts to import games."
              action={<Button onClick={() => setIsOnboardingOpen(true)}>Sync Accounts</Button>}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} platformUsernames={{}} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sync / Onboarding Modal (Screenshot 1) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onBeginSync={async (platforms) => {
          // Start import flow and show building modal while it's running.
          // Call the backend import endpoint once per platform username provided.
          setIsOnboardingOpen(false);
          setIsBuildingOpen(true);
          try {
            if (platforms.chessComUsername) {
              await importMutation.mutateAsync({ platform: "chess.com", username: platforms.chessComUsername });
            }
            if (platforms.lichessUsername) {
              await importMutation.mutateAsync({ platform: "lichess", username: platforms.lichessUsername });
            }
          } catch (err) {
            // swallow; user will see error via BuildingVaultModal or global error handling
          } finally {
            setIsBuildingOpen(false);
          }
        }}
      />

      {/* Vault Building Progress Modal (Screenshot 5) */}
      <BuildingVaultModal
        isOpen={isBuildingOpen}
        onCancel={() => setIsBuildingOpen(false)}
        onComplete={() => setIsBuildingOpen(false)}
      />
    </AppShell>
  );
}


