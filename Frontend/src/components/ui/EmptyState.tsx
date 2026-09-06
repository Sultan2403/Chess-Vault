export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-vault border border-vault-outline-variant/60 bg-white/80 p-8 text-center">
      <h3 className="font-display text-lg font-bold text-vault-primary">{title}</h3>
      {description && <p className="mt-2 text-sm text-vault-text-secondary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
