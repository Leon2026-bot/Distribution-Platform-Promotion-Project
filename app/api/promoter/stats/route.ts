import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { checkPromoterAccess } from "@/lib/promoter-access"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  let promoterId: string

  if (username) {
    const { data: promoter } = await serviceClient
      .from("promoters")
      .select("id")
      .eq("username", username)
      .single()

    if (!promoter) {
      return NextResponse.json({ error: "Promoter not found" }, { status: 404 })
    }
    promoterId = promoter.id
  } else {
    const access = await checkPromoterAccess("dashboard")
    if (access.error) return access.error
    promoterId = access.promoter!.id
  }

  const [
    { count: productCount },
    { count: channelCount },
    { count: totalPlatforms },
  ] = await Promise.all([
    serviceClient
      .from("promoter_products")
      .select("*", { count: "exact", head: true })
      .eq("promoter_id", promoterId)
      .eq("status", "active"),

    serviceClient
      .from("promoter_channels")
      .select("*", { count: "exact", head: true })
      .eq("promoter_id", promoterId)
      .eq("is_active", true)
      .not("member_id", "is", null)
      .neq("member_id", ""),

    serviceClient
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
