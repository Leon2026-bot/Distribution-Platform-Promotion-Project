import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

export const metadata: Metadata = {
  title: "All Categories – Shop from China by Category | Finds Engine",
  description:
    "Browse all product categories available on Finds Engine. From sneakers to electronics, find what you're looking for from top Chinese brands.",
  alternates: { canonical: `${SITE_URL}/categories` },
}

// Emoji map for common categories
const CATEGORY_EMOJIS: Record<string, string> = {
  sneakers: "👟",
  shoes: "👟",
  clothing: "👕",
  apparel: "👕",
  bags: "👜",
  accessories: "⌚",
  electronics: "📱",
  watches: "⌚",
  hats: "🧢",
  caps: "🧢",
  jackets: "🧥",
  hoodies: "👕",
  pants: "👖",
  denim: "👖",
  jewelry: "💍",
  sunglasses: "🕶️",
}

function getCategoryEmoji(name: string): string {
  const key = name.toLowerCase()
  for (const [k, emoji] of Object.entries(CATEGORY_EMOJIS)) {
    if (key.includes(k)) return emoji
  }
  return "🛍️"
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, product_count, parent_id")
    .eq("status", "active")
    .is("parent_id", null)
    .order("sort_order", { ascending: true })

  const items = categories ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Categories", url: `${SITE_URL}/categories` },
        ]}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories" },
        ]}
      />

      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Browse by Category</h1>
        <p className="mt-2 text-base text-zinc-500">
          Explore {items.length > 0 ? items.length : "all"} product categories. Click a category to
          see products, compare prices, and find the best deals from China.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center">
          <p className="text-zinc-400">Categories coming soon.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm text-zinc-600 underline underline-offset-2"
          >
            Browse all products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-zinc-100 bg-white p-6 text-center shadow-sm transition-all hover:border-zinc-200 hover:shadow-md"
            >
              {/* Emoji icon */}
              <span className="mb-3 text-4xl">
                {getCategoryEmoji(category.name)}
              </span>

              {/* Category name */}
              <h2 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700">
                {category.name}
              </h2>

              {/* Product count */}
              {category.product_count != null && category.product_count > 0 && (
                <p className="mt-1 text-xs text-zinc-400">
                  {category.product_count.toLocaleString()} products
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* CTA section */}
      <div className="mt-12 rounded-2xl bg-zinc-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-zinc-900">Can&apos;t find what you&apos;re looking for?</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Browse all products or search by keyword.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Browse All Products
          </Link>
          <Link
            href="/brands"
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Browse by Brand
          </Link>
        </div>
      </div>
    </div>
  )
}
