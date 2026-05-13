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
