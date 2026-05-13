import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

/* ── GET: single blog post ────────────────────────────────── */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await params

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ post: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

/* ── PATCH: update blog post ──────────────────────────────── */
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
      .from("blog_posts")
      .update({
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.slug !== undefined && { slug: body.slug.trim() }),
        ...(body.content !== undefined && { content: body.content.trim() }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt?.trim() || null }),
        ...(body.cover_image !== undefined && { cover_image: body.cover_image?.trim() || null }),
        ...(body.status !== undefined && {
          status: body.status,
          ...(body.status === "published" && { published_at: new Date().toISOString() }),
        }),
        ...(body.is_ai_generated !== undefined && { is_ai_generated: body.is_ai_generated }),
        ...(body.focus_keyword !== undefined && { focus_keyword: body.focus_keyword?.trim() || null }),
        ...(body.seo_title !== undefined && { seo_title: body.seo_title?.trim() || null }),
        ...(body.seo_description !== undefined && { seo_description: body.seo_description?.trim() || null }),
        ...(body.tags !== undefined && { tags: Array.isArray(body.tags) && body.tags.length ? body.tags : null }),
        ...(body.related_products !== undefined && {
          related_products: Array.isArray(body.related_products) && body.related_products.length
            ? body.related_products
            : null,
        }),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

/* ── DELETE: remove blog post ─────────────────────────────── */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await params

    const { error } = await supabase.from("blog_posts").delete().eq("id", id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
