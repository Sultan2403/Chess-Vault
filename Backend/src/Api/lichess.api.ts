import { MAX_GAMES_PER_USER } from "../Config/constants";
import { Lichess_Game } from "../Types/games.types";
import { lichess_api } from "./api.client";

const lichessApi = {
  getUserGames: (username: string) =>
    lichess_api.get<any, Lichess_Game[]>(`/games/user/${username}`, {
      params: {
        pgnInJson: true,
        max: MAX_GAMES_PER_USER
      },
    }),
};

export default lichessApi;
