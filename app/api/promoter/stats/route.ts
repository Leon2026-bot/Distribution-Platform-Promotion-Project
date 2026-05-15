import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  let promoterId: string

  if (username) {
    const { data: promoter } = await supabase
      .from("promoters")
      .select("id")
      .eq("username", username)
      .single()

    if (!promoter) {
      return NextResponse.json({ error: "Promoter not found" }, { status: 404 })
    }
    promoterId = promoter.id
  } else {
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
    promoterId = promoter.id
  }

  const [
    { count: productCount },
    { count: channelCount },
    { count: totalPlatforms },
  ] = await Promise.all([
    supabase
      .from("promoter_products")
      .select("*", { count: "exact", head: true })
      .eq("promoter_id", promoterId)
      .eq("status", "active"),

    supabase
      .from("promoter_channels")
      .select("*", { count: "exact", head: true })
      .eq("promoter_id", promoterId)
      .eq("is_active", true),

    supabase
      .from("agent_platforms")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ])

  return NextResponse.json({
    promoted_products: productCount ?? 0,
    configured_channels: channelCount ?? 0,
    total_platforms: totalPlatforms ?? 0,
  })
}
