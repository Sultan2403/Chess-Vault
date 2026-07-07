import axios from "axios";
import fs from "fs";

const getStuff = async () => {
  const res = await axios.get("https://api.chess.com/pub/player/Sultan2403/games/2026/06");
  console.log(res.data);

  fs.writeFileSync(
    "src/Api/chess.comtest.json",
    JSON.stringify(res.data, null, 2)
  );
};

getStuff();
