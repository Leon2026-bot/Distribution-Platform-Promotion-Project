import { MetadataRoute } from "next"
import { supabaseAdmin } from "@/lib/supabase/admin"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

  // ── Fetch all dynamic routes from Supabase ───────────────────────
  const [
    { data: products },
    { data: blogs },
    { data: categories },
    { data: brands },
    { data: partners },
  ] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .limit(5000),

    supabaseAdmin
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .limit(5000),

    supabaseAdmin
      .from("categories")
      .select("slug, created_at")
      .eq("status", "active")
      .limit(5000),

    supabaseAdmin
      .from("brands")
      .select("slug, updated_at")
      .eq("status", "active")
      .limit(5000),

    supabaseAdmin
      .from("agent_platforms")
      .select("slug, updated_at")
      .eq("is_active", true)
      .limit(5000),
  ])

  // ── Static routes ────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/partners`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ]

  // ── Dynamic routes ───────────────────────────────────────────────
  const productRoutes: MetadataRoute.Sitemap =
    products?.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? []

  const blogRoutes: MetadataRoute.Sitemap =
    blogs?.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })) ?? []

  const categoryRoutes: MetadataRoute.Sitemap =
    categories?.map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: c.created_at ? new Date(c.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })) ?? []

  const brandRoutes: MetadataRoute.Sitemap =
    brands?.map((b) => ({
      url: `${baseUrl}/brand/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })) ?? []

  const partnerRoutes: MetadataRoute.Sitemap =
    partners?.map((p) => ({
      url: `${baseUrl}/partners/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })) ?? []

  return [
    ...staticRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...categoryRoutes,
    ...brandRoutes,
    ...partnerRoutes,
  ]
}
