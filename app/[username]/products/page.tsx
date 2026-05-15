import { notFound } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Breadcrumb } from "@/components/layout/Breadcrumb"

interface PromoterProductsPageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function PromoterProductsPage({
  params,
  searchParams,
}: PromoterProductsPageProps) {
  const { username } = await params
  const { q } = await searchParams

  // Fetch promoter
  const { data: promoter } = await supabaseAdmin
    .from("promoters")
    .select("id, username, display_name, is_active")
    .eq("username", username)
    .single()

  if (!promoter || !promoter.is_active) {
    notFound()
  }

  // Fetch promoter's products
  let query = supabaseAdmin
    .from("promoter_products")
    .select("*, products(*)")
    .eq("promoter_id", promoter.id)
    .eq("status", "active")
    .order("display_order", { ascending: true })

  if (q) {
    query = query.ilike("products.title", `%${q}%`)
  }

  const { data: promoterProducts } = await query

  const products =
    promoterProducts
      ?.map((pp) => pp.products)
      .filter(Boolean) ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: promoter.display_name || promoter.username, href: `/${username}` },
          { label: "Products" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {promoter.display_name || promoter.username}&apos;s Products
        </h1>
        {q && (
          <p className="mt-1 text-sm text-zinc-500">
            Search results for &quot;{q}&quot;
          </p>
        )}
      </div>

      <ProductGrid
        products={products.map((p: any) => ({
          ...p,
          brand_name: p.brand ?? undefined,
        }))}
        emptyMessage={
          q
            ? `No products found for "${q}".`
            : "No products curated yet."
        }
      />
    </div>
  )
}
