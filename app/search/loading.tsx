import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span className="text-zinc-300">/</span>
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>

      {/* Sort controls skeleton */}
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
