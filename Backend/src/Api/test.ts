// import fs from "fs";
// import path from "path";
// import { Chess } from "chess.js";
// import lichessApi from "./lichess.api";

// // 1. Read real Lichess games from test.ndjson
// const ndjsonContent = fs.readFileSync(path.join(__dirname, "test.ndjson"), "utf-8");
// const lichessGames: Array<{ id: string; moves: string }> = [];
// for (const line of ndjsonContent.split("\n")) {
//   if (!line.trim()) continue;
//   try {
//     const parsed = JSON.parse(line);
//     if (parsed.moves) lichessGames.push({ id: parsed.id, moves: parsed.moves });
//   } catch {}
// }

// // 2. Read real Chess.com games from chess.comtest.json
// const chessComContent = fs.readFileSync(path.join(__dirname, "chess.comtest.json"), "utf-8");
// const chessComGames: Array<{ pgn: string; fen?: string }> = [];
// try {
//   const parsed = JSON.parse(chessComContent);
//   if (Array.isArray(parsed.games)) {
//     for (const g of parsed.games) {
//       if (g.pgn) chessComGames.push({ pgn: g.pgn, fen: g.fen });
//     }
//   }
// } catch {}

// console.log(`\n======================================================`);
// console.log(`TEST 1: 5 Real Lichess Games (deriving FEN via chess.js)`);
// console.log(`======================================================`);

// const sample5 = lichessGames.slice(0, 5);

// console.time("5 Lichess Games (Total)");

// const sampleResults = sample5.map((g, idx) => {
//   const start = performance.now();
//   const chess = new Chess();
//   const moves = g.moves.split(/\s+/).filter(Boolean);
//   for (const m of moves) {
//     chess.move(m);
//   }
//   const fen = chess.fen();
//   const time = performance.now() - start;
//   return { idx: idx + 1, id: g.id, plies: moves.length, time, fen };
// });

// console.timeEnd("5 Lichess Games (Total)");

// console.log("\nIndividual Game Breakdown:");
// sampleResults.forEach((r) => {
//   console.log(
//     `  Game #${r.idx} (${r.id}): ${r.plies} half-moves in ${r.time.toFixed(3)} ms -> Final FEN: ${r.fen}`,
//   );
// });

// console.log(`\n======================================================`);
// console.log(`TEST 2: 5 Real Chess.com Games using loadPgn() in chess.js`);
// console.log(`======================================================`);

// const chessComSample5 = chessComGames.slice(0, 5);
// console.time("5 Chess.com Games loadPgn() (Total)");
// const chessComResults = chessComSample5.map((g, idx) => {
//   const start = performance.now();
//   const chess = new Chess();
//   chess.loadPgn(g.pgn);
//   const fen = chess.fen();
//   const time = performance.now() - start;
//   return { idx: idx + 1, time, fen };
// });
// console.timeEnd("5 Chess.com Games loadPgn() (Total)");

// chessComResults.forEach((r) => {
//   console.log(`  Game #${r.idx}: ${r.time.toFixed(3)} ms -> Final FEN: ${r.fen}`);
// });

// console.log(`\n======================================================`);
// console.log(`TEST 3: Full Batch Stress Test (${lichessGames.length} real Lichess games)`);
// console.log(`======================================================`);

// console.time(`Batch of ${lichessGames.length} games`);
// const startBatch = performance.now();
// for (const g of lichessGames) {
//   const chess = new Chess();
//   const moves = g.moves.split(/\s+/).filter(Boolean);
//   for (const m of moves) {
//     chess.move(m);
//   }
//   chess.fen();
// }
// const totalBatchTime = performance.now() - startBatch;
// console.timeEnd(`Batch of ${lichessGames.length} games`);

// console.log(`\nAverage time per game across ${lichessGames.length} games: ${(totalBatchTime / lichessGames.length).toFixed(3)} ms\n`);


// async function testLichessClocksFlag(){
//   console.log(await lichessApi.getUserGames("Sultan2403"))
// }

// testLichessClocksFlag()