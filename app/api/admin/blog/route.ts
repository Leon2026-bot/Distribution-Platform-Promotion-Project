import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, status, is_ai_generated, published_at, view_count, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 })
  }
}

/* ── POST: create blog post ───────────────────────────────── */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await req.json()

    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: body.title?.trim(),
        slug: body.slug?.trim(),
        content: body.content?.trim() || "",
        excerpt: body.excerpt?.trim() || null,
        cover_image: body.cover_image?.trim() || null,
        status: body.status || "draft",
        is_ai_generated: body.is_ai_generated ?? false,
        author_id: userData.user?.id || null,
        focus_keyword: body.focus_keyword?.trim() || null,
        seo_title: body.seo_title?.trim() || null,
        seo_description: body.seo_description?.trim() || null,
        tags: Array.isArray(body.tags) && body.tags.length ? body.tags : null,
        related_products: Array.isArray(body.related_products) && body.related_products.length
          ? body.related_products
          : null,
        published_at: body.status === "published" ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
