import { Skeleton } from "@/components/ui/skeleton"

export default function BrandLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Brand header skeleton */}
      <div className="mb-8 flex items-start gap-5">
        <Skeleton className="size-16 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
      </div>

      {/* Categories skeleton */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Sort controls skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-md" />
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
