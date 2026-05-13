import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface IngestItem {
  source_type: string
  source_item_id: string
  source_url?: string
  title: string
  title_zh?: string
  description?: string
  description_zh?: string
  price_cny: number
  price_usd?: number
  images: string[]
  brand?: string
  category?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sizes?: any
  colors?: string[]
  tags?: string[]
  seo_title?: string
  seo_description?: string
  is_active?: boolean
  slug?: string
}

/**
 * POST /api/admin/ingest/batch
 * Ingest multiple products at once (max 100).
 *
 * Auth: Bearer token via INGEST_SECRET_TOKEN env var
 */
export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  const expectedToken = process.env.INGEST_SECRET_TOKEN

  if (!expectedToken) {
    return NextResponse.json(
      { error: "INGEST_SECRET_TOKEN not configured" },
      { status: 500 }
    )
  }

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array" },
        { status: 400 }
      )
    }

    if (body.length === 0) {
      return NextResponse.json(
        { error: "Array cannot be empty" },
        { status: 400 }
      )
    }

    if (body.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 items per batch" },
        { status: 400 }
      )
    }

    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      details: [] as Array<{ index: number; status: string; product_id?: string; error?: string }>,
    }

    // ── Process each item sequentially ────────────────────────────────
    for (let i = 0; i < body.length; i++) {
      const item: IngestItem = body[i]
      const detail: (typeof results.details)[number] = { index: i, status: "error" }

      // Basic validation
      if (!item.source_type || !item.source_item_id || !item.title || item.price_cny == null) {
        detail.error = "Missing required fields: source_type, source_item_id, title, price_cny"
        results.errors++
        results.details.push(detail)
        continue
      }

      if (!["taobao", "1688", "weidian", "manual"].includes(item.source_type)) {
        detail.error = "source_type must be one of: taobao, 1688, weidian, manual"
        results.errors++
        results.details.push(detail)
        continue
      }

      try {
        const slug =
          item.slug || generateSlug(item.title, item.brand, item.source_item_id)

        const productData = {
          source_type: item.source_type,
          source_item_id: item.source_item_id,
          source_url: item.source_url ?? null,
          title: item.title,
          title_zh: item.title_zh ?? null,
          description: item.description ?? null,
          description_zh: item.description_zh ?? null,
          price_cny: parseFloat(String(item.price_cny)),
          price_usd: item.price_usd ? parseFloat(String(item.price_usd)) : null,
          images: Array.isArray(item.images) ? item.images : [],
          original_images: Array.isArray(item.images) ? item.images : [],
          brand: item.brand ?? null,
          category: item.category ?? "Uncategorized",
          slug,
          sizes: item.sizes ?? null,
          colors: item.colors ?? null,
          tags: item.tags ?? null,
          seo_title: item.seo_title ?? null,
          seo_description: item.seo_description ?? null,
          is_active: item.is_active !== false,
          updated_at: new Date().toISOString(),
        }

        // Check existing
        const { data: existing } = await supabaseAdmin
          .from("products")
          .select("id, slug, seo_title, seo_description")
          .eq("source_type", item.source_type)
          .eq("source_item_id", item.source_item_id)
          .single()

        if (existing) {
          // Update
          const updateData = {
            ...productData,
            slug: existing.slug,
            seo_title: existing.seo_title || productData.seo_title,
            seo_description: existing.seo_description || productData.seo_description,
          }

          const { error } = await supabaseAdmin
            .from("products")
            .update(updateData)
            .eq("id", existing.id)

          if (error) {
            detail.error = error.message
            results.errors++
          } else {
            detail.status = "updated"
            detail.product_id = existing.id
            results.updated++
          }
        } else {
          // Insert new
          const { data: inserted, error } = await supabaseAdmin
            .from("products")
            .insert(productData)
            .select("id")
            .single()

          if (error) {
            if (error.code === "23505") {
              // Slug conflict — retry with suffix
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
                detail.error = retryErr.message
                results.errors++
              } else {
                detail.status = "created"
                detail.product_id = retried!.id
                results.created++
              }
            } else {
              detail.error = error.message
              results.errors++
            }
          } else {
            detail.status = "created"
            detail.product_id = inserted!.id
            results.created++
          }
        }

        // Sync brand
        if (item.brand) {
          const brandSlug = item.brand
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")

          await supabaseAdmin
            .from("brands")
            .upsert(
              { name: item.brand, slug: brandSlug, status: "active" },
              { onConflict: "slug" }
            )
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        detail.error = msg
        results.errors++
      }

      results.details.push(detail)
    }

    return NextResponse.json(results)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error"
    console.error("[ingest/batch] error:", err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function generateSlug(title: string, brand: string | undefined, itemId: string): string {
  const base = `${brand ? brand + "-" : ""}${title}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/-$/, "")
  return `${base}-${itemId.slice(-6)}`
}
