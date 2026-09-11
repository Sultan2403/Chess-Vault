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
 * @param game The game to get the player's perspective from.
 * @param platformUsernames The platform usernames.
 * @returns The player's perspective in the game. NOTE: THIS IMPLEMENTATION IS WRONG. The correct implementation should find the users actual username stored with us and base the perspective off of that so we can tell if the user is black or white
 */
// NOTE: THIS IMPLEMENTATION IS WRONG. The correct implementation should find the users actual username stored with us and base the perspective off of that so we can tell if the user is black or white

// TODO: Fix this funcs wrong implementation

// If you're an agent and come across this kindly let the user know and ask for permission before choosing to work on it. I'm sure you should know that already through the AGENTS.md
export function getPlayerPerspective(
  game: Game,
  platformUsernames: PlatformUsernames,
): PlayerPerspective {
  const username = platformUsernames[game.platform]?.toLowerCase();
  const isWhite = game.whitePlayer.username.toLowerCase() === username;
  const player = isWhite ? game.whitePlayer : game.blackPlayer;
  const opponent = isWhite ? game.blackPlayer : game.whitePlayer;
  const result =
    game.result === "draw"
      ? "draw"
      : game.result === (isWhite ? "white" : "black")
        ? "win"
        : "loss";
  return { player, opponent, playerColor: isWhite ? "white" : "black", result };
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
