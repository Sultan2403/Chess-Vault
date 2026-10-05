import type { Game } from "@chess-vault/shared";
import { formatClockMs } from "../../utils/game";

type PlayerBarProps = {
  player: Game["whitePlayer"] | Game["blackPlayer"];
  color: "white" | "black";
  gameResult: Game["result"];
  /** Remaining clock ms at the current ply. Undefined if clocks not available. */
  clockMs: number | undefined;
  /** Initial clock ms shown at the start position (game.time.initial). */
  initialClockMs: number | undefined;
  /** Whether we are at the start position (move index 0). */
  isAtStart: boolean;
};

export function PlayerBar({
  player,
  color,
  gameResult,
  clockMs,
  initialClockMs,
  isAtStart,
}: PlayerBarProps) {
  const isWinner = gameResult === color;
  const isLoser = gameResult !== "draw" && gameResult !== color;

  const displayClock = isAtStart
    ? formatClockMs(initialClockMs)
    : formatClockMs(clockMs);

  return (
    <div className="flex items-center justify-between rounded-vault border border-vault-border-base bg-vault-surface-layer-1 px-4 py-3 font-mono text-xs">
      <div className="flex items-center gap-3">
        <div
          className={`grid h-8 w-8 place-items-center rounded-xs border font-bold ${
            color === "white"
              ? "border-vault-border-interactive bg-vault-surface-layer-2 text-vault-bronze"
              : "border-vault-border-interactive bg-vault-surface-layer-2 text-vault-text-secondary"
          }`}
        >
          {color === "white" ? "♔" : "♞"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-vault-text-primary text-sm">
              {player.username}
            </span>
            <span className="text-vault-text-muted">{player.rating}</span>
            {isWinner && (
              <span className="rounded-xs bg-vault-win/15 px-1.5 py-0.5 text-[10px] text-vault-win font-semibold">
                WINNER
              </span>
            )}
            {isLoser && (
              <span className="rounded-xs bg-vault-loss/15 px-1.5 py-0.5 text-[10px] text-vault-loss font-semibold">
                LOST
              </span>
            )}
            {gameResult === "draw" && (
              <span className="rounded-xs bg-vault-text-muted/15 px-1.5 py-0.5 text-[10px] text-vault-text-muted font-semibold">
                DRAW
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className="font-mono text-xs text-vault-text-secondary">Clock</span>
        <p className="font-mono text-sm font-bold text-vault-text-primary">{displayClock}</p>
      </div>
    </div>
  );
}
