export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse" aria-busy="true" aria-label="Loading analytics">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col gap-4 rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-vault-surface-layer-2 rounded" />
            <div className="h-8 w-64 bg-vault-surface-layer-2 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-vault-surface-layer-2 rounded" />
            <div className="h-9 w-24 bg-vault-surface-layer-2 rounded" />
            <div className="h-9 w-24 bg-vault-surface-layer-2 rounded" />
          </div>
        </div>
        <div className="h-4 w-48 bg-vault-surface-layer-2/60 rounded" />
      </div>

      {/* 2. KPI Cards Skeleton (4-grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-vault-surface-layer-2 rounded" />
              <div className="h-6 w-6 bg-vault-surface-layer-2 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-vault-surface-layer-2 rounded" />
              <div className="h-3 w-36 bg-vault-surface-layer-2/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Activity Chart Skeleton */}
      <div className="h-80 rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-vault-surface-layer-2 rounded" />
          <div className="h-6 w-48 bg-vault-surface-layer-2 rounded" />
        </div>
        <div className="h-48 w-full bg-vault-surface-container-lowest/60 rounded" />
      </div>

      {/* 4. Color & Cadence 2-column Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 space-y-4"
          >
            <div className="h-4 w-32 bg-vault-surface-layer-2 rounded" />
            <div className="h-6 w-44 bg-vault-surface-layer-2 rounded" />
            <div className="space-y-3 pt-2">
              <div className="h-10 w-full bg-vault-surface-container-lowest/60 rounded" />
              <div className="h-10 w-full bg-vault-surface-container-lowest/60 rounded" />
              <div className="h-10 w-full bg-vault-surface-container-lowest/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 5. Opening Repertoire Skeleton */}
      <div className="h-72 rounded-lg border border-vault-border-base bg-vault-surface-layer-1 p-6 space-y-4">
        <div className="h-4 w-36 bg-vault-surface-layer-2 rounded" />
        <div className="h-6 w-52 bg-vault-surface-layer-2 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="h-40 bg-vault-surface-container-lowest/60 rounded" />
          <div className="h-40 bg-vault-surface-container-lowest/60 rounded" />
        </div>
      </div>
    </div>
  );
}
