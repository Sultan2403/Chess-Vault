import { format } from "date-fns";
import type { Game } from "@chess-vault/shared";

type PlatformUsernames = Partial<Record<Game["platform"], string>>;
export type PlayerPerspective = {
  player: Game["whitePlayer"];
  opponent: Game["blackPlayer"];
  playerColor: "white" | "black";
  result: "win" | "loss" | "draw";
};

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
  const dateObj = typeof game.playedAt === "string" ? new Date(game.playedAt) : game.playedAt;
  if (isNaN(dateObj.getTime())) return "Unknown date";
  return format(dateObj, pattern);
}
export function getMoveCount(game: Game) {
  return (game.pgn.match(/\d+\./g) ?? []).length;
}
