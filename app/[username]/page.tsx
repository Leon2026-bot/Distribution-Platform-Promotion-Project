import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Search, ExternalLink, ShoppingBag, MousePointerClick, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product/ProductCard"
import { PromoterProductsGrid } from "@/components/product/PromoterProductsGrid"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ShareLinkBanner } from "@/components/promoter/ShareLinkBanner"

interface PromoterPageProps {
  params: Promise<{ username: string }>
}

export default async function PromoterPage({ params }: PromoterPageProps) {
  const { username } = await params

  // ── Fetch current logged-in user (for showing share banner) ───────
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // ── Fetch promoter info ───────────────────────────────────────────
  const { data: promoter } = await supabaseAdmin
    .from("promoters")
    .select("id, user_id, username, display_name, bio, is_active, created_at, avatar_url, social_links")
    .eq("username", username)
    .single()

  if (!promoter || !promoter.is_active) {
    notFound()
  }

  // Is the current user the owner of this page?
  const isOwner = !!currentUser && promoter.user_id === currentUser.id

  // ── Parallel data fetching ────────────────────────────────────────
  const [
    { data: promoterProducts },
    { data: channels },
    { data: platforms },
    { count: totalClicks },
  ] = await Promise.all([
    supabaseAdmin
      .from("promoter_products")
      .select("*, products(*)")
      .eq("promoter_id", promoter.id)
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .limit(12),

    supabaseAdmin
      .from("promoter_channels")
      .select("platform_id, member_id")
      .eq("promoter_id", promoter.id)
      .eq("is_active", true),

    supabaseAdmin
      .from("agent_platforms")
      .select("id, name, slug, logo_url, website_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),

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

  const displayName = promoter.display_name || promoter.username
  const joinedDate = promoter.created_at
    ? new Date(promoter.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—"

  // Generate avatar initials
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join("")

  return (
    <>
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: "/" },
          { name: displayName, url: `/${username}` },
        ]}
      />

      <div className="flex flex-col">

        {/* ══ PROMOTER HERO BANNER ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0d1117]">
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Personalized color glow — unique per user via username hash */}
          <div className="absolute left-1/4 top-0 h-72 w-72 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-1/4 top-0 h-72 w-72 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">

            {/* Avatar */}
            <div className="mx-auto mb-5 h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl ring-4 ring-white/5">
              {promoter.avatar_url ? (
                <img
                  src={
                    promoter.avatar_url.startsWith("http")
                      ? promoter.avatar_url
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${promoter.avatar_url}`
                  }
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-extrabold text-white">
                  {initials}
                </div>
              )}
            </div>

            {/* Name & bio */}
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {displayName}
              <span className="text-orange-400">&apos;s Shop</span>
            </h1>

            {promoter.bio && (
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
                {promoter.bio}
              </p>
            )}

            {/* Social links */}
            {(promoter.social_links as Record<string, string>) &&
              Object.keys((promoter.social_links as Record<string, string>) || {}).length > 0 && (
              <div className="mx-auto mt-4 flex items-center justify-center gap-3">
                {Object.entries(promoter.social_links as Record<string, string>).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-orange-500/30 hover:text-orange-400"
                  >
                    <ExternalLink className="size-3" />
                    {platform}
                  </a>
                ))}
              </div>
            )}

            {/* ── Stats Row ─────────────────────────────────────── */}
            <div className="mx-auto mt-8 flex w-fit items-center divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 px-6 py-4">
                <ShoppingBag className="size-4 text-orange-400" />
                <div className="text-left">
                  <p className="text-lg font-bold leading-none text-white">{products.length}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">Products</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-6 py-4">
                <MousePointerClick className="size-4 text-orange-400" />
                <div className="text-left">
                  <p className="text-lg font-bold leading-none text-white">{totalClicks ?? 0}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">Clicks</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 px-6 py-4">
                <CalendarDays className="size-4 text-orange-400" />
                <div className="text-left">
                  <p className="text-sm font-bold leading-none text-white">{joinedDate}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">Joined</p>
                </div>
              </div>
            </div>

            {/* Share link banner — only visible to the page owner */}
            {isOwner && (
              <div className="mt-5">
                <ShareLinkBanner username={username} />
              </div>
            )}

            {/* Active Agents chips */}
            {activePlatforms.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-zinc-500">Available via:</span>
                {activePlatforms.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"
                  >
                    {p.logo_url ? (
                      <img
                        src={
                          p.logo_url.startsWith("http")
                            ? p.logo_url
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${p.logo_url}`
                        }
                        alt={p.name}
                        className="h-3.5 w-auto object-contain opacity-80"
                      />
                    ) : null}
                    {p.name}
                  </span>
                ))}
              </div>
            )}

            {/* Search bar */}
            <form
              action={`/${username}/products`}
              className="mx-auto mt-8 flex max-w-lg items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  name="q"
                  type="search"
                  placeholder={`Search ${displayName}'s products...`}
                  className="h-11 border-white/10 bg-white/5 pl-10 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                Search
              </Button>
            </form>

          </div>
        </section>

        {/* ══ CURATED PRODUCTS ══════════════════════════════════════════════ */}
        {products.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 items-center rounded bg-orange-500 px-2 text-[10px] font-bold uppercase tracking-wide text-white">
                  Curated
                </span>
                <h2 className="text-base font-bold text-zinc-900">
                  {displayName}&apos;s Picks
                </h2>
              </div>
              <Link
                href={`/${username}/products`}
                className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                All Products <ArrowRight className="size-3" />
              </Link>
            </div>
            <PromoterProductsGrid
              products={products}
              username={username}
            />
          </section>
        ) : (
          <section className="mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xs">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                <ShoppingBag className="size-7 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-600">No products curated yet</p>
              <p className="mt-1 text-xs text-zinc-400">Check back soon for {displayName}&apos;s picks!</p>
            </div>
          </section>
        )}

        {/* ══ CTA ═══════════════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-2 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[#0d1117] px-8 py-12 text-center">
            <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-xl font-extrabold text-white sm:text-2xl">
                Want to start your own shop?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                Join Finds Engine as a promoter and earn commissions on every sale.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                  >
                    Get Started
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                  >
                    Browse All Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
