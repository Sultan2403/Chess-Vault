import api from "./api.client"

export const chessComApi = {
    getPlayerGamesForMonth: async (username: string, year: number, month: number) => api.get(`player/${username}/games/${year}/${month}`),
}