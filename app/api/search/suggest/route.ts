import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const serviceClient = createServiceClient()
  const suggestions: Array<{ type: "product" | "brand" | "category"; title: string; slug: string }> = []

  // Search products (top 3)
  const { data: products } = await serviceClient
    .from("products")
    .select("id, title, slug")
    .eq("is_active", true)
    .ilike("title", `%${q}%`)
    .limit(3)

  products?.forEach((p) => {
    suggestions.push({ type: "product", title: p.title, slug: p.slug })
  })

  // Search brands (top 3)
  const { data: brands } = await serviceClient
    .from("brands")
    .select("id, name, slug")
    .eq("status", "active")
    .ilike("name", `%${q}%`)
    .limit(3)

  brands?.forEach((b) => {
    suggestions.push({ type: "brand", title: b.name, slug: b.slug })
  })

  // Search categories (top 2)
  const { data: categories } = await serviceClient
    .from("categories")
    .select("id, name, slug")
    .eq("status", "active")
    .ilike("name", `%${q}%`)
    .limit(2)

  categories?.forEach((c) => {
    suggestions.push({ type: "category", title: c.name, slug: c.slug })
  })

  return NextResponse.json({ suggestions: suggestions.slice(0, 8) })
}
