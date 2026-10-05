import { type RefObject } from "react";
import type { MovePair } from "../../hooks/useParsedGame";

type NotationLedgerProps = {
  parsedMoves: MovePair[];
  currentMoveIdx: number;
  activeMoveButtonRef: RefObject<HTMLButtonElement | null>;
  onGoTo: (idx: number) => void;
};

export function NotationLedger({
  parsedMoves,
  currentMoveIdx,
  activeMoveButtonRef,
  onGoTo,
}: NotationLedgerProps) {
  return (
    <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
        <span className="font-semibold text-vault-text-primary">Transcribed Notation</span>
      </div>

      <div className="mt-4 max-h-60 overflow-y-auto space-y-1 pr-1">
        {parsedMoves.length === 0 ? (
          <p className="py-4 text-center text-vault-text-muted italic">No notation recorded.</p>
        ) : (
          parsedMoves.map((row) => {
            const isWhiteActive = currentMoveIdx === row.whiteIdx;
            const isBlackActive = currentMoveIdx === row.blackIdx;

            return (
              <div
                key={row.number}
                className="grid grid-cols-[36px_1fr_1fr] items-center rounded-xs px-2 py-0.5 hover:bg-vault-surface-layer-2/50"
              >
                <span className="text-vault-text-muted text-[11px]">{row.number}.</span>

                {/* White Move */}
                <button
                  type="button"
                  ref={isWhiteActive ? activeMoveButtonRef : null}
                  onClick={() => onGoTo(row.whiteIdx)}
                  className={`flex items-center justify-between rounded-xs px-2 py-1 text-left font-medium transition-colors cursor-pointer ${
                    isWhiteActive
                      ? "bg-vault-surface-layer-2 text-vault-bronze border-b border-vault-bronze font-bold"
                      : "text-vault-text-primary hover:text-vault-bronze"
                  }`}
                >
                  <span>{row.white}</span>
                </button>

                {/* Black Move */}
                {row.black ? (
                  <button
                    type="button"
                    ref={isBlackActive ? activeMoveButtonRef : null}
                    onClick={() => onGoTo(row.blackIdx!)}
                    className={`flex items-center justify-between rounded-xs px-2 py-1 text-left font-medium transition-colors cursor-pointer ${
                      isBlackActive
                        ? "bg-vault-surface-layer-2 text-vault-bronze border-b border-vault-bronze font-bold"
                        : "text-vault-text-secondary hover:text-vault-text-primary"
                    }`}
                  >
                    <span>{row.black}</span>
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
