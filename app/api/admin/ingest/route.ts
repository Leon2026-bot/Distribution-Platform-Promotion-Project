import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * POST /api/admin/ingest
 * Ingest a single product from crawler
 *
 * Auth: Bearer token via INGEST_SECRET_TOKEN env var
 *
 * Body: {
 *   source_type: "taobao" | "1688" | "weidian" | "manual"
 *   source_item_id: string
 *   source_url?: string
 *   title: string
 *   title_zh?: string
 *   description?: string
 *   description_zh?: string
 *   price_cny: number
 *   price_usd?: number
 *   images: string[]
 *   brand?: string
 *   category: string
 *   sizes?: object
 *   colors?: string[]
 *   tags?: string[]
 *   seo_title?: string
 *   seo_description?: string
 *   is_active?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  const expectedToken = process.env.INGEST_SECRET_TOKEN

  if (!expectedToken) {
    return NextResponse.json({ error: "INGEST_SECRET_TOKEN not configured" }, { status: 500 })
  }

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    // ── Validate required fields ────────────────────────────────────
    const { source_type, source_item_id, title, price_cny, images } = body

    if (!source_type || !source_item_id || !title || price_cny == null) {
      return NextResponse.json(
        { error: "Missing required fields: source_type, source_item_id, title, price_cny" },
        { status: 400 }
      )
    }

    if (!["taobao", "1688", "weidian", "manual"].includes(source_type)) {
      return NextResponse.json(
        { error: "source_type must be one of: taobao, 1688, weidian, manual" },
        { status: 400 }
      )
    }

    // ── Generate slug ────────────────────────────────────────────────
    const generateSlug = (title: string, brand: string | undefined, itemId: string) => {
      const base = `${brand ? brand + "-" : ""}${title}`
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80)
        .replace(/-$/, "")
      return `${base}-${itemId.slice(-6)}`
    }

    const slug = body.slug || generateSlug(title, body.brand, source_item_id)

    // ── Upsert product ───────────────────────────────────────────────
    const productData = {
      source_type,
      source_item_id,
      source_url: body.source_url ?? null,
      title,
      title_zh: body.title_zh ?? null,
      description: body.description ?? null,
      description_zh: body.description_zh ?? null,
      price_cny: parseFloat(price_cny),
      price_usd: body.price_usd ? parseFloat(body.price_usd) : null,
      images: Array.isArray(images) ? images : [],
      original_images: Array.isArray(images) ? images : [],
      brand: body.brand ?? null,
      category: body.category ?? "Uncategorized",
      slug,
      sizes: body.sizes ?? null,
      colors: body.colors ?? null,
      tags: body.tags ?? null,
      seo_title: body.seo_title ?? null,
      seo_description: body.seo_description ?? null,
      is_active: body.is_active !== false,
      updated_at: new Date().toISOString(),
    }

    // Try insert first; on conflict (source_type, source_item_id) update
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id, slug, seo_title, seo_description")
      .eq("source_type", source_type)
      .eq("source_item_id", source_item_id)
      .single()

    let status: "created" | "updated"
    let productId: string

    if (existing) {
      // Update — preserve manually edited SEO fields
      const updateData = {
        ...productData,
        slug: existing.slug, // Keep existing slug
        seo_title: existing.seo_title || productData.seo_title,
        seo_description: existing.seo_description || productData.seo_description,
      }

      const { error } = await supabaseAdmin
        .from("products")
        .update(updateData)
        .eq("id", existing.id)

      if (error) {
        console.error("[ingest] update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      productId = existing.id
      status = "updated"
    } else {
      // Insert new
      const { data: inserted, error } = await supabaseAdmin
        .from("products")
        .insert(productData)
        .select("id")
        .single()

      if (error) {
        // Slug conflict — add random suffix and retry
        if (error.code === "23505") {
          const retriedData = {
            ...productData,
            slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
          }
          const { data: retried, error: retryErr } = await supabaseAdmin
            .from("products")
            .insert(retriedData)
            .select("id")
            .single()

          if (retryErr) {
            return NextResponse.json({ error: retryErr.message }, { status: 500 })
          }

          productId = retried!.id
          status = "created"
        } else {
          console.error("[ingest] insert error:", error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      } else {
        productId = inserted!.id
        status = "created"
      }
    }

    // ── Sync brand to brands table ───────────────────────────────────
    if (body.brand) {
      const brandSlug = body.brand
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")

      await supabaseAdmin
        .from("brands")
        .upsert(
          { name: body.brand, slug: brandSlug, status: "active" },
          { onConflict: "slug" }
        )
    }

    return NextResponse.json({ status, product_id: productId }, { status: status === "created" ? 201 : 200 })
  } catch (err) {
    console.error("[ingest] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
