import type { Game, Folder } from "@chess-vault/shared";
import { getGameDate, parseOpeningDetails, formatTimeControl } from "../../utils/game";

const MAX_VISIBLE_FOLDERS = 3;

type MatchFilePanelProps = {
  game: Game;
  matchedFolders?: Folder[];
};

function capitalizeTermination(termination: Game["termination"]): string {
  return termination ? termination
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") : "N/A";
}

export function MatchFilePanel({ game, matchedFolders }: MatchFilePanelProps) {
  const { eco, opening, variation } = parseOpeningDetails(game);
  const subtitle = [opening, variation].filter(Boolean).join(": ");
  const collectionCount = game.folderIds?.length ?? 0;

  const resultLabel =
    game.result === "draw" ? "½ - ½" : game.result === "white" ? "1 - 0" : "0 - 1";

  const resultColorClass =
    game.result === "draw"
      ? "text-vault-text-secondary border-vault-border-interactive"
      : "text-vault-win border-vault-win/20";

  const visibleFolders = matchedFolders?.slice(0, MAX_VISIBLE_FOLDERS) ?? [];
  const overflowCount = (matchedFolders?.length ?? 0) - visibleFolders.length;

  return (
    <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
        <span className="text-[10px] uppercase tracking-widest text-vault-text-muted">
          Archival Match File
        </span>
        <span
          className={`rounded-xs px-2 py-0.5 font-bold border bg-vault-win/15 ${resultColorClass}`}
        >
          {resultLabel}
        </span>
      </div>

      <div className="mt-4">
        <h1 className="font-display text-2xl font-bold text-vault-text-primary">
          {game.title ?? `${game.whitePlayer.username} vs ${game.blackPlayer.username}`}
        </h1>
        {subtitle && (
          <p className="mt-1 font-mono text-xs text-vault-text-muted">{subtitle}</p>
        )}
      </div>

      {/* Metadata Grid */}
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-vault-border-base pt-4 text-[11px]">
        <div>
          <span className="text-vault-text-muted uppercase text-[9px] block">ECO Code</span>
          <span className="text-vault-text-primary font-semibold">
            {eco ?? "—"} {opening ? `• ${opening}` : ""}
          </span>
        </div>
        <div>
          <span className="text-vault-text-muted uppercase text-[9px] block">Time Format</span>
          <span className="text-vault-text-primary font-semibold">
            {formatTimeControl(game.time)}
          </span>
        </div>
        <div>
          <span className="text-vault-text-muted uppercase text-[9px] block">Date Recorded</span>
          <span className="text-vault-text-primary font-semibold">
            {getGameDate(game, "MMMM dd, yyyy")}
          </span>
        </div>
        <div>
          <span className="text-vault-text-muted uppercase text-[9px] block">Termination</span>
          <span className="text-vault-text-primary font-semibold">
            {capitalizeTermination(game.termination)}
          </span>
        </div>
      </div>

      {/* Collections */}
      <div className="mt-5 border-t border-vault-border-base pt-4">
        <span className="text-vault-text-muted text-[10px] uppercase block mb-2">Collections</span>
        {matchedFolders && matchedFolders.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleFolders.map((folder) => (
              <span
                key={folder.id}
                className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 text-vault-text-secondary text-[11px] truncate max-w-[160px]"
                title={folder.name}
              >
                {folder.name}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="rounded-xs border border-vault-border-base bg-vault-surface-layer-1 px-2 py-0.5 text-vault-text-muted text-[11px]">
                +{overflowCount} more
              </span>
            )}
          </div>
        ) : matchedFolders ? (
          // matchedFolders loaded but empty — game is not in any collection
          <span className="text-vault-text-muted text-[11px] italic">Not in any collection</span>
        ) : collectionCount > 0 ? (
          // folders still loading — fall back to count so there's no empty flash
          <span className="rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 text-vault-text-secondary text-[11px]">
            In {collectionCount} collection{collectionCount !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-vault-text-muted text-[11px] italic">Not in any collection</span>
        )}
      </div>
    </div>
  );
}
