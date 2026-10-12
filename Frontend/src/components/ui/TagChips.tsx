type TagChipsProps = {
  tags?: string[] | null;
  className?: string;
  chipClassName?: string;
};

export function TagChips({ tags, className = "flex flex-wrap items-center gap-1.5", chipClassName }: TagChipsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={className}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={
            chipClassName ??
            "rounded-xs border border-vault-border-interactive bg-vault-surface-layer-2 px-2 py-0.5 font-mono text-[10px] text-vault-text-secondary uppercase tracking-wider"
          }
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
