import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const serviceClient = createServiceClient()
    const { id } = await params
    const body = await request.json()

    const updateData: {
      updated_at: string
      status?: string
      is_active?: boolean
      permissions?: Record<string, boolean>
      display_name?: string
      bio?: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (body.status !== undefined) updateData.status = body.status
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.permissions !== undefined) updateData.permissions = body.permissions
    if (body.display_name !== undefined) updateData.display_name = body.display_name
    if (body.bio !== undefined) updateData.bio = body.bio

    const { data, error } = await serviceClient
      .from("promoters")
      .update(updateData as any)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const serviceClient = createServiceClient()
    const { id } = await params

    const { data: promoter, error } = await serviceClient
      .from("promoters")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    if (!promoter) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Fetch stats
    const { count: clickCount } = await serviceClient
      .from("click_events")
      .select("*", { count: "exact", head: true })
      .eq("promoter_id", id)

    const { count: productCount } = await serviceClient
      .from("promoter_products")
      .select("*", { count: "exact", head: true })
      .eq("promoter_id", id)

    const { count: channelCount } = await serviceClient
      .from("promoter_channels")
      .select("*", { count: "exact", head: true })
      .eq("promoter_id", id)

    const { data: links } = await serviceClient
      .from("promo_links")
      .select("*")
      .eq("promoter_id", id)
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      ...promoter,
      total_clicks: clickCount || 0,
      total_products: productCount || 0,
      total_channels: channelCount || 0,
      recent_links: links || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
