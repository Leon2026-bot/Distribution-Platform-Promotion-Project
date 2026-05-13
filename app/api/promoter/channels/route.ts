import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

  const { data: channels } = await supabase
    .from("promoter_channels")
    .select("*")
    .eq("promoter_id", promoter.id)
    .eq("is_active", true)

  return NextResponse.json({ channels: channels ?? [] })
}

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

  try {
    const body = await request.json()
    const channels: Array<{
      platform_id: string
      member_id: string
    }> = body.channels ?? []

    // Upsert each channel
    for (const ch of channels) {
      if (!ch.platform_id || !ch.member_id?.trim()) continue

      const { data: existing } = await supabase
        .from("promoter_channels")
        .select("id")
        .eq("promoter_id", promoter.id)
        .eq("platform_id", ch.platform_id)
        .single()

      if (existing) {
        await supabase
          .from("promoter_channels")
          .update({ member_id: ch.member_id.trim() })
          .eq("id", existing.id)
      } else {
        await supabase.from("promoter_channels").insert({
          promoter_id: promoter.id,
          platform_id: ch.platform_id,
          member_id: ch.member_id.trim(),
          is_active: true,
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
