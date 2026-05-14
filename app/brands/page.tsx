import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

export const metadata: Metadata = {
  title: "All Brands – Top Chinese Brands on Finds Engine",
  description:
    "Browse 380+ brands available on Finds Engine. Find authentic products from top streetwear, luxury, and lifestyle brands sourced directly from China.",
  alternates: { canonical: `${SITE_URL}/brands` },
}

export default async function BrandsPage() {
  const [{ data: brands }, { data: allBrands }] = await Promise.all([
    // Featured brands with logos first
    supabaseAdmin
      .from("brands")
      .select("id, name, slug, logo_url, product_count")
      .eq("status", "active")
      .not("logo_url", "is", null)
      .order("product_count", { ascending: false })
      .limit(60),

    // All brands for alphabet listing
    supabaseAdmin
      .from("brands")
      .select("id, name, slug, product_count")
      .eq("status", "active")
      .order("name", { ascending: true }),
  ])

  const featuredBrands = brands ?? []
  const allBrandsList = allBrands ?? []

  // Group all brands alphabetically
  const brandsByLetter: Record<string, typeof allBrandsList> = {}
  allBrandsList.forEach((brand) => {
    const letter = brand.name.charAt(0).toUpperCase()
    if (!brandsByLetter[letter]) brandsByLetter[letter] = []
    brandsByLetter[letter].push(brand)
  })
  const letters = Object.keys(brandsByLetter).sort()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Brands", url: `${SITE_URL}/brands` },
        ]}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Brands" },
        ]}
      />

      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Browse by Brand</h1>
        <p className="mt-2 text-base text-zinc-500">
          {allBrandsList.length > 0
            ? `${allBrandsList.length}+ brands`
            : "Hundreds of brands"}{" "}
          available on Finds Engine. Click a brand to see all their products.
        </p>
      </div>

      {/* Featured brands grid (with logos) */}
      {featuredBrands.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Popular Brands
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {featuredBrands.map((brand) => {
              const logoUrl = brand.logo_url
                ? brand.logo_url.startsWith("http")
                  ? brand.logo_url
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${brand.logo_url}`
                : null

              return (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  title={brand.name}
                  className="group flex flex-col items-center rounded-xl border border-zinc-100 bg-white p-3 text-center shadow-sm transition-all hover:border-zinc-200 hover:shadow-md"
                >
                  {logoUrl ? (
                    <div className="relative mb-2 h-10 w-full">
                      <Image
                        src={logoUrl}
                        alt={brand.name}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="mb-2 flex h-10 w-full items-center justify-center text-base font-bold text-zinc-400">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                  <span className="line-clamp-1 text-xs font-medium text-zinc-700 group-hover:text-zinc-900">
                    {brand.name}
                  </span>
                  {brand.product_count != null && brand.product_count > 0 && (
                    <span className="mt-0.5 text-[10px] text-zinc-400">
                      {brand.product_count}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* All brands — alphabetical */}
      {letters.length > 0 && (
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            All Brands A–Z
          </h2>

          {/* Alphabet nav */}
          <div className="mb-6 flex flex-wrap gap-1">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
              >
                {letter}
              </a>
            ))}
          </div>

          {/* Brand list by letter */}
          <div className="space-y-8">
            {letters.map((letter) => (
              <div key={letter} id={`letter-${letter}`}>
                <h3 className="mb-3 text-lg font-bold text-zinc-800">{letter}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {brandsByLetter[letter].map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brand/${brand.slug}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm transition-colors hover:border-zinc-200 hover:bg-zinc-50"
                    >
                      <span className="font-medium text-zinc-800">{brand.name}</span>
                      {brand.product_count != null && brand.product_count > 0 && (
                        <span className="ml-2 shrink-0 text-xs text-zinc-400">
                          {brand.product_count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {allBrandsList.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center">
          <p className="text-zinc-400">Brands coming soon.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-sm text-zinc-600 underline underline-offset-2"
          >
            Browse all products →
          </Link>
        </div>
      )}
    </div>
  )
}
