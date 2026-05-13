import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/* ── PATCH: update custom product ──────────────────────────── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  // Verify ownership
  const { data: existing } = await supabase
    .from("promoter_products")
    .select("id")
    .eq("id", id)
    .eq("promoter_id", promoter.id)
    .eq("product_type", "custom")
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()

  const { data, error } = await supabase
    .from("promoter_products")
    .update({
      ...(body.custom_name !== undefined && { custom_name: body.custom_name.trim() }),
      ...(body.custom_price !== undefined && { custom_price: Number(body.custom_price) }),
      ...(body.custom_image !== undefined && { custom_image: body.custom_image?.trim() || null }),
      ...(body.custom_url !== undefined && { custom_url: body.custom_url?.trim() || null }),
      ...(body.custom_category !== undefined && { custom_category: body.custom_category?.trim() || null }),
      ...(body.custom_tags !== undefined && { custom_tags: body.custom_tags?.length ? body.custom_tags : null }),
      ...(body.is_pinned !== undefined && { is_pinned: body.is_pinned }),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product: data })
}

/* ── DELETE: remove custom product ─────────────────────────── */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { error } = await supabase
    .from("promoter_products")
    .update({ status: "removed" })
    .eq("id", id)
    .eq("promoter_id", promoter.id)
    .eq("product_type", "custom")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
