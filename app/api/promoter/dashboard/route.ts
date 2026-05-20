import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { checkPromoterAccess } from "@/lib/promoter-access"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Parse query params
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  let promoterId: string

  if (username) {
    // Lookup by username (used by admin views — no module permission check)
    const { data: promoter } = await serviceClient
      .from("promoters")
      .select("id")
      .eq("username", username)
      .single()

    if (!promoter) {
      return NextResponse.json({ error: "Promoter not found" }, { status: 404 })
    }
    promoterId = promoter.id
  } else {
    // Session-based access — check permissions
    const access = await checkPromoterAccess("dashboard")
    if (access.error) return access.error
    promoterId = access.promoter!.id
  }

  // Parse date range
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // ── Current period clicks ──
  let query = serviceClient
    .from("click_events")
    .select("*")
    .eq("promoter_id", promoterId)

  if (from) {
    query = query.gte("created_at", from)
  }
  if (to) {
    query = query.lte("created_at", to)
  }

  const { data: clicks, error } = await query.order("created_at", {
    ascending: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const clickList = clicks ?? []

  // ── Previous period clicks (for trend comparison) ──
  let prevTotalClicks = 0
  if (from && to) {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const diffMs = toDate.getTime() - fromDate.getTime()
    const prevFrom = new Date(fromDate.getTime() - diffMs).toISOString().split("T")[0]
    const prevTo = new Date(fromDate.getTime() - 1).toISOString().split("T")[0]

    const { count } = await serviceClient
      .from("click_events")
      .select("id", { count: "exact", head: true })
      .eq("promoter_id", promoterId)
      .gte("created_at", prevFrom)
      .lte("created_at", prevTo)
    prevTotalClicks = count ?? 0
  }

  // Total clicks
  const totalClicks = clickList.length

  // Trend data: group by date
  const trendMap = new Map<string, number>()
  clickList.forEach((c) => {
    const date = c.created_at
      ? new Date(c.created_at).toISOString().split("T")[0]
      : "unknown"
    trendMap.set(date, (trendMap.get(date) ?? 0) + 1)
  })
  const trendData = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  // Top products
  const productClicks = new Map<string, number>()
  clickList.forEach((c) => {
    if (c.product_id) {
      productClicks.set(
        c.product_id,
        (productClicks.get(c.product_id) ?? 0) + 1
      )
    }
  })

  // Fetch product names for top products
  const topProductIds = Array.from(productClicks.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
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
      title: productMap.get(id) ?? "Unknown Product",
      clicks: productClicks.get(id) ?? 0,
    }))
  }

  // Fetch product titles for click_details
  const clickProductIds = [...new Set(clickList.map((c) => c.product_id).filter(Boolean))] as string[]

  let productTitleMap = new Map<string, string>()

  if (clickProductIds.length > 0) {
    const { data: clickProducts } = await serviceClient
      .from("products")
      .select("id, title")
      .in("id", clickProductIds)

    productTitleMap = new Map(clickProducts?.map((p) => [p.id, p.title]) ?? [])
  }

  const clickDetails = clickList.slice(0, 20).map((click) => ({
    ...click,
    product_title: click.product_id ? (productTitleMap.get(click.product_id) ?? null) : null,
  }))

  return NextResponse.json({
    total_clicks: totalClicks,
    prev_total_clicks: prevTotalClicks,
    trend_data: trendData,
    top_products: topProducts,
    click_details: clickDetails,
  })
}
