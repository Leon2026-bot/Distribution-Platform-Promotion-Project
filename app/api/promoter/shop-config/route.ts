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
    .select("display_name, bio, theme_config, banner_config")
    .eq("user_id", user.id)
    .single()

  if (!promoter) {
    return NextResponse.json({ error: "Promoter not found" }, { status: 404 })
  }

  const theme = (promoter.theme_config as Record<string, unknown>) || {}
  const banner = (promoter.banner_config as Record<string, unknown>) || {}

  return NextResponse.json({
    config: {
      display_name: promoter.display_name ?? "",
      bio: promoter.bio ?? "",
      banner_text: (banner.text as string) || "",
      banner_subtitle: (banner.subtitle as string) || "",
      banner_color: (theme.banner_color as string) || "#f4f4f5",
    },
  })
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
    const config = body.config || {}

    const { error } = await supabase
      .from("promoters")
      .update({
        display_name: config.display_name,
        bio: config.bio,
        theme_config: { banner_color: config.banner_color },
        banner_config: {
          text: config.banner_text,
          subtitle: config.banner_subtitle,
        },
      })
      .eq("id", promoter.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
