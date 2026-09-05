import type { Game } from "@chess-vault/shared";
import { getGameDate, getPlayerPerspective } from "../../utils/game";

const labels = { win: "Won", loss: "Lost", draw: "Draw" };

type GameCardProps = {
  game: Game;
  platformUsernames: Partial<Record<Game["platform"], string>>;
};

export function GameCard({ game, platformUsernames }: GameCardProps) {
  const perspective = getPlayerPerspective(game, platformUsernames);
  const [opening, variation] = (game.title ?? "Untitled game").split(": ");

  return (
    <article className="rounded-vault border border-vault-outline-variant bg-vault-surface-soft p-7 transition-colors duration-300 hover:bg-vault-surface-container">
      <div className="flex justify-between text-xs font-bold uppercase tracking-[.13em]">
        <span className="border border-vault-outline-variant bg-vault-surface-container-lowest px-3 py-2 normal-case tracking-normal">
          {labels[perspective.result]}
        </span>
        <time>{getGameDate(game)}</time>
      </div>
      <h2 className="mt-8 text-2xl font-bold">{opening}</h2>
      <p className="mt-2 text-lg text-vault-text-secondary">
        {variation ?? game.timeClass}
      </p>
      <div className="my-6 border-t border-vault-outline-variant" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em]">White</p>
          <b>{game.whitePlayer.username}</b>
          <p>({game.whitePlayer.rating})</p>
        </div>
        <strong className="font-display text-5xl text-vault-outline-variant">
          {game.result === "draw"
            ? "½-½"
            : game.result === "white"
              ? "1-0"
              : "0-1"}
        </strong>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[.14em]">Black</p>
          <b>{game.blackPlayer.username}</b>
          <p>({game.blackPlayer.rating})</p>
        </div>
      </div>
    </article>
  );
}
