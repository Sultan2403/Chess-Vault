import { Filter, Plus, Search } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { GameCard } from "../components/library/GameCard";
import { currentPlatformUsernames, mockGames } from "../data/mock-games";
export default function LibraryPage() {
  return (
    <AppShell>
      <div className="mx-auto min-h-[calc(100vh-18rem)] max-w-[1120px] px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-5xl font-bold">The Library</h1>
            <p className="mt-3 text-lg text-vault-text-secondary">
              A curated collection of your stored games.
            </p>
          </div>
          <Button>
            <Plus size={18} /> Import game
          </Button>
        </div>
        <section className="mt-16 grid gap-5 border-b border-vault-line pb-10 md:grid-cols-[2fr_repeat(3,1fr)_auto]">
          <label className="border-b border-vault-primary bg-vault-surface-container-lowest px-3 py-3">
            <span className="sr-only">Search archive</span>
            <span className="flex gap-3">
              <Search className="text-vault-text-secondary" />
              <input
                className="w-full bg-transparent text-lg outline-none placeholder:text-vault-outline"
                placeholder="Player, Opening, or Event..."
              />
            </span>
          </label>
          {["All Sources", "Any Result", "All Speeds"].map((label) => (
            <button
              key={label}
              className="border-b border-vault-ink py-3 text-left"
            >
              {label}
            </button>
          ))}
          <button className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.15em]">
            <Filter size={20} /> More filters
          </button>
        </section>
        <div className="mt-15 grid gap-6 md:grid-cols-3">
          {mockGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              platformUsernames={currentPlatformUsernames}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
