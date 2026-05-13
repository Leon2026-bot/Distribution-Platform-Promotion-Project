import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("agent_platforms")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("agent_platforms")
      .insert({
        name: body.name,
        slug: body.slug,
        logo_url: body.logo_url || null,
        website_url: body.website_url || null,
        jump_url_template: body.jump_url_template,
        site_promo_code: body.site_promo_code || null,
        supported_sources: body.supported_sources || [],
        fee_description: body.fee_description || null,
        display_order: body.display_order ?? 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
