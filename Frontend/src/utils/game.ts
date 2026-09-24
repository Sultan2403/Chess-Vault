import { format } from "date-fns";
import type { Game } from "@chess-vault/shared";

type PlatformUsernames = Partial<Record<Game["platform"], string>>;
export type PlayerPerspective = {
  player: Game["whitePlayer"];
  opponent: Game["blackPlayer"];
  playerColor: "white" | "black";
  result: "win" | "loss" | "draw";
};

/**
 * Gets the player's perspective in the game.
 * Uses linked platform usernames and optional primary account handle to determine
 * whether the current user played White or Black.
 */
export function getPlayerPerspective(
  game: Game,
  platformUsernames: PlatformUsernames,
  userHandle?: string,
): PlayerPerspective {
  const platformUser = platformUsernames[game.platform]?.toLowerCase();
  const handle = userHandle?.toLowerCase();

  const whiteLower = game.whitePlayer.username.toLowerCase();
  const blackLower = game.blackPlayer.username.toLowerCase();

  const isWhite =
    (platformUser && whiteLower === platformUser) ||
    (handle && whiteLower === handle);

  const isBlack =
    (platformUser && blackLower === platformUser) ||
    (handle && blackLower === handle);

  const playerColor: "white" | "black" = isBlack && !isWhite ? "black" : "white";
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
