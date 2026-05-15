import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkPromoterAccess } from "@/lib/promoter-access"

export async function GET() {
  const access = await checkPromoterAccess("settings")
  if (access.error) return access.error

  const serviceClient = createServiceClient()
  const promoterId = access.promoter!.id

  const { data: promoter } = await serviceClient
    .from("promoters")
    .select("display_name, bio, theme_config, banner_config")
    .eq("id", promoterId)
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
  const access = await checkPromoterAccess("settings")
  if (access.error) return access.error

  const serviceClient = createServiceClient()
  const promoterId = access.promoter!.id

  try {
    const body = await request.json()
    const config = body.config || {}

    const { error } = await serviceClient
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
      .eq("id", promoterId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid request"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
