import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkPromoterAccess } from "@/lib/promoter-access"

/* ── GET: promoter links data ──────────────────────────────── */
export async function GET() {
  const access = await checkPromoterAccess("links")
  if (access.error) return access.error

  const serviceClient = createServiceClient()
  const promoterId = access.promoter!.id
  const username = access.promoter!.username

  // Get all active products (standard + custom)
  const { data: products } = await serviceClient
    .from("promoter_products")
    .select(`
      id,
      product_type,
      custom_name,
      custom_price,
      custom_image,
      custom_url,
      is_pinned,
      product:product_id(title, slug, images, price_cny)
    `)
    .eq("promoter_id", promoterId)
    .eq("status", "active")
    .order("is_pinned", { ascending: false })
    .order("display_order", { ascending: true })

  // Get configured channels for platform-aware links
  const { data: channels } = await serviceClient
    .from("promoter_channels")
    .select("platform_id, member_id")
    .eq("promoter_id", promoterId)
    .eq("is_active", true)

  return NextResponse.json({
    username,
    products: products ?? [],
    channels: channels ?? [],
  })
}
