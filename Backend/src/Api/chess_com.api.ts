import { Chess_Com_Game } from "../Types/games.types";
import { chess_com_api } from "./api.client";

const chessComApi = {
  getPlayerGamesForMonth: (
    username: string,
    year: string | number,
    month: string | number,
  ) => {
    const yearString = `${year}`;
    const monthString = `${month}`.padStart(2, "0");
    return chess_com_api.get<any, { games: Chess_Com_Game[] }>(
      `/player/${username}/games/${yearString}/${monthString}`,
    );
  },
};

export default chessComApi;
