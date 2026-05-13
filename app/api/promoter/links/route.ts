import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/* ── GET: promoter links data ──────────────────────────────── */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: promoter } = await supabase
    .from("promoters")
    .select("id, username")
    .eq("user_id", user.id)
    .single()

  if (!promoter) {
    return NextResponse.json({ error: "Promoter not found" }, { status: 404 })
  }

  // Get all active products (standard + custom)
  const { data: products } = await supabase
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
    .eq("promoter_id", promoter.id)
    .eq("status", "active")
    .order("is_pinned", { ascending: false })
    .order("display_order", { ascending: true })

  // Get configured channels for platform-aware links
  const { data: channels } = await supabase
    .from("promoter_channels")
    .select("platform_id, member_id")
    .eq("promoter_id", promoter.id)
    .eq("is_active", true)

  return NextResponse.json({
    username: promoter.username,
    products: products ?? [],
    channels: channels ?? [],
  })
}
