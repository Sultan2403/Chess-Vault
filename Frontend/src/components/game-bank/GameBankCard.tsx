import { memo } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { Check, CheckSquare, Copy, ExternalLink, Square } from "lucide-react";
import type { Game } from "@chess-vault/shared";
import { MiniChessboard } from "../ui/MiniChessboard";
import { getGameDate, getMoveCount, parseOpeningDetails } from "../../utils/game";

type GameBankCardProps = {
  game: Game;
  isSelected: boolean;
  isCopied: boolean;
  onToggle: (id: string) => void;
  onCopyPgn: (id: string, pgn: string) => void;
};

export const GameBankCard = memo(function GameBankCard({
  game,
  isSelected,
  isCopied,
  onToggle,
  onCopyPgn,
}: GameBankCardProps) {
  const { opening, variation, eco } = parseOpeningDetails(game);
  const displayTitle = opening || game.title || "Archived Encounter";
  const displayEco = eco ? `ECO ${eco}` : "ECO ---";
  const displayCadence = `${game.time.timeClass}`;
  const displayPlatform = game.platform.toUpperCase();
  const displayResult =
    game.userResult === "win"
      ? "Win"
      : game.userResult === "loss"
        ? "Loss"
        : "Draw";
  const displayQuote =
    game.notes || "Match sequence verified in permanent registry.";
  const displayDate = getGameDate(game, "MMM dd, yyyy");
  const displayMoves = getMoveCount(game);

  const resultColorClass =
    game.userResult === "win"
      ? "bg-vault-win/15 text-vault-win border-vault-win/30"
      : game.userResult === "loss"
        ? "bg-vault-loss/15 text-vault-loss border-vault-loss/30"
        : "bg-vault-draw/15 text-vault-draw border-vault-draw/30";

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
      }}
      className={`rounded-vault border bg-vault-surface-layer-1 p-5 flex flex-col justify-between transition-all font-mono text-xs ${
        isSelected
          ? "border-vault-bronze bg-vault-surface-layer-2 shadow-md"
          : "border-vault-border-base hover:border-vault-border-interactive"
      }`}
    >
      <div>
        {/* Top Bar: Checkbox, ECO, Cadence, Platform, Result */}
        <div className="flex items-center justify-between gap-2 border-b border-vault-border-base pb-3 text-[10px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggle(game.id)}
              className="text-vault-text-muted hover:text-vault-text-primary cursor-pointer"
            >
              {isSelected ? (
                <CheckSquare size={13} className="text-vault-bronze" />
              ) : (
                <Square size={13} />
              )}
            </button>
            <span className="font-semibold text-vault-text-primary">
              {displayEco}
            </span>
            <span className="text-vault-text-muted capitalize">
              • {displayCadence}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-xs border border-vault-border-base bg-vault-surface-layer-2 px-1.5 py-0.5 text-[9px] text-vault-text-muted uppercase">
              {displayPlatform}
            </span>
            <span
              className={`rounded-xs border px-1.5 py-0.5 text-[9px] font-bold ${resultColorClass}`}
            >
              {displayResult}
            </span>
          </div>
        </div>

        {/* Mini Board Diagram */}
        <div className="my-4">
          <MiniChessboard
            fen={game.finalFen}
            orientation={game.userPlayedAs}
            badgeLabel={displayResult}
          />
        </div>

        {/* Players */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-vault-text-primary text-[11px]">
                w
              </span>
              <span className="font-semibold text-vault-text-primary truncate max-w-[140px]">
                {game.whitePlayer.username}
              </span>
            </div>
            <span className="text-vault-text-muted text-[11px] ml-2">
              {game.whitePlayer.rating}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-vault-text-muted text-[11px]">
                b
              </span>
              <span className="font-semibold text-vault-text-primary truncate max-w-[140px]">
                {game.blackPlayer.username}
              </span>
            </div>
            <span className="text-vault-text-muted text-[11px] ml-2">
              {game.blackPlayer.rating}
            </span>
          </div>
        </div>

        {/* Opening Title & Subline */}
        <div className="mt-4">
          <h3 className="font-display text-sm font-bold text-vault-text-primary truncate">
            {displayTitle}
          </h3>
          {variation && (
            <p className="text-[11px] text-vault-text-muted truncate mt-0.5">
              {variation}
            </p>
          )}
        </div>

        {/* Quote / Annotation Note */}
        <blockquote className="mt-3 rounded-xs border-l border-vault-border-interactive bg-vault-surface-layer-2/70 px-2.5 py-1 font-sans text-[11px] italic text-vault-text-secondary leading-snug line-clamp-2">
          &ldquo;{displayQuote}&rdquo;
        </blockquote>
      </div>

      {/* Footer: Date, Moves, Copy, Inspect */}
      <div className="mt-5 border-t border-vault-border-base pt-3 flex items-center justify-between text-[10px] text-vault-text-muted">
        <span>
          {displayDate} • {displayMoves} moves
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopyPgn(game.id, game.pgn)}
            className="hover:text-vault-text-primary cursor-pointer"
            title={isCopied ? "Copied" : "Copy PGN"}
          >
            {isCopied ? (
              <Check size={12} className="text-vault-win" />
            ) : (
              <Copy size={12} />
            )}
          </button>
          <NavLink
            to={`/game/${game.id}`}
            className="flex items-center gap-0.5 text-vault-bronze hover:text-vault-bronze-hover font-semibold uppercase tracking-wider ml-1"
          >
            <span>INSPECT</span>
            <ExternalLink size={10} />
          </NavLink>
        </div>
      </div>
    </motion.article>
  );
});
