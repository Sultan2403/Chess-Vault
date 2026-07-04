import "./App.css";

import axios from "axios";

// Chess.com requires a User-Agent header with contact info for public data requests
const CHESS_USER_NAME = "emperort2024"; // Or any active username you want to test
const YEAR = "2026"; 
const MONTH = "06"; // June

async function testChessApi() {
  try {
    const url = `https://api.chess.com/pub/player/${CHESS_USER_NAME}/games/${YEAR}/${MONTH}`;

    console.log(`Fetching games from: ${url}...`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "ChessVault-Bot/1.0 (contact: your-email@example.com)",
      },
    });

    const games = response.data.games;
    console.log(response.data)
    console.log(`Successfully fetched ${games.length} games!\n`);

    if (games.length > 0) {
      // Let's inspect the very last game played
      const lastGame = games[games.length - 1];

      console.log("--- RAW GAME DATA SAMPLE ---");
      console.log(`URL: ${lastGame.url}`);
      console.log(
        `White: ${lastGame.white.username} (Rating: ${lastGame.white.rating})`,
      );
      console.log(
        `Black: ${lastGame.black.username} (Rating: ${lastGame.black.rating})`,
      );
      console.log(`Rules: ${lastGame.rules}`);
      console.log(
        `\nPGN Data (The move history string):\n${lastGame.pgn.substring(0, 300)}...`,
      );
    }
  } catch {
    console.error("Error fetching data from Chess.com API:");
  }
}

testChessApi();

function App() {


}

export default App;