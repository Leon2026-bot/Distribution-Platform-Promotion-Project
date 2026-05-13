import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { buildJumpUrl } from "@/lib/jump-url"

/**
 * GET /api/r/[code]
 * Redirect handler: resolves a short code to the final URL with promo params
 *
 * Route: /r/[promoter_username]-[source_item_id]-[platform_slug]
 * or:    /r/[short_code]  (from promo_links table)
 *
 * Flow:
 * 1. Try to find a promo_link by short_code
 * 2. If found, redirect to final_url and log click
 * 3. If not found, try to parse as [promoter]-[item_id]-[platform_slug] and build URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  try {
    // ── Try to look up by short_code ─────────────────────────────────
    const { data: promoLink } = await supabaseAdmin
      .from("promo_links")
      .select("*, agent_platforms(*)")
      .eq("short_code", code)
      .single()

    if (promoLink && promoLink.final_url) {
      // Increment click count
      await supabaseAdmin
        .from("promo_links")
        .update({
          click_count: (promoLink.click_count ?? 0) + 1,
          last_clicked_at: new Date().toISOString(),
        })
        .eq("id", promoLink.id)

      // Log click event
      await supabaseAdmin.from("click_events").insert({
        event_type: "buy_click",
        product_id: promoLink.product_id ?? null,
        promoter_id: promoLink.promoter_id ?? null,
        platform_id: promoLink.platform_id ?? null,
        session_id: request.headers.get("x-session-id") ?? null,
        ip_country: request.headers.get("cf-ipcountry") ?? request.headers.get("x-vercel-ip-country") ?? null,
        referrer: request.headers.get("referer") ?? null,
        user_agent: request.headers.get("user-agent") ?? null,
      })

      return NextResponse.redirect(promoLink.final_url, { status: 302 })
    }

    // ── Fallback: parse code as [item_id]-[platform_slug] ─────────────
    // Format: {source_item_id}-{platform_slug} (e.g., 604823456789-kakobuy)
    const lastDashIdx = code.lastIndexOf("-")
    if (lastDashIdx > 0) {
      const sourceItemId = code.slice(0, lastDashIdx)
      const platformSlug = code.slice(lastDashIdx + 1)

      const { data: platform } = await supabaseAdmin
        .from("agent_platforms")
        .select("*")
        .eq("slug", platformSlug)
        .eq("is_active", true)
        .single()

      if (platform) {
        const finalUrl = buildJumpUrl({
          platform,
          product: { source_item_id: sourceItemId },
          promoter: null,
        })

        if (finalUrl && finalUrl !== "#") {
          return NextResponse.redirect(finalUrl, { status: 302 })
        }
      }
    }

    // Not found — redirect to homepage
    return NextResponse.redirect(new URL("/", request.url), { status: 302 })
  } catch (err) {
    console.error("[r/route] error:", err)
    return NextResponse.redirect(new URL("/", request.url), { status: 302 })
  }
}
