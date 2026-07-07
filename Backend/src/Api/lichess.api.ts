import { lichess_api } from "./api.client";

const lichessApi = {
  getUserGames: (username: string) =>
    lichess_api.get(`/games/user/${username}`, {
      params: {
        pgnInJson: true,
      },
    }),
};

export default lichessApi;
