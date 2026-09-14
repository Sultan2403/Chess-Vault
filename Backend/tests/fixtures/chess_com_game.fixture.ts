import type { Chess_Com_Game } from "@chess-vault/shared";

export const MOCK_CHESS_COM_GAME: Chess_Com_Game = {
  url: "https://www.chess.com/game/daily/957394363",
  pgn: "1. d4 1... d5 2. c4 2... dxc4 3. Nc3 1-0",
  time_control: "1/259200",
  end_time: 1782919420,
  rated: true,
  tcn: "lBZJkAJAbs!TcD0KDK6Siq5Qgv9RKw8!",
  uuid: "a29bc958-368f-11f1-a667-f1bcca01000b",
  initial_setup: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  fen: "7Q/8/6pk/6rr/8/5K2/7p/8 b - - 1 77",
  time_class: "daily",
  rules: "chess",
  white: {
    rating: 845,
    result: "win",
    "@id": "https://api.chess.com/pub/player/mada1974",
    username: "mada1974",
    uuid: "086c8912-911f-11ed-8ef3-531f7f421e36",
  },
  black: {
    rating: 950,
    result: "checkmated",
    "@id": "https://api.chess.com/pub/player/sultan2403",
    username: "Sultan2403",
    uuid: "70b5285c-0ee7-11ef-9ae6-2d20dff3d437",
  },
  eco: "https://www.chess.com/openings/Queens-Gambit-Accepted-3.Nc3-Nf6",
};

export const MOCK_CHESS_COM_DRAWN_GAME: Chess_Com_Game = {
  url: "https://www.chess.com/game/live/170984020322",
  pgn: "1. e4 1... e6 2. d4 1/2-1/2",
  time_control: "600",
  end_time: 1782926779,
  rated: true,
  tcn: "mC0SlBZJCJSJgv!TkAYQbs9zAJQJdy5QfH6ZHQzsjsZQyk8!",
  uuid: "77316a0b-7570-11f1-9d7a-8a740101000f",
  initial_setup: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  fen: "8/8/8/5K2/8/Q7/p7/k7 b - - 23 60",
  time_class: "rapid",
  rules: "chess",
  white: {
    rating: 1216,
    result: "agreed",
    "@id": "https://api.chess.com/pub/player/sultan2403",
    username: "Sultan2403",
    uuid: "70b5285c-0ee7-11ef-9ae6-2d20dff3d437",
  },
  black: {
    rating: 1407,
    result: "agreed",
    "@id": "https://api.chess.com/pub/player/agboolasola",
    username: "agboolasola",
    uuid: "0169100e-5f5d-11eb-912c-2b6726e38cf8",
  },
};
