type KeyboardShortcutsPanelProps = {
  onClose: () => void;
};

export function KeyboardShortcutsPanel({ onClose }: KeyboardShortcutsPanelProps) {
  return (
    <div className="mb-6 rounded-vault border border-vault-border-interactive bg-vault-surface-layer-2 p-4 text-xs font-mono">
      <div className="flex items-center justify-between border-b border-vault-border-base pb-2">
        <span className="font-bold text-vault-text-primary">Keyboard Navigation</span>
        <button
          type="button"
          onClick={onClose}
          className="text-vault-text-muted hover:text-vault-text-primary cursor-pointer"
        >
          Close
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-vault-text-secondary">
        <div>
          <kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">
            ← / H
          </kbd>{" "}
          Prev Move
        </div>
        <div>
          <kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">
            → / L
          </kbd>{" "}
          Next Move
        </div>
        <div>
          <kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">
            Space
          </kbd>{" "}
          Play / Pause
        </div>
        <div>
          <kbd className="rounded border bg-vault-surface-layer-1 px-1.5 py-0.5 text-vault-text-primary">
            F
          </kbd>{" "}
          Flip Board
        </div>
      </div>
    </div>
  );
}
