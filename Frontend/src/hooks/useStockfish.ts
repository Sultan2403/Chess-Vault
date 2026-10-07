import { useEffect, useRef, useState } from "react";
import { parseUciInfoLine } from "../utils/stockfish";

export type StockfishEval = { evalCp: number | null; mate: number | null; depth: number; bestMove: string | null; isAnalyzing: boolean };
const WORKER_URL = "/stockfish/stockfish-19-lite-single.js#/stockfish/stockfish-19-lite-single.wasm,worker";
const EMPTY_EVAL: StockfishEval = { evalCp: null, mate: null, depth: 0, bestMove: null, isAnalyzing: false };

export function useStockfish(fen: string): StockfishEval {
  const [evaluation, setEvaluation] = useState<StockfishEval>(EMPTY_EVAL);
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef(false);
  const pendingFenRef = useRef(fen);
  const analyzingFenRef = useRef(fen);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    pendingFenRef.current = fen;
    console.debug("[Stockfish] FEN received", fen);
  }, [fen]);
  useEffect(() => {
    console.log("[Stockfish] effect setup started");
    console.log("[Stockfish] Creating worker", WORKER_URL);
    let worker: Worker;
    try {
      worker = new Worker(WORKER_URL, { type: "classic" });
      console.log("[Stockfish] Worker constructed", worker);
    } catch (error) {
      console.error("[Stockfish] Worker construction failed", error);
      return;
    }
    workerRef.current = worker;
    const send = (command: string) => {
      console.log("[Stockfish] Sending UCI command", command);
      worker.postMessage(command);
    };
    const analyze = (positionFen: string) => {
      analyzingFenRef.current = positionFen;
      console.info("[Stockfish] Starting analysis", positionFen);
      send("stop"); send(`position fen ${positionFen}`); send("go depth 20");
      setEvaluation({ ...EMPTY_EVAL, isAnalyzing: true });
    };
    worker.onmessage = (event: MessageEvent<unknown>) => {
      console.log("[Stockfish] Worker message", event.data);
      if (typeof event.data !== "string") {
        console.warn("[Stockfish] Ignoring non-string worker message", event.data);
        return;
      }
      const lines = event.data.split(/\r?\n/).map((message) => message.trim()).filter(Boolean);
      for (const line of lines) {
        console.debug("[Stockfish] Processing line", line);
        if (line === "uciok") { console.info("[Stockfish] UCI initialized"); send("setoption name Hash value 16"); send("isready"); continue; }
        if (line === "readyok") { readyRef.current = true; console.info("[Stockfish] Worker ready"); analyze(pendingFenRef.current); continue; }
        if (line.startsWith("bestmove ")) { const bestMove = line.split(/\s+/)[1] ?? null; console.info("[Stockfish] Best move", bestMove); setEvaluation((p) => ({ ...p, bestMove, isAnalyzing: false })); continue; }
        const sideToMove = analyzingFenRef.current.split(/\s+/)[1] === "b" ? "b" : "w";
        const parsed = parseUciInfoLine(line, sideToMove);
        if (!parsed) { if (line.startsWith("info")) console.debug("[Stockfish] Info line had no usable score", line); continue; }
        console.info("[Stockfish] Parsed evaluation", { line, sideToMove, parsed });
        setEvaluation((p) => ({ ...p, depth: Math.max(p.depth, parsed.depth), evalCp: parsed.cp, mate: parsed.mate }));
      }
    };
    worker.onerror = (event) => console.error("[Stockfish] Worker error", event.message, event.filename, event.lineno, event.colno);
    worker.onmessageerror = (event) => console.error("[Stockfish] Worker message error", event);
    console.log("[Stockfish] Worker handlers attached");
    send("uci");
    console.log("[Stockfish] Initial UCI command sent");
    return () => { console.info("[Stockfish] Cleaning up worker"); if (debounceRef.current) clearTimeout(debounceRef.current); send("quit"); worker.terminate(); workerRef.current = null; readyRef.current = false; };
  }, []);
  useEffect(() => {
    if (!readyRef.current) { console.debug("[Stockfish] FEN change waiting for worker readiness"); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { if (!workerRef.current) { console.warn("[Stockfish] Cannot analyze: worker missing"); return; } analyzingFenRef.current = fen; console.info("[Stockfish] Debounced FEN analysis", fen); workerRef.current.postMessage("stop"); workerRef.current.postMessage(`position fen ${fen}`); workerRef.current.postMessage("go depth 20"); setEvaluation({ ...EMPTY_EVAL, isAnalyzing: true }); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fen]);
  return evaluation;
}
