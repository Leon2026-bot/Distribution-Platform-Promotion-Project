import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const [
      { count: productsCount },
      { count: promotersCount },
      { count: clicksCount },
      { count: platformsCount },
      { count: blogCount },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("promoters").select("*", { count: "exact", head: true }),
      supabase.from("click_events").select("*", { count: "exact", head: true }),
      supabase.from("agent_platforms").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    ])

    return NextResponse.json({
      total_products: productsCount ?? 0,
      total_promoters: promotersCount ?? 0,
      total_clicks: clicksCount ?? 0,
      total_platforms: platformsCount ?? 0,
      total_blog_posts: blogCount ?? 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.message.includes("Unauthorized") ? 401 : 403 })
  }
}
