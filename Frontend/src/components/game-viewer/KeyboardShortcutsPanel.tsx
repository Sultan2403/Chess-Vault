import { Modal } from "../ui/Modal";

type KeyboardShortcutsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ShortcutItem = {
  keys: string[];
  description: string;
};

const navigationShortcuts: ShortcutItem[] = [
  { keys: ["←", "H"], description: "Previous move" },
  { keys: ["→", "L"], description: "Next move" },
  { keys: ["↑", "Home"], description: "First move (start)" },
  { keys: ["↓", "End"], description: "Last move (end)" },
];

const playbackShortcuts: ShortcutItem[] = [
  { keys: ["Space"], description: "Play / Pause autoplay" },
  { keys: ["F"], description: "Flip board perspective" },
];

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Navigation"
      description="Viewer Hotkeys & Quick Controls"
      maxWidth="md"
      blurScreen={true}
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Navigation Group */}
        <div>
          <span className="text-[10px] uppercase tracking-wider text-vault-text-muted font-semibold block mb-2">
            Move Navigation
          </span>
          <div className="space-y-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-2/60 p-3">
            {navigationShortcuts.map((item) => (
              <div key={item.description} className="flex items-center justify-between">
                <span className="text-vault-text-secondary">{item.description}</span>
                <div className="flex items-center gap-1.5">
                  {item.keys.map((k, i) => (
                    <span key={k} className="flex items-center gap-1">
                      {i > 0 && <span className="text-[10px] text-vault-text-muted">or</span>}
                      <kbd className="inline-block min-w-[24px] text-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-1 px-1.5 py-0.5 font-bold text-vault-text-primary shadow-xs">
                        {k}
                      </kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playback & Board Group */}
        <div>
          <span className="text-[10px] uppercase tracking-wider text-vault-text-muted font-semibold block mb-2">
            Playback &amp; Board
          </span>
          <div className="space-y-2 rounded-vault border border-vault-border-base bg-vault-surface-layer-2/60 p-3">
            {playbackShortcuts.map((item) => (
              <div key={item.description} className="flex items-center justify-between">
                <span className="text-vault-text-secondary">{item.description}</span>
                <div className="flex items-center gap-1.5">
                  {item.keys.map((k) => (
                    <kbd
                      key={k}
                      className="inline-block min-w-[24px] text-center rounded-xs border border-vault-border-interactive bg-vault-surface-layer-1 px-1.5 py-0.5 font-bold text-vault-text-primary shadow-xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
