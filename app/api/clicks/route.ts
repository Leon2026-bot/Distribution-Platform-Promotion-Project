import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "edge"

/**
 * POST /api/clicks
 * Record a click event (product view, buy click, blog view, etc.)
 *
 * Body: {
 *   event_type: string
 *   product_id?: string
 *   promoter_id?: string
 *   platform_id?: string
 *   blog_id?: string
 *   session_id?: string
 *   referrer?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      event_type,
      product_id,
      promoter_id,
      platform_id,
      blog_id,
      session_id,
      referrer,
    } = body

    if (!event_type) {
      return NextResponse.json({ error: "event_type is required" }, { status: 400 })
    }

    // Get country from CF headers (Cloudflare adds this automatically)
    const ip_country = request.headers.get("cf-ipcountry") ??
      request.headers.get("x-vercel-ip-country") ?? null

    const user_agent = request.headers.get("user-agent") ?? null

    // Insert click event
    const { error } = await supabaseAdmin.from("click_events").insert({
      event_type,
      product_id: product_id ?? null,
      promoter_id: promoter_id ?? null,
      platform_id: platform_id ?? null,
      blog_id: blog_id ?? null,
      session_id: session_id ?? null,
      ip_country,
      referrer: referrer ?? request.headers.get("referer") ?? null,
      user_agent,
    })

    if (error) {
      console.error("[clicks] insert error:", error)
      return NextResponse.json({ error: "Failed to record event" }, { status: 500 })
    }

    // Increment product click_count if buy_click event
    if (event_type === "buy_click" && product_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin as any).rpc("increment_click_count", { product_id })
    }

    // Increment product view_count if product_view event
    if (event_type === "product_view" && product_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin as any).rpc("increment_view_count", { product_id })
    }

    // Increment blog view_count if blog_view event
    if (event_type === "blog_view" && blog_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseAdmin as any).rpc("increment_blog_view_count", { blog_id })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[clicks] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
