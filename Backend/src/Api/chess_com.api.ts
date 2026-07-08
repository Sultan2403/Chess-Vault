import { Chess_Com_Game } from "../Types/games.types";
import { chess_com_api } from "./api.client";

const chessComApi = {
  getPlayerGamesForMonth: ({
    username,
    year,
    month,
  }: {
    username: string;
    year: string | number;
    month: string | number;
  }) => {
    const yearString = `${year}`;
    const monthString = `${month}`.padStart(2, "0");
    return chess_com_api.get<any, { games: Chess_Com_Game[] }>(
      `/player/${username}/games/${yearString}/${monthString}`,
    );
  },

  getPlayerArchives: (username: string) => {
    return chess_com_api.get<any, { archives: string[] }>(
      `/player/${username}/games/archives`,
    );
  },

  getGamesFromArchiveUrl: (fullUrl: string) => {
    return chess_com_api.get<any, { games: Chess_Com_Game[] }>(fullUrl);
  },
};

export default chessComApi;
