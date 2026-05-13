import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/* ── GET: list custom products ─────────────────────────────── */
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
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!promoter) {
    return NextResponse.json({ error: "Promoter not found" }, { status: 404 })
  }

  const { data: products } = await supabase
    .from("promoter_products")
    .select("id, custom_name, custom_price, custom_image, custom_url, custom_category, custom_tags, is_pinned, display_order, status, added_at")
    .eq("promoter_id", promoter.id)
    .eq("product_type", "custom")
    .eq("status", "active")
    .order("is_pinned", { ascending: false })
    .order("display_order", { ascending: true })
    .order("added_at", { ascending: false })

  return NextResponse.json({ products: products ?? [] })
}

/* ── POST: create single custom product ────────────────────── */
export async function POST(req: NextRequest) {
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

  const body = await req.json()

  // Validate required fields
  if (!body.custom_name || body.custom_price == null) {
    return NextResponse.json(
      { error: "Name and price are required" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("promoter_products")
    .insert({
      promoter_id: promoter.id,
      product_type: "custom",
      custom_name: body.custom_name.trim(),
      custom_price: Number(body.custom_price),
      custom_image: body.custom_image?.trim() || null,
      custom_url: body.custom_url?.trim() || null,
      custom_category: body.custom_category?.trim() || null,
      custom_tags: body.custom_tags?.length ? body.custom_tags : null,
      status: "active",
    })
    .select()
    .single()

  if (error) {
    console.error("Insert custom product error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product: data }, { status: 201 })
}
