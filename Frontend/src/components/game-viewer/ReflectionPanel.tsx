import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useUpdateGame } from "../../hooks/useGames";
import type { Game } from "@chess-vault/shared";

const NOTES_MAX_LENGTH = 1000;
const TAGS_MAX_COUNT = 20;
const TAG_MAX_LENGTH = 50;
const DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "saving" | "saved" | "error";

type ReflectionPanelProps = {
  game: Game;
  userName: string;
};

export function ReflectionPanel({ game, userName }: ReflectionPanelProps) {
  const [notesText, setNotesText] = useState(game.notes ?? "");
  const [tags, setTags] = useState<string[]>(game.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const updateGame = useUpdateGame();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state if the game record changes externally (e.g. on navigation)
  useEffect(() => {
    setNotesText(game.notes ?? "");
    setTags(game.tags ?? []);
  }, [game.id, game.notes, game.tags]);

  const save = useCallback(
    (nextNotes: string, nextTags: string[]) => {
      setSaveStatus("saving");
      updateGame.mutate(
        { id: game.id, data: { notes: nextNotes, tags: nextTags } },
        {
          onSuccess: () => setSaveStatus("saved"),
          onError: () => setSaveStatus("error"),
        },
      );
    },
    [game.id, updateGame],
  );

  const scheduleSave = useCallback(
    (nextNotes: string, nextTags: string[]) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("idle");
      debounceRef.current = setTimeout(() => {
        save(nextNotes, nextTags);
      }, DEBOUNCE_MS);
    },
    [save],
  );

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotesText(value);
    scheduleSave(value, tags);
  };

  const addTag = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    if (trimmed.length > TAG_MAX_LENGTH) return;
    if (tags.length >= TAGS_MAX_COUNT) return;
    if (tags.includes(trimmed)) return;

    const nextTags = [...tags, trimmed];
    setTags(nextTags);
    setTagInput("");
    scheduleSave(notesText, nextTags);
  };

  const removeTag = (tag: string) => {
    const nextTags = tags.filter((t) => t !== tag);
    setTags(nextTags);
    scheduleSave(notesText, nextTags);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const saveStatusLabel: Record<SaveStatus, string | null> = {
    idle: null,
    saving: "Saving…",
    saved: "Saved",
    error: "Failed to save",
  };

  const saveStatusColor: Record<SaveStatus, string> = {
    idle: "",
    saving: "text-vault-text-muted",
    saved: "text-vault-win",
    error: "text-vault-loss",
  };

  return (
    <div className="rounded-vault border border-vault-border-base bg-vault-surface-layer-1 p-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-vault-border-base pb-3">
        <span className="font-semibold text-vault-text-primary">
          Player Reflection &amp; Memory Log
        </span>
        {saveStatusLabel[saveStatus] && (
          <span className={`inline-flex items-center gap-1 text-[10px] ${saveStatusColor[saveStatus]}`}>
            {saveStatus === "saved" && (
              <span className="h-1.5 w-1.5 rounded-full bg-vault-win" />
            )}
            {saveStatus === "saving" && (
              <span className="h-1.5 w-1.5 rounded-full bg-vault-text-muted animate-pulse" />
            )}
            {saveStatusLabel[saveStatus]?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Notes */}
      <textarea
        value={notesText}
        onChange={handleNotesChange}
        placeholder="Record notes, post-mortem discoveries, or personal analysis…"
        maxLength={NOTES_MAX_LENGTH}
        className="mt-4 w-full rounded-vault border border-vault-border-base bg-vault-surface-layer-2 p-3 text-xs leading-relaxed text-vault-text-primary outline-none focus:border-vault-bronze font-sans min-h-[100px] resize-y"
      />
      <div className="mt-1 flex items-center justify-between text-[11px] text-vault-text-muted">
        <span>Authored by: {userName}</span>
        <span
          className={
            notesText.length > NOTES_MAX_LENGTH * 0.9
              ? "text-vault-loss"
              : undefined
          }
        >
          {notesText.length} / {NOTES_MAX_LENGTH}
        </span>
      </div>

      {/* Tags */}
      <div className="mt-5 border-t border-vault-border-base pt-4">
        <span className="text-vault-text-muted uppercase text-[9px] block mb-2">Tags</span>

        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 text-[11px] text-vault-text-secondary"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-vault-text-muted hover:text-vault-loss transition-colors cursor-pointer"
                aria-label={`Remove tag ${tag}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {tags.length < TAGS_MAX_COUNT && (
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => addTag(tagInput)}
              placeholder={tags.length === 0 ? "Add a tag…" : "+"}
              maxLength={TAG_MAX_LENGTH}
              className="min-w-[80px] max-w-[140px] bg-transparent text-[11px] text-vault-text-primary placeholder:text-vault-text-muted/50 outline-none border-b border-vault-border-base focus:border-vault-bronze transition-colors"
            />
          )}
        </div>

        <p className="mt-1.5 text-[10px] text-vault-text-muted">
          Press Enter or comma to add · {TAGS_MAX_COUNT - tags.length} remaining
        </p>
      </div>
    </div>
  );
}
