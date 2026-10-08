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
const MIN_DISPLAY_DEPTH = 8;
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
  }, [fen]);

  useEffect(() => {
    stateRef.current = "starting";
    stopRequestedRef.current = false;
    activeFenRef.current = null;
    requestedFenRef.current = fen;

    let worker: Worker;
    try {
      worker = new Worker(WORKER_URL, { type: "classic" });
      workerRef.current = worker;
    } catch {
      stateRef.current = "dead";
      return;
    }

    const send = (command: string) => {
      if (stateRef.current === "dead") return;
      worker.postMessage(command);
    };

    const startLatestAnalysis = () => {
      if (stateRef.current !== "ready") return;
      const nextFen = requestedFenRef.current;
      activeFenRef.current = nextFen;
      stopRequestedRef.current = false;
      stateRef.current = "searching";
      send(`position fen ${nextFen}`);
      send("go depth 20");
      setEvaluation((previous) => ({
        ...previous,
        depth: 0,
        bestMove: null,
        isAnalyzing: true,
      }));
    };

    startLatestAnalysisRef.current = startLatestAnalysis;

    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (typeof event.data !== "string") {
        return;
      }

      const lines = event.data.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      for (const line of lines) {
        if (line === "uciok") {
          send("setoption name Hash value 16");
          send("isready");
          continue;
        }

        if (line === "readyok") {
          stateRef.current = "ready";
          startLatestAnalysis();
          continue;
        }

        if (line.startsWith("bestmove ")) {
          const bestMove = line.split(/\s+/)[1] ?? null;
          const hasNewerFen = requestedFenRef.current !== activeFenRef.current;
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
        setEvaluation((previous) => ({
          ...previous,
          depth: Math.max(previous.depth, parsed.depth),
          ...(parsed.depth >= MIN_DISPLAY_DEPTH
            ? { evalCp: parsed.cp, mate: parsed.mate }
            : {}),
        }));
      }
    };

    worker.onerror = () => {
      stateRef.current = "dead";
      setEvaluation((previous) => ({ ...previous, isAnalyzing: false }));
    };
    worker.onmessageerror = () => {
      stateRef.current = "dead";
      setEvaluation((previous) => ({ ...previous, isAnalyzing: false }));
    };
    send("uci");

    return () => {
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
