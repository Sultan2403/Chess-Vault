import fs from "fs";
import lichessApi from "./lichess.api";
import chessComApi from "./chess_com.api";

const getStuff = async () => {
  try {
    const chessComRes = await chessComApi.getPlayerGamesForMonth(
      "Sultan2403",
      2026,
      7,
    );
    console.log("chess.com response:", chessComRes);

    const res = await lichessApi.getUserGames("Sultan2403");
    console.log("lichess response:", res);

    fs.writeFileSync(
      "src/Api/chess.comtest.json",
      JSON.stringify(chessComRes, null, 2),
    );
  } catch (err: any) {
    if (err.response) {
      console.error("API error status:", err.response.status);
      console.error("API error data:", err.response.data);
    }
    console.error(err.message);
  }
};

getStuff();
