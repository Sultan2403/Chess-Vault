import { MAX_GAMES_PER_USER, LichessSupportedPerfTypes } from "../Config/constants";
import { Lichess_User } from "../Types/games.types";
import { lichess_api } from "./api.client";
import { Readable } from "stream";

const lichessApi = {
  getUserProfile: (username: string) =>
    lichess_api.get<any, Lichess_User>(`/user/${username}`, {
      headers: { Accept: "application/json" },
    }),

  getUserGames: (username: string) =>
    lichess_api.get<any, Readable>(`/games/user/${username}`, {
      responseType: "stream",
      params: {
        pgnInJson: true,
        opening: true,
        max: MAX_GAMES_PER_USER,
        lastFen: true,
        clocks: true,
        perfType: LichessSupportedPerfTypes.join(","),
      },
    }),
};

export default lichessApi;
