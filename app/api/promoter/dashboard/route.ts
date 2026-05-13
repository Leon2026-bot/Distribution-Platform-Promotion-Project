import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: promoter } = await supabase
    .from("promoters")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!promoter) {
    return NextResponse.json({ error: "Promoter not found" }, { status: 404 })
  }

  const promoterId = promoter.id

  // Parse date range
  const { searchParams } = new URL(request.url)
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  let query = supabase
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
    const { data: products } = await supabase
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

  return NextResponse.json({
    total_clicks: totalClicks,
    trend_data: trendData,
    top_products: topProducts,
    click_details: clickList.slice(0, 20),
  })
}
