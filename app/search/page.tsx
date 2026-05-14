import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Pagination } from "@/components/product/Pagination"

const PER_PAGE = 24
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"
const USD_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "USD_RATE")

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    sort?: string
    page?: string
  }>
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const q = params.q || ""
  const title = q
    ? `"${q}" — Search Results | Finds Engine`
    : "Search Products | Finds Engine"
  const description = q
    ? `Search results for "${q}" on Finds Engine. Discover products from 380+ brands.`
    : "Search across 150,000+ products from Chinese agent platforms."
  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${SITE_URL}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = (params.q || "").trim()
  const sort = params.sort || "popular"
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const offset = (page - 1) * PER_PAGE

  // ── Build search query (search across multiple fields) ──────────────
  let query = supabaseAdmin
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)

  if (q) {
    // Search across title, description, category, and brand fields
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%,brand.ilike.%${q}%`
    )
  }

  // Get total count (before pagination)
  const { count: totalCount } = await query

  // Fetch paginated results
  const { data: productsData, error } = await query
    .range(offset, offset + PER_PAGE - 1)

  if (error) {
    console.error("Search error:", error.message)
  }

  const products = productsData ?? []

  // ── Sort results ───────────────────────────────────────────────────
  const sortedProducts = [...products].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
      case "price_asc":
        return (a.price_usd ?? a.price_cny / USD_RATE) - (b.price_usd ?? b.price_cny / USD_RATE)
      case "price_desc":
        return (b.price_usd ?? b.price_cny / USD_RATE) - (a.price_usd ?? a.price_cny / USD_RATE)
      case "popular":
      default:
        return (b.click_count ?? 0) - (a.click_count ?? 0)
    }
  })

  const totalPages = Math.ceil((totalCount ?? 0) / PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Search" },
        ]}
      />

      {/* JSON-LD Breadcrumb */}
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Search", url: `${SITE_URL}/search` },
        ]}
      />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {q ? `Search results for "${q}"` : "Search Products"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {totalCount ?? 0} product{(totalCount ?? 0) !== 1 ? "s" : ""} found
          {q && ` for "${q}"`}
        </p>
      </div>

      {/* Sort controls */}
      {products.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <span>Sort by:</span>
            {[
              { value: "popular", label: "Popular" },
              { value: "newest", label: "Newest" },
              { value: "price_asc", label: "Price ↑" },
              { value: "price_desc", label: "Price ↓" },
            ].map((option) => (
              <a
                key={option.value}
                href={`/search?q=${encodeURIComponent(q)}&sort=${option.value}`}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  sort === option.value
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Product grid */}
      <ProductGrid
        products={sortedProducts.map((p) => ({
          ...p,
          brand_name: p.brand ?? undefined,
        }))}
        emptyMessage={
          q
            ? `No products found for "${q}". Try different keywords or browse all products.`
            : "Enter a search term to find products."
        }
      />

      {/* Empty state CTA */}
      {products.length === 0 && q && (
        <div className="mt-8 text-center">
          <a
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Browse All Products
          </a>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/search"
            searchParams={{ ...params, q: q || undefined }}
          />
        </div>
      )}
    </div>
  )
}
