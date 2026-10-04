import { format } from "date-fns";
import type { Game } from "@chess-vault/shared";

export type PlayerPerspective = {
  player: Game["whitePlayer"];
  opponent: Game["blackPlayer"];
  playerColor: "white" | "black";
  result: "win" | "loss" | "draw";
};

/**
 * Gets the player's perspective in the game.
 * Uses the persisted `userPlayedAs` property on the game record,
 * 
 * @param game - The game played 
 */
export function getPlayerPerspective(
  game: Game
): PlayerPerspective {
  const playerColor = game.userPlayedAs;

  const player = playerColor === "white" ? game.whitePlayer : game.blackPlayer;
  const opponent = playerColor === "white" ? game.blackPlayer : game.whitePlayer;

  const result =
    game.result === "draw"
      ? "draw"
      : game.result === playerColor
        ? "win"
        : "loss";

  return { player, opponent, playerColor, result };
}

export function getGameDate(game: Game, pattern = "MMM dd, yyyy") {
  if (!game.playedAt) return "Unknown date";
  const dateObj =
    typeof game.playedAt === "string" ? new Date(game.playedAt) : game.playedAt;
  if (isNaN(dateObj.getTime())) return "Unknown date";
  return format(dateObj, pattern);
}

export { getMoveCount, getPgnMoveCount } from "@chess-vault/shared";


/**
 * Returns the opening details stored on the game record.
 * eco, opening name, and variation are parsed at import time
 * from platform data and stored as first-class fields on Game.
 */
export function parseOpeningDetails(game: Game): {
  eco?: string;
  opening?: string;
  variation?: string;
} {
  return {
    eco:       game.opening?.eco,
    opening:   game.opening?.name,
    variation: game.opening?.variation,
  };
}
