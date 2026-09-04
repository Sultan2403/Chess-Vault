import type { ArchiveGame } from "../../types/archive";
const labels = { win: "Won", loss: "Lost", draw: "Draw" };
export function GameCard({ game }: { game: ArchiveGame }) {
  return (
    <article className="rounded-vault border border-vault-outline-variant bg-vault-surface-soft p-7 transition-colors duration-300 hover:bg-vault-surface-container">
      <div className="flex justify-between text-xs font-bold uppercase tracking-[.13em]">
        <span className="border border-vault-outline-variant bg-vault-surface-container-lowest px-3 py-2 normal-case tracking-normal">
          {labels[game.result]}
        </span>
        <time>{game.createdAt as string}</time>
      </div>
      <h2 className="mt-8 text-2xl font-bold">{game.opening}</h2>
      <p className="mt-2 text-lg text-vault-text-secondary">{game.variation}</p>
      <div className="my-6 border-t border-vault-outline-variant" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em]">White</p>
          <b>User</b>
          <p>({game.playerRating})</p>
        </div>
        <strong className="font-display text-5xl text-vault-outline-variant">
          {game.result === "draw"
            ? "½-½"
            : game.result === "win"
              ? "1-0"
              : "0-1"}
        </strong>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-[.14em]">Black</p>
          <b>{game.opponent}</b>
          <p>({game.opponentRating})</p>
        </div>
      </div>
    </article>
  );
}
