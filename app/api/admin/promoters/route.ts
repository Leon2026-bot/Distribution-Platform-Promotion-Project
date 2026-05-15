import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()
    const serviceClient = createServiceClient()

    // Fetch promoters via service client (bypasses RLS)
    // Note: if 'is_active' or 'permissions' columns don't exist in DB yet,
    // this query will fail with a 500 error. Run sql/14-promoters-permissions.sql first.
    const { data: promoters, error } = await serviceClient
      .from("promoters")
      .select("id, username, display_name, bio, avatar_url, status, is_active, permissions, created_at, updated_at, user_id")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API /admin/promoters] Supabase error:", error)
      return NextResponse.json(
        { error: "Database error", details: error.message, hint: "Did you run sql/14-promoters-permissions.sql?" },
        { status: 500 }
      )
    }

    // Fetch stats for enrichment
    const [{ data: clickStats }, { data: productStats }, { data: channelStats }] =
      await Promise.all([
        serviceClient
          .from("click_events")
          .select("promoter_id")
          .not("promoter_id", "is", null),
        serviceClient.from("promoter_products").select("promoter_id"),
        serviceClient.from("promoter_channels").select("promoter_id"),
      ])

    // Aggregate stats
    const clickCountMap = new Map<string, number>()
    clickStats?.forEach((c) => {
      const id = c.promoter_id!
      clickCountMap.set(id, (clickCountMap.get(id) || 0) + 1)
    })

    const productCountMap = new Map<string, number>()
    productStats?.forEach((p) => {
      const id = p.promoter_id!
      productCountMap.set(id, (productCountMap.get(id) || 0) + 1)
    })

    const channelCountMap = new Map<string, number>()
    channelStats?.forEach((c) => {
      const id = c.promoter_id!
      channelCountMap.set(id, (channelCountMap.get(id) || 0) + 1)
    })

    // Merge stats into promoters
    const enriched = (promoters || []).map((p) => ({
      ...p,
      total_clicks: clickCountMap.get(p.id) || 0,
      total_products: productCountMap.get(p.id) || 0,
      total_channels: channelCountMap.get(p.id) || 0,
    }))

    return NextResponse.json(enriched)
  } catch (err: any) {
    console.error("[API /admin/promoters] Caught error:", err)
    let message = "Unknown error"
    try {
      message =
        typeof err?.message === "string"
          ? err.message
          : typeof err === "string"
            ? err
            : JSON.stringify(err)
    } catch {
      message = "Unserializable error"
    }
    return NextResponse.json(
      { error: message || "Unknown error" },
      { status: 500 }
    )
  }
}
