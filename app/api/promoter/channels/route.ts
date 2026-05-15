import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkPromoterAccess } from "@/lib/promoter-access"

export async function GET() {
  const access = await checkPromoterAccess("settings")
  if (access.error) return access.error

  const serviceClient = createServiceClient()
  const promoterId = access.promoter!.id

  const { data: channels } = await serviceClient
    .from("promoter_channels")
    .select("*")
    .eq("promoter_id", promoterId)
    .eq("is_active", true)
    .not("member_id", "is", null)
    .neq("member_id", "")

  return NextResponse.json({ channels: channels ?? [] })
}

export async function POST(request: NextRequest) {
  const access = await checkPromoterAccess("settings")
  if (access.error) return access.error

  const serviceClient = createServiceClient()
  const promoterId = access.promoter!.id

  try {
    const body = await request.json()
    const channels: Array<{
      platform_id: string
      member_id: string
    }> = body.channels ?? []

    // Upsert or delete each channel based on member_id
    for (const ch of channels) {
      if (!ch.platform_id) continue

      const { data: existing } = await serviceClient
        .from("promoter_channels")
        .select("id")
        .eq("promoter_id", promoterId)
        .eq("platform_id", ch.platform_id)
        .maybeSingle()

      if (!ch.member_id?.trim()) {
        // Empty member_id: delete existing record
        if (existing) {
          await serviceClient
            .from("promoter_channels")
            .delete()
            .eq("id", existing.id)
        }
        continue
      }

      if (existing) {
        await serviceClient
          .from("promoter_channels")
          .update({ member_id: ch.member_id.trim() })
          .eq("id", existing.id)
      } else {
        await serviceClient.from("promoter_channels").insert({
          promoter_id: promoterId,
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
