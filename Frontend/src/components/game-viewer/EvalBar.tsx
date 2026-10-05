/**
 * Evaluation bar stub. Displayed values are hardcoded placeholders.
 * This will be replaced once Stockfish WASM analysis is implemented.
 */
export function EvalBar() {
  // TODO: Replace with real Stockfish WASM evaluation once implemented.
  const evalValue = "+4.82";
  const evalDepth = "Depth 36";

  return (
    <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-3">
      <div className="flex items-center justify-between font-mono text-xs mb-1.5">
        <span className="text-vault-win font-bold">{evalValue}</span>
        <div className="h-1.5 flex-1 mx-4 overflow-hidden rounded-full bg-vault-surface-container flex">
          <div className="h-full bg-vault-primary" style={{ width: "72%" }} />
          <div className="h-full bg-vault-surface-layer-2" style={{ width: "28%" }} />
        </div>
        <span className="text-vault-text-muted text-[11px]">{evalDepth}</span>
      </div>
    </div>
  );
}
