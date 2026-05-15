import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const serviceClient = createServiceClient()

    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    let promoterId: string | null = null

    if (username) {
      const { data: promoter } = await serviceClient
        .from("promoters")
        .select("id")
        .eq("username", username)
        .single()

      if (promoter) {
        promoterId = promoter.id
      }
    }

    // Build click query
    let clickQuery = serviceClient.from("click_events").select("*", { count: "exact", head: true })
    if (promoterId) {
      clickQuery = clickQuery.eq("promoter_id", promoterId)
    }
    if (from) clickQuery = clickQuery.gte("created_at", from)
    if (to) clickQuery = clickQuery.lte("created_at", to)
    const { count: clicksCount } = await clickQuery

    // Build product query
    let productQuery = serviceClient.from("products").select("*", { count: "exact", head: true }).eq("is_active", true)
    const { count: productsCount } = await productQuery

    // Build promoter query
    let promoterQuery = serviceClient.from("promoters").select("*", { count: "exact", head: true })
    if (promoterId) {
      promoterQuery = promoterQuery.eq("id", promoterId)
    }
    const { count: promotersCount } = await promoterQuery

    // Build platform query
    const { count: platformsCount } = await serviceClient
      .from("agent_platforms")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Build blog query
    const { count: blogCount } = await serviceClient
      .from("blog_posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")

    // Trend data
    let trendQuery = serviceClient
      .from("click_events")
      .select("created_at")
    if (promoterId) {
      trendQuery = trendQuery.eq("promoter_id", promoterId)
    }
    if (from) trendQuery = trendQuery.gte("created_at", from)
    if (to) trendQuery = trendQuery.lte("created_at", to)
    const { data: trendClicks } = await trendQuery

    const trendMap = new Map<string, number>()
    trendClicks?.forEach((c) => {
      const date = c.created_at
        ? new Date(c.created_at).toISOString().split("T")[0]
        : "unknown"
      trendMap.set(date, (trendMap.get(date) ?? 0) + 1)
    })
    const trendData = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    // Top products
    let topProductQuery = serviceClient
      .from("click_events")
      .select("product_id")
      .not("product_id", "is", null)
    if (promoterId) {
      topProductQuery = topProductQuery.eq("promoter_id", promoterId)
    }
    if (from) topProductQuery = topProductQuery.gte("created_at", from)
    if (to) topProductQuery = topProductQuery.lte("created_at", to)
    const { data: topClicks } = await topProductQuery

    const productClickMap = new Map<string, number>()
    topClicks?.forEach((c) => {
      if (c.product_id) {
        productClickMap.set(c.product_id, (productClickMap.get(c.product_id) ?? 0) + 1)
      }
    })

    const topProductIds = Array.from(productClickMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id)

    let topProducts: Array<{ id: string; title: string; clicks: number }> = []
    if (topProductIds.length > 0) {
      const { data: products } = await serviceClient
        .from("products")
        .select("id, title")
        .in("id", topProductIds)

      const productMap = new Map(products?.map((p) => [p.id, p.title]) ?? [])
      topProducts = topProductIds.map((id) => ({
        id,
        title: productMap.get(id) ?? "Unknown",
        clicks: productClickMap.get(id) ?? 0,
      }))
    }

    return NextResponse.json({
      total_products: productsCount ?? 0,
      total_promoters: promotersCount ?? 0,
      total_clicks: clicksCount ?? 0,
      total_platforms: platformsCount ?? 0,
      total_blog_posts: blogCount ?? 0,
      trend_data: trendData,
      top_products: topProducts,
      filter_username: username,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message.includes("Unauthorized") ? 401 : 403 })
  }
}
