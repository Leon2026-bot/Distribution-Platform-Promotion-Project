import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const search = searchParams.get("search")

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ products: data, total: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 })
  }
}
