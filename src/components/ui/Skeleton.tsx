interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 bg-card rounded-xl border border-border space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-40 h-5" />
        <Skeleton className="w-32 h-4" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="space-y-1">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="w-20 h-5" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="w-16 h-3 ml-auto" />
          <Skeleton className="w-12 h-5 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="w-40 h-8" />
            <Skeleton className="w-64 h-4" />
          </div>
          <Skeleton className="w-36 h-12 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-card rounded-lg border border-border space-y-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-16 h-8" />
            </div>
          ))}
        </div>
        <div className="flex gap-4 mb-6">
          <Skeleton className="w-48 h-12 rounded-lg" />
          <Skeleton className="w-48 h-12 rounded-lg" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="w-24 h-5" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-card rounded-xl border border-border space-y-4">
              <Skeleton className="w-48 h-7" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-card rounded-xl border border-border space-y-4">
              <Skeleton className="w-32 h-6" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="w-24 h-3" />
                  <Skeleton className="w-full h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="bg-background">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-56 h-8" />
          <Skeleton className="w-72 h-4" />
        </div>
        <div className="p-6 bg-card rounded-xl border border-border space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-full h-10 rounded-lg" />
            </div>
          ))}
          <div className="flex gap-4 pt-4">
            <Skeleton className="w-32 h-10 rounded-lg" />
            <Skeleton className="w-24 h-10 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="w-40 h-8" />
          <Skeleton className="w-56 h-4" />
        </div>
        <div className="grid gap-8">
          <div className="p-6 bg-card rounded-xl border border-border space-y-6">
            <Skeleton className="w-36 h-6" />
            <div className="grid gap-6 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-full h-10 rounded-lg" />
                </div>
              ))}
            </div>
            <Skeleton className="w-32 h-10 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
