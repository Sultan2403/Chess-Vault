import { useState } from "react";
import { Platforms } from "@chess-vault/shared";
import { Filter, Plus, Search } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { GameCard } from "../components/library/GameCard";
import { useGames } from "../hooks/useGames";
import {
  useConnectLinkedAccounts,
  usePlatformUsernames,
  useVerifyLinkedAccount,
} from "../hooks/useAccount";
import { OnboardingModal } from "../components/onboarding/OnboardingModal";
import { Spinner } from "../components/ui/Spinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { EmptyState } from "../components/ui/EmptyState";

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Hook into TanStack Query (live-only)
  const { data: gamesData, isLoading, isError, error, refetch } = useGames({
    search: searchTerm || undefined,
  });

  const connectMutation = useConnectLinkedAccounts();
  const verificationMutation = useVerifyLinkedAccount();
  const platformUsernames = usePlatformUsernames();

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
            <Plus size={16} strokeWidth={2.2} /> Connect Accounts
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
              action={<Button onClick={() => setIsOnboardingOpen(true)}>Connect Accounts</Button>}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} platformUsernames={platformUsernames} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sync / Onboarding Modal (Screenshot 1) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onVerifyAccount={(account) => verificationMutation.mutateAsync(account)}
        onBeginSync={async (platforms) => {
          const accounts: Array<{
            platform: (typeof Platforms)[keyof typeof Platforms];
            username: string;
          }> = [];

          if (platforms.chessComUsername) {
            accounts.push({
              platform: Platforms.CHESS_COM,
              username: platforms.chessComUsername,
            });
          }
          if (platforms.lichessUsername) {
            accounts.push({
              platform: Platforms.LICHESS,
              username: platforms.lichessUsername,
            });
          }

          const result = await connectMutation.mutateAsync({ accounts });
          if (!result.success) {
            throw new Error(
              result.results
                .map((connection) => connection.message)
                .filter(Boolean)
                .join(" ") || result.message,
            );
          }

          setIsOnboardingOpen(false);
        }}
      />
    </AppShell>
  );
}


