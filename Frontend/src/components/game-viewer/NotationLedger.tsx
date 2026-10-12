import { useEffect, useRef } from "react";
import type { MovePair } from "../../hooks/useParsedGame";

type NotationLedgerProps = {
  parsedMoves: MovePair[];
  currentMoveIdx: number;
  onGoTo: (idx: number) => void;
};

export function NotationLedger({
  parsedMoves,
  currentMoveIdx,
  onGoTo,
}: NotationLedgerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const button = activeButtonRef.current;
    if (!container || !button) return;

    // Calculate position relative to container ONLY (does NOT scroll the window or viewport)
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const buttonTop = button.offsetTop - container.offsetTop;
    const buttonBottom = buttonTop + button.offsetHeight;

    if (buttonTop < containerTop) {
      container.scrollTo({ top: buttonTop, behavior: "smooth" });
    } else if (buttonBottom > containerBottom) {
      container.scrollTo({ top: buttonBottom - container.clientHeight, behavior: "smooth" });
    }
  }, [currentMoveIdx]);
  // Horizontal ribbon scroll for mobile
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);
  const activeMobileButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const container = mobileContainerRef.current;
    const button = activeMobileButtonRef.current;
    if (!container || !button) return;

    const containerLeft = container.scrollLeft;
    const containerRight = containerLeft + container.clientWidth;
    const buttonLeft = button.offsetLeft - container.offsetLeft;
    const buttonRight = buttonLeft + button.offsetWidth;

    if (buttonLeft < containerLeft) {
      container.scrollTo({ left: buttonLeft - 16, behavior: "smooth" });
    } else if (buttonRight > containerRight) {
      container.scrollTo({ left: buttonRight - container.clientWidth + 16, behavior: "smooth" });
    }
  }, [currentMoveIdx]);

  return (
    <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-4 md:p-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
        <span className="font-semibold text-vault-text-primary">Transcribed Notation</span>
        <span className="text-[11px] text-vault-text-muted md:hidden">Swipe moves &rarr;</span>
      </div>

      {/* Mobile Horizontal Ribbon View */}
      <div
        ref={mobileContainerRef}
        className="mt-3 flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {parsedMoves.length === 0 ? (
          <p className="py-2 text-vault-text-muted italic">No notation recorded.</p>
        ) : (
          parsedMoves.map((row) => {
            const isWhiteActive = currentMoveIdx === row.whiteIdx;
            const isBlackActive = currentMoveIdx === row.blackIdx;

            return (
              <div key={row.number} className="flex items-center gap-1 shrink-0 rounded-xs bg-vault-surface-layer-2/40 px-1.5 py-1">
                <span className="text-vault-text-muted text-[10px]">{row.number}.</span>
                <button
                  type="button"
                  ref={isWhiteActive ? activeMobileButtonRef : null}
                  onClick={() => onGoTo(row.whiteIdx)}
                  className={`rounded-xs px-1.5 py-0.5 font-medium transition-colors cursor-pointer ${
                    isWhiteActive
                      ? "bg-vault-bronze text-vault-surface font-bold"
                      : "text-vault-text-primary hover:text-vault-bronze"
                  }`}
                >
                  {row.white}
                </button>
                {row.black && (
                  <button
                    type="button"
                    ref={isBlackActive ? activeMobileButtonRef : null}
                    onClick={() => onGoTo(row.blackIdx!)}
                    className={`rounded-xs px-1.5 py-0.5 font-medium transition-colors cursor-pointer ${
                      isBlackActive
                        ? "bg-vault-bronze text-vault-surface font-bold"
                        : "text-vault-text-secondary hover:text-vault-text-primary"
                    }`}
                  >
                    {row.black}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Vertical Ledger View */}
      <div ref={containerRef} className="mt-4 hidden md:block max-h-60 overflow-y-auto space-y-1 pr-1">
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
                  ref={isWhiteActive ? activeButtonRef : null}
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
                    ref={isBlackActive ? activeButtonRef : null}
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
