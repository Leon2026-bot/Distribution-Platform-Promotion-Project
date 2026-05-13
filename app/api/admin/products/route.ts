import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search")

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ products: data, total: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 })
  }
}

/* ── POST: create product ──────────────────────────────────── */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await req.json()

    const { data, error } = await supabase
      .from("products")
      .insert({
        title: body.title?.trim(),
        title_zh: body.title_zh?.trim() || null,
        slug: body.slug?.trim(),
        description: body.description?.trim() || null,
        description_zh: body.description_zh?.trim() || null,
        price_cny: Number(body.price_cny) || 0,
        price_usd: body.price_usd ? Number(body.price_usd) : null,
        brand: body.brand?.trim() || null,
        category: body.category?.trim() || "uncategorized",
        images: Array.isArray(body.images) ? body.images : [],
        source_type: body.source_type?.trim() || "manual",
        source_item_id: body.source_item_id?.trim() || "manual-" + Date.now(),
        source_url: body.source_url?.trim() || null,
        tags: Array.isArray(body.tags) && body.tags.length ? body.tags : null,
        colors: Array.isArray(body.colors) && body.colors.length ? body.colors : null,
        is_active: body.is_active ?? true,
        is_featured: body.is_featured ?? false,
        seo_title: body.seo_title?.trim() || null,
        seo_description: body.seo_description?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
