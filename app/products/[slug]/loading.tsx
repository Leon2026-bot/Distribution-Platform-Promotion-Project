import { Skeleton } from "@/components/ui/skeleton"

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
        {/* Left: Image gallery */}
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="size-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-px w-full" />
          {/* Where to Buy */}
          <Skeleton className="h-5 w-28" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <div className="flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Below columns */}
      <div className="mt-12 space-y-8">
        <div>
          <Skeleton className="mb-3 h-6 w-36" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-4/5" />
        </div>

        <div>
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-zinc-100">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3">
                  <Skeleton className="mb-1.5 h-4 w-full" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
