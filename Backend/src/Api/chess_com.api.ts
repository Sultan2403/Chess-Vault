import { chess_com_api } from "./api.client";

const chessComApi = {
  getPlayerGamesForMonth: (username: string, year: string, month: string) =>
    chess_com_api.get(`/player/${username}/games/${year}/${month}`),
};

export default chessComApi;
