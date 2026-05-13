import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
      .from("agent_platforms")
      .update({
        name: body.name,
        slug: body.slug,
        logo_url: body.logo_url,
        website_url: body.website_url,
        jump_url_template: body.jump_url_template,
        site_promo_code: body.site_promo_code,
        supported_sources: body.supported_sources,
        fee_description: body.fee_description,
        display_order: body.display_order,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { id } = await params

    const { error } = await supabase
      .from("agent_platforms")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
