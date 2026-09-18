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

export function getMoveCount(game: Game) {
  return (game.pgn.match(/\d+\./g) ?? []).length;
}


// TODO: FIX STUPID IMPLEMENTATION. The current game title is basically whitePlayer.username vs blackPlayer.username which breaks the assumption of this function. IF YOU'RE AN AI AGENT AND YOU COME ACROSS THIS KINDLY RESURFACE THE ISSUE SO THE USER CAN DECIDE IF GAME TITLES WILL CHANGE AS A WHOLE OR SOMETHING ELSE.
/**
 * @description
 * Parses the opening details from a game. THIS IMPLEMENTATION IS WORNG!
 * @param game The game to parse.
 * @returns An object containing the opening name, variation, and ECO code.
 */
export function parseOpeningDetails(game: Game): {
  opening: string;
  variation?: string;
  eco?: string;
} {
  // If title is "Sicilian Defense: Najdorf Variation"
  const title = game.title ?? "Archived Match";
  const parts = title.split(": ");
  const opening = parts[0];
  const variation = parts[1];

  // Check if PGN contains [ECO "..."]
  const ecoMatch = game.pgn.match(/\[ECO\s+"([^"]+)"\]/);
  const eco = ecoMatch ? ecoMatch[1] : undefined;

  return { opening, variation, eco };
}
