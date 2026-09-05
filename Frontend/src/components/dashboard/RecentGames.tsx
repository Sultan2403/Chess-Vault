import { ArrowRight, History } from "lucide-react";
import type { Game } from "@chess-vault/shared";
import { currentPlatformUsernames, mockGames } from "../../data/mock-games";
import {
  getGameDate,
  getMoveCount,
  getPlayerPerspective,
} from "../../utils/game";

const resultLabel = { win: "W", loss: "L", draw: "D" };
const scoreLabel = { win: "1-0", loss: "0-1", draw: "½-½" };

function RecentGameRow({ game }: { game: Game }) {
  const perspective = getPlayerPerspective(game, currentPlatformUsernames);
  return (
    <article className="group flex items-center gap-5 border-b border-vault-outline-variant px-0 py-6 transition-colors hover:bg-vault-surface-soft sm:px-4">
      <div
        className={`grid h-13 w-13 shrink-0 place-items-center border text-center text-xs ${perspective.result === "win" ? "border-vault-secondary text-vault-secondary" : "border-vault-outline-variant"}`}
      >
        <span>
          {resultLabel[perspective.result]}
          <br />
          <small>{scoreLabel[perspective.result]}</small>
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold">{game.title ?? "Untitled game"}</h3>
        <p className="mt-1 text-sm text-vault-text-secondary">
          vs. {perspective.opponent.username} · {getMoveCount(game)} moves ·{" "}
          {game.timeClass}
        </p>
      </div>
      <time className="ml-auto text-right text-xs font-bold uppercase tracking-[.14em]">
        {getGameDate(game, "MMM dd, yyyy")}
      </time>
    </article>
  );
}

export function RecentGames() {
  return (
    <section className="mt-16">
      <div className="flex items-center justify-between border-b border-vault-outline-variant pb-5">
        <h2 className="flex items-center gap-3 text-xl font-bold">
          <History className="text-vault-secondary" size={22} /> Recent Games
        </h2>
        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-vault-secondary">
          View all <ArrowRight size={15} />
        </button>
      </div>
      <div>
        {mockGames.map((game) => (
          <RecentGameRow game={game} key={game.id} />
        ))}
      </div>
    </section>
  );
}
