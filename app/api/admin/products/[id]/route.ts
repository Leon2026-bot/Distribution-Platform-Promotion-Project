import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

/* ── GET: single product ──────────────────────────────────── */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await params

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ product: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

/* ── PATCH: update product ────────────────────────────────── */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await params
    const body = await req.json()

    const { data, error } = await supabase
      .from("products")
      .update({
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.title_zh !== undefined && { title_zh: body.title_zh?.trim() || null }),
        ...(body.slug !== undefined && { slug: body.slug.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.description_zh !== undefined && { description_zh: body.description_zh?.trim() || null }),
        ...(body.price_cny !== undefined && { price_cny: Number(body.price_cny) || 0 }),
        ...(body.price_usd !== undefined && { price_usd: body.price_usd ? Number(body.price_usd) : null }),
        ...(body.brand !== undefined && { brand: body.brand?.trim() || null }),
        ...(body.category !== undefined && { category: body.category?.trim() || "uncategorized" }),
        ...(body.images !== undefined && { images: Array.isArray(body.images) ? body.images : [] }),
        ...(body.source_type !== undefined && { source_type: body.source_type?.trim() }),
        ...(body.source_item_id !== undefined && { source_item_id: body.source_item_id?.trim() }),
        ...(body.source_url !== undefined && { source_url: body.source_url?.trim() || null }),
        ...(body.tags !== undefined && { tags: Array.isArray(body.tags) && body.tags.length ? body.tags : null }),
        ...(body.colors !== undefined && { colors: Array.isArray(body.colors) && body.colors.length ? body.colors : null }),
        ...(body.is_active !== undefined && { is_active: body.is_active }),
        ...(body.is_featured !== undefined && { is_featured: body.is_featured }),
        ...(body.seo_title !== undefined && { seo_title: body.seo_title?.trim() || null }),
        ...(body.seo_description !== undefined && { seo_description: body.seo_description?.trim() || null }),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

/* ── DELETE: remove product ───────────────────────────────── */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await params

    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
