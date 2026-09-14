import type { Lichess_Game } from "@chess-vault/shared";

export const MOCK_LICHESS_GAME: Lichess_Game = {
  id: "FJViliCx",
  rated: true,
  variant: "standard",
  speed: "rapid",
  perf: "rapid",
  createdAt: 1783436222329,
  lastMoveAt: 1783436955749,
  status: "resign",
  source: "pool",
  winner: "black",
  players: {
    white: {
      user: {
        name: "wwershow",
        id: "wwershow",
      },
      rating: 1649,
      ratingDiff: -7,
    },
    black: {
      user: {
        name: "Sultan2403",
        id: "sultan2403",
      },
      rating: 1601,
      ratingDiff: 12,
    },
  },
  moves: "e4 c6 Bc4 d5 exd5 cxd5",
  pgn: "1. e4 c6 2. Bc4 d5 0-1",
  clock: {
    initial: 600,
    increment: 0,
    totalTime: 600,
  },
};

export const MOCK_LICHESS_DRAWN_GAME: Lichess_Game = {
  id: "AKe6HJmZ",
  rated: true,
  variant: "standard",
  speed: "rapid",
  perf: "rapid",
  createdAt: 1769513944182,
  lastMoveAt: 1769514351471,
  status: "draw",
  source: "pool",
  players: {
    white: {
      user: {
        name: "Sultan2403",
        id: "sultan2403",
      },
      rating: 1483,
      ratingDiff: -2,
    },
    black: {
      user: {
        name: "dima_v_2000",
        id: "dima_v_2000",
      },
      rating: 1447,
      ratingDiff: 1,
    },
  },
  moves: "e4 e5 Nf3 Nc6",
  pgn: "1. e4 e5 2. Nf3 Nc6 1/2-1/2",
};

export const MOCK_LICHESS_AI_GAME: Lichess_Game = {
  id: "lichessAiGame456",
  rated: false,
  variant: "standard",
  speed: "blitz",
  perf: "blitz",
  createdAt: 1783436222329,
  lastMoveAt: 1783436322329,
  status: "resign",
  source: "pool",
  winner: "white",
  players: {
    white: {
      user: {
        id: "sultan2403",
        name: "Sultan2403",
      },
      rating: 1600,
    },
    black: {
      aiLevel: 5,
      rating: 1700,
    },
  },
  moves: "d4 d5",
  pgn: "1. d4 d5 1-0",
};
