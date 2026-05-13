import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * GET /api/search?q={query}
 * Search products by title and log the query.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() ?? ""

    if (!q) {
      return NextResponse.json(
        { products: [], count: 0, query: "" },
        { status: 200 }
      )
    }

    const searchPattern = `%${q}%`

    const { data: products, error, count } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact" })
      .ilike("title", searchPattern)
      .eq("is_active", true)
      .limit(50)

    if (error) {
      console.error("[search] query error:", error)
      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      )
    }

    // Fire and forget: log search query
    void (async () => {
      try {
        await supabaseAdmin.from("search_logs").insert({
          search_query: q,
          result_count: count ?? (products?.length || 0),
        })
      } catch (err) {
        console.error("[search] log error:", err)
      }
    })()

    return NextResponse.json({
      products: products ?? [],
      count: count ?? 0,
      query: q,
    })
  } catch (err) {
    console.error("[search] error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
