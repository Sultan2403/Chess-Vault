import type { Game } from "@chess-vault/shared";
import { Link } from "react-router-dom";
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
    <Link to={`/game/${game.id}`}>
      <article className="group h-full rounded-vault border border-vault-outline-variant/60 bg-[#f7f3ea] p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:bg-white/90 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.16em]">
            <span className={`border px-2.5 py-1 rounded-vault ${
              perspective.result === "win"
                ? "border-vault-ochre/50 bg-[#eedaa2]/40 text-[#8c6b2d]"
                : "border-vault-outline-variant/60 bg-white/70 text-vault-text-secondary"
            }`}>
              {labels[perspective.result]}
            </span>
            <time className="text-vault-text-secondary">{getGameDate(game)}</time>
          </div>
          <h2 className="mt-5 font-display text-xl font-bold text-vault-primary group-hover:text-vault-ochre transition-colors leading-snug">
            {opening}
          </h2>
          <p className="mt-1 text-xs text-vault-text-secondary line-clamp-1">
            {variation ?? game.timeClass}
          </p>
        </div>

        <div>
          <div className="my-5 border-t border-vault-outline-variant/60" />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-vault-text-secondary">White</p>
              <p className="font-bold text-vault-primary truncate">{game.whitePlayer.username}</p>
              <p className="text-[11px] font-mono text-vault-text-secondary">({game.whitePlayer.rating})</p>
            </div>
            <strong className="font-display text-3xl font-bold text-vault-outline-variant/80 px-3">
              {game.result === "draw"
                ? "½-½"
                : game.result === "white"
                  ? "1-0"
                  : "0-1"}
            </strong>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-vault-text-secondary">Black</p>
              <p className="font-bold text-vault-primary truncate">{game.blackPlayer.username}</p>
              <p className="text-[11px] font-mono text-vault-text-secondary">({game.blackPlayer.rating})</p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

