import { getWhiteWinPercentage } from "../../utils/stockfish";

type EvalBarProps = { evalCp: number | null; mate: number | null; depth: number; isAnalyzing: boolean };

export function EvalBar({ evalCp, mate, depth, isAnalyzing }: EvalBarProps) {
  const evalValue = mate !== null ? (mate === 0 ? "#0" : `#${mate}`) : evalCp === null ? "—" : `${evalCp > 0 ? "+" : ""}${(evalCp / 100).toFixed(2)}`;
  const score = mate ?? evalCp ?? 0;
  const scoreColor = score > 0 ? "text-vault-win" : score < 0 ? "text-vault-loss" : "text-vault-text-muted";
  const whitePercent = getWhiteWinPercentage(evalCp, mate);

  return (
    <div className="flex h-full min-h-0 w-7 flex-col items-center justify-between rounded-vault border border-vault-border-base bg-vault-surface-layer-1 py-2 font-mono">
      <span className={`${scoreColor} text-[10px] font-bold [writing-mode:vertical-rl] rotate-180`}>{evalValue}</span>
      <div className="relative my-2 min-h-0 w-2 flex-1 overflow-hidden rounded-full bg-vault-surface-layer-2">
        <div
          className="absolute inset-x-0 bottom-0 bg-vault-primary transition-[height] duration-500 ease-out"
          style={{ height: `${whitePercent}%` }}
        />
      </div>
      <span className="text-[8px] text-vault-text-muted [writing-mode:vertical-rl] rotate-180">
        {isAnalyzing && depth === 0 ? "Analyzing…" : `D${depth}`}
      </span>
    </div>
  );
}
