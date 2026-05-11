import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Title */}
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-8 h-4 w-32" />

      <div className="flex gap-8">
        {/* Sidebar skeleton (desktop) */}
        <div className="hidden w-56 shrink-0 lg:block">
          <div className="space-y-6">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-6 w-20" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
            <Skeleton className="h-6 w-16" />
            <div className="flex flex-wrap gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-44" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-zinc-100">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3">
                  <Skeleton className="mb-1 h-3 w-16" />
                  <Skeleton className="mb-1.5 h-4 w-full" />
                  <Skeleton className="mb-1 h-3.5 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <Skeleton className="h-8 w-20" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
