import { LichessSupportedPerfTypes } from "../Config/constants";
import { Lichess_User } from "../Types/games.types";
import { lichess_api } from "./api.client";
import { Readable } from "stream";

const lichessApi = {
  getUserProfile: (username: string) =>
    lichess_api.get<any, Lichess_User>(`/user/${username}`, {
      headers: { Accept: "application/json" },
    }),

  getUserGames: (
    username: string,
    params: { max: number; since?: number },
  ) =>
    lichess_api.get<any, Readable>(`/games/user/${username}`, {
      responseType: "stream",
      params: {
        pgnInJson: true,
        opening: true,
        max: params.max,
        since: params.since,
        lastFen: true,
        clocks: true,
        moves: true,
        tags: true,
        perfType: LichessSupportedPerfTypes.join(","),
      },
    }),
};

export default lichessApi;
