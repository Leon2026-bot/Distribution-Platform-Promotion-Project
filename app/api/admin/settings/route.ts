import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("site_settings" as any)
      .select("*")
      .eq("id", 1)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json(data || {})
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
      .from("site_settings" as any)
      .upsert({
        id: 1,
        ...body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
