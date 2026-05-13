import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/promoter/products
 * List all active products with "already_added" flag for current promoter.
 */
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

  const promoterId = promoter.id

  // Fetch all active products
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .limit(500)

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 })
  }

  // Fetch promoter's existing products
  const { data: myProducts } = await supabase
    .from("promoter_products")
    .select("product_id")
    .eq("promoter_id", promoterId)
    .eq("status", "active")

  const addedIds = new Set(myProducts?.map((p) => p.product_id) ?? [])

  const productsWithStatus = (products ?? []).map((p) => ({
    ...p,
    is_added: addedIds.has(p.id),
  }))

  return NextResponse.json({ products: productsWithStatus })
}

/**
 * POST /api/promoter/products
 * Add product(s) to promoter's picks.
 * Body: { product_ids: string[] }
 */
export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json()
    const productIds: string[] = body.product_ids ?? []

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "product_ids array required" },
        { status: 400 }
      )
    }

    // Check existing
    const { data: existing } = await supabase
      .from("promoter_products")
      .select("product_id")
      .eq("promoter_id", promoterId)
      .in("product_id", productIds)

    const existingIds = new Set(existing?.map((e) => e.product_id) ?? [])
    const newIds = productIds.filter((id) => !existingIds.has(id))

    let added = 0
    if (newIds.length > 0) {
      const inserts = newIds.map((product_id) => ({
        promoter_id: promoterId,
        product_id,
        product_type: "standard",
        status: "active",
        display_order: 0,
        is_pinned: false,
      }))

      const { error } = await supabase
        .from("promoter_products")
        .insert(inserts)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      added = newIds.length
    }

    return NextResponse.json({
      added,
      skipped: existingIds.size,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
