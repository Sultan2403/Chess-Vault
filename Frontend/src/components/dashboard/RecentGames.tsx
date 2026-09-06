import { ArrowRight, History } from "lucide-react";
import type { Game } from "@chess-vault/shared";
import { Link } from "react-router-dom";
import { useGames } from "../../hooks/useGames";
import { getGameDate, getMoveCount, getPlayerPerspective } from "../../utils/game";

const resultLabel = { win: "W", loss: "L", draw: "D" };
const scoreLabel = { win: "1-0", loss: "0-1", draw: "½-½" };

function RecentGameRow({ game }: { game: Game }) {
  // No platform username context available yet; pass empty map.
  const perspective = getPlayerPerspective(game, {});

  // Derive contextual tag if any
  const tag =
    game.id === "game-1"
      ? "Analysis Saved"
      : game.id === "game-3"
      ? "Blunder Noted"
      : null;

  return (
    <Link to={`/game/${game.id}`}>
      <article className="group flex items-center gap-5 border-b border-vault-outline-variant/60 py-4 transition-colors hover:bg-[#f7f3ea]/80 px-2 rounded-vault">
        {/* Outcome Box */}
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-vault border border-vault-outline-variant/80 bg-white/90 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="text-xs font-bold text-vault-primary">
              {resultLabel[perspective.result]}
            </span>
            <span className="text-[10px] font-mono text-vault-text-secondary mt-0.5">
              {scoreLabel[perspective.result]}
            </span>
          </div>
        </div>

        {/* Game Title & Details */}
        <div>
          <h3 className="font-display text-base font-bold text-vault-primary group-hover:text-vault-ochre transition-colors">
            {game.title ?? "Untitled Game"}
          </h3>
          <p className="mt-0.5 text-xs text-vault-text-secondary">
            vs. {perspective.opponent.username} • {getMoveCount(game)} moves •{" "}
            <span className="capitalize">{game.timeClass}</span>
          </p>
        </div>

        {/* Date and Optional Pill Tag */}
        <div className="ml-auto flex flex-col items-end gap-1.5 text-right">
          <time className="text-[10px] font-bold uppercase tracking-[0.16em] text-vault-primary">
            {getGameDate(game, "MMM dd, yyyy")}
          </time>
          {tag && (
            <span className="rounded-vault border border-vault-outline-variant/60 bg-[#eae4d5]/80 px-2 py-0.5 text-[9px] font-medium text-vault-primary">
              {tag}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}

export function RecentGames() {
  const { data, isLoading } = useGames({ limit: 6 });
  const games = data?.games ?? [];

  return (
    <section className="mt-14">
      <div className="flex items-center justify-between border-b border-vault-outline-variant/60 pb-3 mb-2">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-vault-primary">
          <History className="text-vault-ochre" size={18} strokeWidth={2} /> Recent Games
        </h2>
        <Link
          to="/library"
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-vault-ochre hover:text-vault-ochre-hover transition-colors"
        >
          VIEW ALL <ArrowRight size={13} strokeWidth={2.2} />
        </Link>
      </div>
      <div className="divide-y divide-vault-outline-variant/40">
        {isLoading ? (
          <div className="py-4">Loading…</div>
        ) : (
          games.map((game) => <RecentGameRow game={game} key={game.id} />)
        )}
      </div>
    </section>
  );
}

