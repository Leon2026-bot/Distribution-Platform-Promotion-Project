import { Database } from "@/types/supabase"
import { ProductCard } from "./ProductCard"

type Product = Database["public"]["Tables"]["products"]["Row"]

interface ProductGridProps {
  products: (Product & { brand_name?: string; platform_count?: number })[]
  emptyMessage?: string
  sort?: string
}

export function ProductGrid({ products, emptyMessage = "No products found.", sort }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-zinc-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} sort={sort} />
      ))}
    </div>
  )
}
