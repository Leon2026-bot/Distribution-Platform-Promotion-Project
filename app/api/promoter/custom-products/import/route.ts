import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/* ── POST: CSV batch import custom products ────────────────── */
export async function POST(req: NextRequest) {
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

  const body = await req.json()
  const rows: Array<Record<string, unknown>> = body.rows ?? []

  if (!rows.length) {
    return NextResponse.json({ error: "No data provided" }, { status: 400 })
  }

  if (rows.length > 100) {
    return NextResponse.json(
      { error: "Maximum 100 rows per import" },
      { status: 400 }
    )
  }

  const records = rows.map((row) => ({
    promoter_id: promoter.id,
    product_type: "custom" as const,
    custom_name: String(row.name || "").trim(),
    custom_price: Number(row.price) || 0,
    custom_image: String(row.image_url || "").trim() || null,
    custom_url: String(row.product_url || "").trim() || null,
    custom_category: String(row.category || "").trim() || null,
    custom_tags: row.tags
      ? String(row.tags)
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : null,
    status: "active" as const,
  }))

  // Validate
  const invalid = records.filter((r) => !r.custom_name || r.custom_price <= 0)
  if (invalid.length > 0) {
    return NextResponse.json(
      {
        error: `Validation failed for ${invalid.length} row(s). Name and valid price are required.`,
        invalidCount: invalid.length,
      },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("promoter_products")
    .insert(records)
    .select()

  if (error) {
    console.error("CSV import error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    imported: data?.length ?? 0,
    products: data ?? [],
  })
}
