import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkPromoterAccess } from "@/lib/promoter-access"

/** Generate a random short code (6 chars, a-z0-9) */
function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/** GET /api/promoter/short-links - Get all promo links for current promoter */
export async function GET() {
  try {
    const access = await checkPromoterAccess()
    if (access.error) return access.error
    const promoterId = access.promoter!.id

    const serviceClient = createServiceClient()

    const { data: links, error } = await serviceClient
      .from("promo_links")
      .select("id, short_code, final_url, product_id, click_count, created_at")
      .eq("promoter_id", promoterId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ links: links ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/** POST /api/promoter/short-links - Create a new short link */
export async function POST(request: NextRequest) {
  try {
    const access = await checkPromoterAccess()
    if (access.error) return access.error
    const promoterId = access.promoter!.id
    const username = access.promoter!.username

    const body = await request.json()
    const { product_id, product_slug } = body as {
      product_id?: string
      product_slug?: string
    }

    if (!product_id || !product_slug) {
      return NextResponse.json(
        { error: "product_id and product_slug are required" },
        { status: 400 }
      )
    }

    const serviceClient = createServiceClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || ""
    const finalUrl = `${siteUrl}/products/${product_slug}?ref=${username}`

    // Generate unique short code (retry up to 5 times on collision)
    let shortCode = ""
    let attempts = 0
    while (attempts < 5) {
      const code = generateShortCode()
      const { data: existing } = await serviceClient
        .from("promo_links")
        .select("id")
        .eq("short_code", code)
        .maybeSingle()

      if (!existing) {
        shortCode = code
        break
      }
      attempts++
    }

    if (!shortCode) {
      return NextResponse.json(
        { error: "Failed to generate unique short code. Please try again." },
        { status: 500 }
      )
    }

    const { data: link, error } = await serviceClient
      .from("promo_links")
      .insert({
        promoter_id: promoterId,
        product_id,
        product_type: "standard",
        short_code: shortCode,
        final_url: finalUrl,
        promoter_code: username,
        click_count: 0,
      })
      .select("id, short_code, final_url, product_id, click_count, created_at")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(link)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
