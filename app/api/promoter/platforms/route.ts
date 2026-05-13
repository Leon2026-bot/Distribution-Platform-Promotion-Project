import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const { data: platforms, error } = await supabaseAdmin
    .from("agent_platforms")
    .select("id, name, logo_url, website_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ platforms: platforms ?? [] })
}
