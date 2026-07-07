import { chess_com_api } from "./api.client";

export const chessComApi = {
  getPlayerGamesForMonth: async (
    username: string,
    year: string,
    month: string,
  ) => chess_com_api.get(`/player/${username}/games/${year}/${month}`),
};
