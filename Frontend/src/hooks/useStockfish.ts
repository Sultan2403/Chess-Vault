import { useEffect, useRef, useState } from "react";
import { parseUciInfoLine } from "../utils/stockfish";

export type StockfishEval = {
  evalCp: number | null;
  mate: number | null;
  depth: number;
  bestMove: string | null;
  isAnalyzing: boolean;
};

type EngineState = "starting" | "ready" | "searching" | "stopping" | "dead";

const WORKER_URL = "/stockfish/stockfish-19-lite-single.js";
const EMPTY_EVAL: StockfishEval = {
  evalCp: null,
  mate: null,
  depth: 0,
  bestMove: null,
  isAnalyzing: false,
};

export function useStockfish(fen: string): StockfishEval {
  const [evaluation, setEvaluation] = useState<StockfishEval>(EMPTY_EVAL);
  const workerRef = useRef<Worker | null>(null);
  const stateRef = useRef<EngineState>("starting");
  const requestedFenRef = useRef(fen);
  const activeFenRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRequestedRef = useRef(false);
  const startLatestAnalysisRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    requestedFenRef.current = fen;
    console.debug("[Stockfish] FEN requested", fen);
  }, [fen]);

  useEffect(() => {
    console.log("[Stockfish] effect setup started");
    console.log("[Stockfish] Creating worker", WORKER_URL);
    stateRef.current = "starting";
    stopRequestedRef.current = false;
    activeFenRef.current = null;
    requestedFenRef.current = fen;

    let worker: Worker;
    try {
      worker = new Worker(WORKER_URL, { type: "classic" });
      workerRef.current = worker;
      console.log("[Stockfish] Worker constructed", worker);
    } catch (error) {
      stateRef.current = "dead";
      console.error("[Stockfish] Worker construction failed", error);
      return;
    }

    const send = (command: string) => {
      if (stateRef.current === "dead") return;
      console.log("[Stockfish] Sending UCI command", command);
      worker.postMessage(command);
    };

    const startLatestAnalysis = () => {
      if (stateRef.current !== "ready") return;
      const nextFen = requestedFenRef.current;
      activeFenRef.current = nextFen;
      stopRequestedRef.current = false;
      stateRef.current = "searching";
      console.info("[Stockfish] Starting analysis", nextFen);
      send(`position fen ${nextFen}`);
      send("go depth 20");
      setEvaluation({ ...EMPTY_EVAL, isAnalyzing: true });
    };

    startLatestAnalysisRef.current = startLatestAnalysis;

    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (typeof event.data !== "string") {
        console.warn("[Stockfish] Ignoring non-string worker message", event.data);
        return;
      }

      const lines = event.data.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      for (const line of lines) {
        console.debug("[Stockfish] Worker message", line);

        if (line === "uciok") {
          console.info("[Stockfish] UCI initialized");
          send("setoption name Hash value 16");
          send("isready");
          continue;
        }

        if (line === "readyok") {
          stateRef.current = "ready";
          console.info("[Stockfish] Worker ready");
          startLatestAnalysis();
          continue;
        }

        if (line.startsWith("bestmove ")) {
          const bestMove = line.split(/\s+/)[1] ?? null;
          const hasNewerFen = requestedFenRef.current !== activeFenRef.current;
          console.info("[Stockfish] Search complete", { bestMove, hasNewerFen });
          stateRef.current = "ready";
          stopRequestedRef.current = false;
          setEvaluation((previous) => ({ ...previous, bestMove, isAnalyzing: false }));
          if (hasNewerFen) startLatestAnalysis();
          continue;
        }

        if (stateRef.current !== "searching") continue;
        const sideToMove = activeFenRef.current?.split(/\s+/)[1] === "b" ? "b" : "w";
        const parsed = parseUciInfoLine(line, sideToMove);
        if (!parsed) continue;
        console.info("[Stockfish] Parsed evaluation", { sideToMove, parsed });
        setEvaluation((previous) => ({
          ...previous,
          depth: Math.max(previous.depth, parsed.depth),
          evalCp: parsed.cp,
          mate: parsed.mate,
        }));
      }
    };

    worker.onerror = (event) => {
      stateRef.current = "dead";
      console.error("[Stockfish] Worker error", event.message, event.filename, event.lineno, event.colno);
      setEvaluation((previous) => ({ ...previous, isAnalyzing: false }));
    };
    worker.onmessageerror = (event) => console.error("[Stockfish] Worker message error", event);
    console.log("[Stockfish] Worker handlers attached");
    send("uci");
    console.log("[Stockfish] Initial UCI command sent");

    return () => {
      console.info("[Stockfish] Cleaning up worker");
      stateRef.current = "dead";
      if (debounceRef.current) clearTimeout(debounceRef.current);
      worker.postMessage("quit");
      worker.terminate();
      workerRef.current = null;
      startLatestAnalysisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const worker = workerRef.current;
      if (!worker || stateRef.current === "dead" || stateRef.current === "starting") return;
      console.info("[Stockfish] Debounced FEN request", requestedFenRef.current);
      if (stateRef.current === "ready") {
        startLatestAnalysisRef.current?.();
      } else if (stateRef.current === "searching" && !stopRequestedRef.current) {
        stopRequestedRef.current = true;
        stateRef.current = "stopping";
        worker.postMessage("stop");
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fen]);

  return evaluation;
}
