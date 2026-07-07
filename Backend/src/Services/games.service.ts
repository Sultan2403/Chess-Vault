import { Chess_Com_Game, Game } from "../Types/games.types";

const import_Chess_Com_Game = async () => {};

const import_Lichess_Game = async () => {};

export const normalizeLichessGame = ({
  game,
  userId,
  folderId,
}: {
  game: Lichess_Game;
  userId: string;
  folderId: string;
}): Game => {
  return {
    userId,
    folderId,
    platform: "lichess",
    platformGameId: game.id,
    sourceUrl: game.url,
    title: `${game.white.username} vs ${game.black.username}`,
    whitePlayer: { username: game.white.username, rating: game.white.rating },
    blackPlayer: { username: game.black.username, rating: game.black.rating },
    result:
      game.white.result === "win"
        ? "white"
        : game.black.result === "win"
          ? "black"
          : "draw",
    timeClass: game.time_class,
    playedAt: new Date(game.end_time * 1000),
    pgn: game.pgn,
    isRated: game.rated,
  };
};

export const normalizeChessComGame = ({
  game,
  userId,
  folderId,
}: {
  game: Chess_Com_Game;
  userId: string;
  folderId: string;
}): Game => {
  const title = `${game.white.username} vs ${game.black.username}`;
  const result =
    game.white.result === "win"
      ? "white"
      : game.black.result === "win"
        ? "black"
        : "draw";

  return {
    userId,
    folderId,
    platform: "chess.com",
    platformGameId: game.uuid,
    sourceUrl: game.url,
    title,
    whitePlayer: {
      username: game.white.username,
      rating: game.white.rating,
    },
    blackPlayer: {
      username: game.black.username,
      rating: game.black.rating,
    },
    result,
    timeClass: game.time_class,
    playedAt: new Date(game.end_time * 1000),
    pgn: game.pgn,
    isRated: game.rated,
  };
};

const game = {
  url: "https://www.chess.com/game/live/169709924810",
  pgn: '[Event "Live Chess"]\n[Site "Chess.com"]\n[Date "2026.06.04"]\n[Round "-"]\n[White "ntandosekhu02"]\n[Black "Sultan2403"]\n[Result "0-1"]\n[CurrentPosition "r4k2/p3pp1p/6p1/8/8/1P2PP2/P1PR3n/4Kq2 w - - 0 22"]\n[Timezone "UTC"]\n[ECO "D00"]\n[ECOUrl "https://www.chess.com/openings/Queens-Pawn-Opening-1...d5-2.e3-c5"]\n[UTCDate "2026.06.04"]\n[UTCTime "17:04:27"]\n[WhiteElo "1147"]\n[BlackElo "1153"]\n[TimeControl "600"]\n[Termination "Sultan2403 won by checkmate"]\n[StartTime "17:04:27"]\n[EndDate "2026.06.04"]\n[EndTime "17:08:20"]\n[Link "https://www.chess.com/game/live/169709924810"]\n\n1. d4 {[%clk 0:09:54.7]} 1... d5 {[%clk 0:09:57]} 2. e3 {[%clk 0:09:51.9]} 2... c5 {[%clk 0:09:51.8]} 3. b3 {[%clk 0:09:48.3]} 3... Nc6 {[%clk 0:09:47.7]} 4. Bb2 {[%clk 0:09:47]} 4... Nf6 {[%clk 0:09:45.4]} 5. Nd2 {[%clk 0:09:43.6]} 5... g6 {[%clk 0:09:42.5]} 6. Ngf3 {[%clk 0:09:40.7]} 6... Bg4 {[%clk 0:09:40.6]} 7. Bb5 {[%clk 0:09:32.5]} 7... Bg7 {[%clk 0:09:32.5]} 8. Bxc6+ {[%clk 0:09:29.3]} 8... bxc6 {[%clk 0:09:31.1]} 9. dxc5 {[%clk 0:09:28.4]} 9... O-O {[%clk 0:09:29]} 10. Ne5 {[%clk 0:09:26.2]} 10... Bxd1 {[%clk 0:08:41.6]} 11. Nxc6 {[%clk 0:09:23.2]} 11... Qd7 {[%clk 0:08:24.3]} 12. Ne5 {[%clk 0:09:18.5]} 12... Qc8 {[%clk 0:08:21.7]} 13. c6 {[%clk 0:09:11]} 13... Ng4 {[%clk 0:08:19.1]} 14. Nd7 {[%clk 0:09:07.7]} 14... Bxb2 {[%clk 0:08:12.9]} 15. Rxd1 {[%clk 0:09:04.6]} 15... Bc3 {[%clk 0:08:03.7]} 16. Nxf8 {[%clk 0:09:00]} 16... Bxd2+ {[%clk 0:08:01.6]} 17. Rxd2 {[%clk 0:08:56.3]} 17... Kxf8 {[%clk 0:07:59.8]} 18. Rxd5 {[%clk 0:08:51]} 18... Qxc6 {[%clk 0:07:56.1]} 19. Rd2 {[%clk 0:08:46.8]} 19... Qxg2 {[%clk 0:07:46.2]} 20. Rf1 {[%clk 0:08:45.3]} 20... Nxh2 {[%clk 0:07:43.4]} 21. f3 {[%clk 0:08:43.7]} 21... Qxf1# {[%clk 0:07:36.6]} 0-1\n',
  time_control: "600",
  end_time: 1780592900,
  rated: true,
  tcn: "lBZJmuYIjr5Qcj!Tbl2Ugv6EfH92HQXQBI8!vKEdKQ7ZQKZ6IQTEKZ2jadjsZ9sldl!9lJ6QJlQohfEpnvof",
  uuid: "71fc3d92-6037-11f1-b62d-b9838301000f",
  initial_setup: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  fen: "r4k2/p3pp1p/6p1/8/8/1P2PP2/P1PR3n/4Kq2 w - - 0 22",
  time_class: "rapid",
  rules: "chess",
  white: {
    rating: 1147,
    result: "checkmated",
    "@id": "https://api.chess.com/pub/player/ntandosekhu02",
    username: "ntandosekhu02",
    uuid: "6b03fb04-fe23-11f0-8a97-47442b87f3fa",
  },
  black: {
    rating: 1153,
    result: "win",
    "@id": "https://api.chess.com/pub/player/sultan2403",
    username: "Sultan2403",
    uuid: "70b5285c-0ee7-11ef-9ae6-2d20dff3d437",
  },
  eco: "https://www.chess.com/openings/Queens-Pawn-Opening-1...d5-2.e3-c5",
};

console.log(
  normalizeChessComGame({
    userId: "test_101",
    folderId: "test_101",
    game,
  }),
);
