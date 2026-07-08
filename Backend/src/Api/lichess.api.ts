import { MAX_GAMES_PER_USER } from "../Config/constants";
import { Lichess_Game } from "../Types/games.types";
import { lichess_api } from "./api.client";
import { Readable } from "stream";

const lichessApi = {
  getUserGames: (username: string) =>
    lichess_api.get<any, Readable>(`/games/user/${username}`, {
      responseType: "stream",
      params: {
        pgnInJson: true,
        max: MAX_GAMES_PER_USER
      },
    }),
};

export default lichessApi;
