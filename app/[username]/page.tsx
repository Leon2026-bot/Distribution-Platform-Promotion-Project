import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product/ProductCard"
import { PromoterProductsGrid } from "@/components/product/PromoterProductsGrid"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface PromoterPageProps {
  params: Promise<{ username: string }>
}

export default async function PromoterPage({ params }: PromoterPageProps) {
  const { username } = await params

  // ── Fetch promoter info ───────────────────────────────────────────
  const { data: promoter } = await supabaseAdmin
    .from("promoters")
    .select("id, username, display_name, bio, is_active, created_at, avatar_url, social_links")
    .eq("username", username)
    .single()

  if (!promoter || !promoter.is_active) {
    notFound()
  }

  // ── Parallel data fetching ────────────────────────────────────────
  const [
    { data: promoterProducts },
    { data: channels },
    { data: platforms },
    { count: totalClicks },
  ] = await Promise.all([
    // Promoter's selected products
    supabaseAdmin
      .from("promoter_products")
      .select("*, products(*)")
      .eq("promoter_id", promoter.id)
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .limit(12),

    // Promoter's configured channels
    supabaseAdmin
      .from("promoter_channels")
      .select("platform_id, member_id")
      .eq("promoter_id", promoter.id)
      .eq("is_active", true),

    // Active platforms for reference
    supabaseAdmin
      .from("agent_platforms")
      .select("id, name, slug, logo_url, website_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),

    // Total clicks for this promoter
    supabaseAdmin
      .from("click_events")
      .select("id", { count: "exact", head: true })
      .eq("promoter_id", promoter.id),
  ])

  // Build platform lookup
  const platformMap = new Map(platforms?.map((p) => [p.id, p]) ?? [])
  const activePlatforms =
    channels
      ?.filter((c): c is typeof c & { platform_id: string } => !!c.platform_id)
      ?.map((c) => platformMap.get(c.platform_id))
      .filter((p): p is NonNullable<typeof p> => !!p) ?? []

  // Extract products from promoter_products join
  const products =
    promoterProducts
      ?.map((pp) => pp.products)
      .filter((p): p is NonNullable<typeof p> => p !== null) ?? []

  return (
    <>
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: promoter.display_name || promoter.username, url: `/${username}` },
        ]}
      />

      <div className="flex flex-col">
        {/* Promoter Hero */}
        <section className="bg-gradient-to-b from-zinc-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            {/* Avatar */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-4 ring-white shadow-lg">
              {promoter.avatar_url ? (
                <img
                  src={promoter.avatar_url.startsWith("http") ? promoter.avatar_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${promoter.avatar_url}`}
                  alt={promoter.display_name || promoter.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-zinc-400">
                  {(promoter.display_name || promoter.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              {promoter.display_name || promoter.username}&apos;s Shop
            </h1>
            {promoter.bio && (
              <p className="mx-auto mt-3 max-w-xl text-base text-zinc-500">
                {promoter.bio}
              </p>
            )}

            {/* Search Bar */}
            <form
              action={`/${username}/products`}
              className="mx-auto mt-6 flex max-w-lg items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Search products..."
                  className="h-11 pl-9 text-sm"
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>

            {/* Social Proof Stats */}
            <div className="mx-auto mt-5 flex items-center justify-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-900">{products.length}</p>
                <p className="text-xs text-zinc-400">Products</p>
              </div>
              <div className="h-6 w-px bg-zinc-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-900">{totalClicks ?? 0}</p>
                <p className="text-xs text-zinc-400">Clicks</p>
              </div>
              <div className="h-6 w-px bg-zinc-200" />
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-900">
                  {promoter.created_at
                    ? new Date(promoter.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—"}
                </p>
                <p className="text-xs text-zinc-400">Joined</p>
              </div>
            </div>

            {/* Social Links */}
            {(promoter.social_links as Record<string, string>) && Object.keys(promoter.social_links as Record<string, string> || {}).length > 0 && (
              <div className="mx-auto mt-4 flex items-center justify-center gap-3">
                {Object.entries(promoter.social_links as Record<string, string>).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
                  >
                    <ExternalLink className="size-3" />
                    {platform}
                  </a>
                ))}
              </div>
            )}

            {/* Active Agents */}
            {activePlatforms.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-zinc-400">Available via:</span>
                {activePlatforms.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600"
                  >
                    {p.logo_url ? (
                      <img
                        src={
                          p.logo_url.startsWith("http")
                            ? p.logo_url
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${p.logo_url}`
                        }
                        alt={p.name}
                        className="h-3 w-auto object-contain"
                      />
                    ) : null}
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Products Grid */}
        {products.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Curated Products
              </h2>
            </div>
            <PromoterProductsGrid
              products={products}
              username={username}
            />
          </section>
        ) : (
          <section className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-zinc-400">
              No products curated yet. Check back soon!
            </p>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-zinc-900 px-6 py-10 text-center text-white sm:px-12">
            <h2 className="text-xl font-bold sm:text-2xl">
              Want to start your own shop?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Join Finds Engine as a promoter and earn commissions on every sale.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
                >
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
