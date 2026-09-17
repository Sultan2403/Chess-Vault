import type { Game } from "@chess-vault/shared";

export const currentPlatformUsernames = {
  "chess.com": "Sultan2403",
  lichess: "Sultan2403",
} as const;

export const mockGames: Game[] = [
  {
    id: "game-1",
    userId: "user-1",
    folderIds: ["folder-tournament"],
    platform: "chess.com",
    platformGameId: "cv-2024-0419",
    sourceUrl: "https://chess.com/game/live/cv-2024-0419",
    title: "City Championship 2024: Evans Gambit Accepted",
    whitePlayer: { username: "Sultan", rating: 2140 },
    blackPlayer: { username: "M. Chigorin", rating: 2089 },
    result: "white",
    isRated: true,
    timeClass: "classical",
    playedAt: new Date("2024-10-12T17:42:00Z"),
    pgn: `[Event "City Championship 2024"]
[Site "Zurich Hall"]
[Date "2024.10.12"]
[Round "4"]
[White "Sultan"]
[Black "M. Chigorin"]
[Result "1-0"]
[ECO "C52"]
[WhiteElo "2140"]
[BlackElo "2089"]
[TimeControl "5400+30"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 8. cxd4 d5 9. exd5 Nxd5 10. Ba3 Be6 11. Bb5 Bb4 12. Qa4 Bxa3 13. Bxc6+ bxc6 14. Qxc6+ Ke7 15. Nxa3 Qd6 16. Qc1 Rhd8 17. Nc4 Qf4 18. Qa3+ Ke8 19. Rfe1 Rab8 20. Nce5 Rb6 21. Rac1 Rdd6 22. Qxa7 Kf8 23. Nxf7 Kxf7 24. Qf3+ Kg8 25. Rxc7 Rd8 26. Ne5 Qf5 27. Qg3 g6 28. Qh4 Nf6 29. Qh6 Nd7 30. h3 Rb2 31. Ng4 Rb1 32. Rxb1 Qxb1+ 33. Kh2 Qf5 34. Bxd5 1-0`,
    notes:
      "Found the knight sacrifice on move 23 after remembering Kasparov's game vs Anand (1995). Black's king had nowhere to shelter once the f-file pried open. Move 34. Bxd5 eliminated his only active defensive diagonal. Chigorin stared at the board for 11 minutes before resigning.",
    tags: "Tournament Games",
  },
  {
    id: "game-2",
    userId: "user-1",
    folderIds: ["folder-openings"],
    platform: "chess.com",
    platformGameId: "cv-2024-0420",
    sourceUrl: "https://chess.com/game/live/cv-2024-0420",
    title: "Sicilian Defense: Najdorf Variation (English Attack)",
    whitePlayer: { username: "Sultan", rating: 2148 },
    blackPlayer: { username: "M_Artemiev", rating: 2192 },
    result: "white",
    isRated: true,
    timeClass: "rapid",
    playedAt: new Date("2024-10-24T17:42:00Z"),
    pgn: `[Event "Live Chess Rapid"]
[Site "Chess.com"]
[Date "2024.10.24"]
[Round "1"]
[White "Sultan"]
[Black "M_Artemiev"]
[Result "1-0"]
[ECO "B90"]
[WhiteElo "2148"]
[BlackElo "2192"]
[TimeControl "600+0"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 b5 9. g4 Be7 10. Qd2 O-O 11. O-O-O Nbd7 12. g5 Nh5 13. Nd5 Bxd5 14. exd5 Nb6 15. Kb1 Qc7 16. Na5 Rac8 17. Nc6 Nxd5 18. Qxd5 Qxc6 19. Qxc6 Rxc6 20. a4 Rb8 21. axb5 axb5 22. Rd5 b4 23. Bb5 Rc7 24. b3 g6 25. Rhd1 Ng7 26. Bc4 Ne6 27. h4 Kg7 28. Ra5 Rbc8 29. Ra4 Rb8 30. Bd2 Rcb7 31. Bd5 Rb5 32. Bc6 R5b6 33. Bd5 Rb5 34. Bc6 R5b6 35. Bd7 Nc5 36. Ra7 R8b7 37. Rxb7 Rxb7 38. Qxh7# 1-0`,
    notes:
      "Sacrifice at d5 unlocked rook battery along the e-file. Positional bind retained throughout.",
    tags: "Najdorf Lab",
  },
  {
    id: "game-3",
    userId: "user-1",
    folderIds: ["folder-repertoire"],
    platform: "lichess",
    platformGameId: "cv-2024-0421",
    sourceUrl: "https://lichess.org/cv-2024-0421",
    title: "Catalan Opening: Open Classical Line",
    whitePlayer: { username: "K_Vogel_FM", rating: 2315 },
    blackPlayer: { username: "Sultan", rating: 2141 },
    result: "black",
    isRated: true,
    timeClass: "blitz",
    playedAt: new Date("2024-10-22T22:15:00Z"),
    pgn: `[Event "Lichess Rated Blitz"]
[Site "lichess.org"]
[Date "2024.10.22"]
[White "K_Vogel_FM"]
[Black "Sultan"]
[Result "0-1"]
[ECO "E04"]
[WhiteElo "2315"]
[BlackElo "2141"]
[TimeControl "180+2"]

1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 c5 6. O-O Nc6 7. Qa4 Bd7 8. Qxc4 cxd4 9. Nxd4 Rc8 10. Nc3 Nxd4 11. Qxd4 Bc5 12. Qh4 Bc6 13. Bxc6+ Rxc6 14. Bg5 Be7 15. Rfd1 Qb6 16. Rd2 O-O 17. Rad1 h6 18. Be3 Qa5 19. a3 Nd5 20. Qh5 f5 21. Nxd5 exd5 22. Rxd5 Qa4 23. R1d4 Qb3 24. Rxf5 Bf6 25. Rd7 Qxb2 26. Bxh6 Qb1+ 27. Kg2 Qe4+ 28. f3 Qxe2+ 29. Kh3 Qf1+ 30. Kg4 Rc4+ 31. f4 Qe2+ 32. Kh3 Qxh5+ 33. Rxh5 gxh6 34. Rxh6 Rf7 35. Rg6+ Bg7 36. Rd8+ Kh7 37. Rgd6 Rc3 38. a4 Rc4 39. a5 Rc5 40. R8d7 Rxd7 41. Rxd7 Rb5 42. Kg4 a6 43. h4 Kg8 44. h5 Rd2+ 0-1`,
    notes:
      "Perpetual check sealed after opposite-color bishop blockade. Sharp endgame tactical squeeze.",
    tags: "Tactical Monoliths",
  },
  {
    id: "game-4",
    userId: "user-1",
    folderIds: ["folder-classical"],
    platform: "chess.com",
    platformGameId: "cv-2024-0422",
    sourceUrl: "https://chess.com/game/live/cv-2024-0422",
    title: "Queen's Gambit Declined: Harrwitz Attack, 5.Bf4",
    whitePlayer: { username: "Sultan", rating: 2084 },
    blackPlayer: { username: "D_Nakamura_Sr", rating: 2110 },
    result: "draw",
    isRated: true,
    timeClass: "classical",
    playedAt: new Date("2024-11-12T14:00:00Z"),
    pgn: `[Event "Classical OTB League"]
[Site "Zurich"]
[Date "2024.11.12"]
[Round "6"]
[White "Sultan"]
[Black "D_Nakamura_Sr"]
[Result "1/2-1/2"]
[ECO "D37"]
[WhiteElo "2084"]
[BlackElo "2110"]
[TimeControl "5400+30"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Be7 5. Bf4 O-O 6. e3 c5 7. dxc5 Bxc5 8. Qc2 Nc6 9. a3 Qa5 10. O-O-O Be7 11. g4 Rd8 12. g5 Ne4 13. Nb5 Rd7 14. Bd3 a6 15. Bxe4 dxe4 16. Rxd7 Bxd7 17. Bc7 b6 18. Qxe4 axb5 19. Rd1 Be8 20. Ne5 Nxe5 21. Bxe5 bxc4 22. Bc3 Qa4 23. Qe5 Bf8 24. h4 b5 25. h5 b4 26. axb4 Qa1+ 27. Kd2 Rd8+ 28. Bd4 Qa4 29. h6 Qxb4+ 30. Ke2 Rd5 31. Bc3 Rxe5 32. Bxb4 Bxb4 33. Rd8 Kf8 34. Rxe8+ Kxe8 35. hxg7 Rxg5 36. f4 Rxg7 37. Kf3 Rg1 38. Ke4 Rb1 39. Kd4 Rxb2 40. Kxc4 Bd2 41. Kd3 Bxe3 42. Kxe3 Rb3+ 43. Ke4 Ke7 44. f5 exf5+ 45. Kxf5 Rb5+ 46. Kg4 Kf6 47. Kh4 Kg6 48. Kg3 Rf5 49. Kg4 h5+ 50. Kg3 Kg5 51. Kh3 Rf3+ 52. Kg2 Kg4 53. Kh2 Rf2+ 54. Kg1 Kg3 55. Kh1 Rf1# 1/2-1/2`,
    notes:
      "Held notoriously tense rook and pawn transition. Balanced dynamic repetition agreement.",
    tags: "Classical League",
  },
];
