import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

/* ── POST: seed initial data ──────────────────────────────── */
export async function POST() {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const results: Record<string, { inserted: number; skipped: number }> = {}

    // ── 1. Seed agent platforms ──────────────────────────────
    const platforms = [
      {
        name: "Kakobuy",
        slug: "kakobuy",
        logo_url: "kakobuy-logo.png",
        website_url: "https://kakobuy.com",
        fee_description: "0% service fee. QC photos included.",
        supported_sources: ["taobao", "1688", "weidian"],
        site_promo_code: "KAKO2026",
        jump_url_template: "https://kakobuy.com/item?url={source_url}&promo={promo_code}",
        is_active: true,
        display_order: 1,
      },
      {
        name: "CNFans",
        slug: "cnfans",
        logo_url: "cnfans-logo.png",
        website_url: "https://cnfans.com",
        fee_description: "3% service fee. Free QC for orders over $50.",
        supported_sources: ["taobao", "1688"],
        site_promo_code: "CNFANS2026",
        jump_url_template: "https://cnfans.com/product/{source_item_id}?ref={promo_code}",
        is_active: true,
        display_order: 2,
      },
      {
        name: "OwnPanda",
        slug: "ownpanda",
        logo_url: "ownpanda-logo.png",
        website_url: "https://ownpanda.com",
        fee_description: "5% service fee. Premium QC with 4K photos.",
        supported_sources: ["taobao", "1688", "weidian", "tmall"],
        site_promo_code: "PANDA2026",
        jump_url_template: "https://ownpanda.com/buy?item={source_item_id}&code={promo_code}",
        is_active: true,
        display_order: 3,
      },
      {
        name: "Fishgoo",
        slug: "fishgoo",
        logo_url: "fishgoo-logo.png",
        website_url: "https://fishgoo.com",
        fee_description: "2% service fee. Fast shipping to US/EU.",
        supported_sources: ["taobao", "1688"],
        site_promo_code: "FISH2026",
        jump_url_template: "https://fishgoo.com/item/{source_item_id}?promo={promo_code}",
        is_active: true,
        display_order: 4,
      },
      {
        name: "Superbuy",
        slug: "superbuy",
        logo_url: "superbuy-logo.png",
        website_url: "https://superbuy.com",
        fee_description: "4% service fee. 24/7 customer support.",
        supported_sources: ["taobao", "1688", "weidian", "tmall", "jd"],
        site_promo_code: "SUPER2026",
        jump_url_template: "https://superbuy.com/en/page/buy/?url={source_url}&nTag={promo_code}",
        is_active: true,
        display_order: 5,
      },
    ]

    let platInserted = 0
    let platSkipped = 0
    for (const p of platforms) {
      const { data: existing } = await supabase
        .from("agent_platforms")
        .select("id")
        .eq("slug", p.slug)
        .maybeSingle()

      if (existing) {
        platSkipped++
      } else {
        const { error } = await supabase.from("agent_platforms").insert(p)
        if (!error) platInserted++
      }
    }
    results.platforms = { inserted: platInserted, skipped: platSkipped }

    // ── 2. Seed categories ───────────────────────────────────
    const categories = [
      { name: "Sneakers", slug: "sneakers" },
      { name: "Clothing", slug: "clothing" },
      { name: "Electronics", slug: "electronics" },
      { name: "Accessories", slug: "accessories" },
      { name: "Home & Living", slug: "home-living" },
    ]

    let catInserted = 0
    let catSkipped = 0
    for (const c of categories) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", c.slug)
        .maybeSingle()

      if (existing) {
        catSkipped++
      } else {
        const { error } = await supabase.from("categories").insert({ ...c, status: "active" })
        if (!error) catInserted++
      }
    }
    results.categories = { inserted: catInserted, skipped: catSkipped }

    // ── 3. Seed brands ───────────────────────────────────────
    const brands = [
      { name: "Nike", slug: "nike" },
      { name: "Adidas", slug: "adidas" },
      { name: "Balenciaga", slug: "balenciaga" },
      { name: "Gucci", slug: "gucci" },
      { name: "Supreme", slug: "supreme" },
    ]

    let brandInserted = 0
    let brandSkipped = 0
    for (const b of brands) {
      const { data: existing } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", b.slug)
        .maybeSingle()

      if (existing) {
        brandSkipped++
      } else {
        const { error } = await supabase.from("brands").insert({ ...b, status: "active" })
        if (!error) brandInserted++
      }
    }
    results.brands = { inserted: brandInserted, skipped: brandSkipped }

    // ── 4. Seed products ─────────────────────────────────────
    const { data: platformsData } = await supabase
      .from("agent_platforms")
      .select("id, slug")
      .eq("is_active", true)

    const products = [
      {
        title: "Nike Dunk Low Retro White Black",
        slug: "nike-dunk-low-retro-white-black",
        price_cny: 699,
        price_usd: 97.08,
        brand: "Nike",
        category: "sneakers",
        images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400"],
        source_type: "taobao",
        source_item_id: "12345678901",
        source_url: "https://item.taobao.com/item.htm?id=12345678901",
        tags: ["sneakers", "nike", "dunk", "trending"],
        colors: ["white", "black"],
        is_active: true,
        is_featured: true,
        seo_title: "Nike Dunk Low Retro White Black – Buy from China | Finds Engine",
        seo_description: "Buy Nike Dunk Low Retro White Black from China via trusted agents. Compare prices and fees.",
      },
      {
        title: "Adidas Yeezy Boost 350 V2",
        slug: "adidas-yeezy-boost-350-v2",
        price_cny: 1299,
        price_usd: 180.42,
        brand: "Adidas",
        category: "sneakers",
        images: ["https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=400"],
        source_type: "taobao",
        source_item_id: "12345678902",
        source_url: "https://item.taobao.com/item.htm?id=12345678902",
        tags: ["sneakers", "adidas", "yeezy", "boost"],
        colors: ["black", "red"],
        is_active: true,
        is_featured: true,
        seo_title: "Adidas Yeezy Boost 350 V2 – Buy from China | Finds Engine",
        seo_description: "Buy Adidas Yeezy Boost 350 V2 from China. Best prices via Kakobuy, CNFans, and more.",
      },
      {
        title: "Supreme Box Logo Hoodie",
        slug: "supreme-box-logo-hoodie",
        price_cny: 899,
        price_usd: 124.86,
        brand: "Supreme",
        category: "clothing",
        images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"],
        source_type: "taobao",
        source_item_id: "12345678903",
        source_url: "https://item.taobao.com/item.htm?id=12345678903",
        tags: ["clothing", "supreme", "hoodie", "streetwear"],
        colors: ["black", "grey", "red"],
        is_active: true,
        is_featured: false,
        seo_title: "Supreme Box Logo Hoodie – Buy from China | Finds Engine",
        seo_description: "Buy Supreme Box Logo Hoodie from China. Authentic quality via trusted agents.",
      },
      {
        title: "Balenciaga Triple S Sneakers",
        slug: "balenciaga-triple-s-sneakers",
        price_cny: 2899,
        price_usd: 402.64,
        brand: "Balenciaga",
        category: "sneakers",
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"],
        source_type: "1688",
        source_item_id: "12345678904",
        source_url: "https://detail.1688.com/offer/12345678904.html",
        tags: ["sneakers", "balenciaga", "luxury", "dad-shoes"],
        colors: ["white", "black", "multi"],
        is_active: true,
        is_featured: true,
        seo_title: "Balenciaga Triple S Sneakers – Buy from China | Finds Engine",
        seo_description: "Buy Balenciaga Triple S from China at the best prices. Compare agent fees and shipping.",
      },
      {
        title: "Gucci Marmont Belt",
        slug: "gucci-marmont-belt",
        price_cny: 1599,
        price_usd: 222.08,
        brand: "Gucci",
        category: "accessories",
        images: ["https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400"],
        source_type: "taobao",
        source_item_id: "12345678905",
        source_url: "https://item.taobao.com/item.htm?id=12345678905",
        tags: ["accessories", "gucci", "belt", "luxury"],
        colors: ["black", "brown"],
        is_active: true,
        is_featured: false,
        seo_title: "Gucci Marmont Belt – Buy from China | Finds Engine",
        seo_description: "Buy Gucci Marmont Belt from China. Authentic quality via trusted shopping agents.",
      },
      {
        title: "Wireless Earbuds Pro",
        slug: "wireless-earbuds-pro",
        price_cny: 199,
        price_usd: 27.64,
        brand: "",
        category: "electronics",
        images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400"],
        source_type: "1688",
        source_item_id: "12345678906",
        source_url: "https://detail.1688.com/offer/12345678906.html",
        tags: ["electronics", "earbuds", "wireless", "audio"],
        colors: ["white", "black"],
        is_active: true,
        is_featured: false,
        seo_title: "Wireless Earbuds Pro – Buy from China | Finds Engine",
        seo_description: "Buy high-quality wireless earbuds from China. Great prices via trusted agents.",
      },
    ]

    let prodInserted = 0
    let prodSkipped = 0
    for (const p of products) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", p.slug)
        .maybeSingle()

      if (existing) {
        prodSkipped++
      } else {
        const { error } = await supabase.from("products").insert(p)
        if (!error) prodInserted++
      }
    }
    results.products = { inserted: prodInserted, skipped: prodSkipped }

    // ── 5. Seed blog posts ───────────────────────────────────
    const blogPosts = [
      {
        title: "How to Buy from Taobao in 2026: A Complete Guide",
        slug: "how-to-buy-from-taobao-2026",
        content: `# How to Buy from Taobao in 2026

Taobao is China's largest online marketplace with millions of products at unbeatable prices. For international buyers, navigating Taobao can be challenging due to the language barrier and shipping restrictions.

## Why Use a Shopping Agent?

Shopping agents act as intermediaries between you and Chinese sellers. They handle:

- **Communication** with sellers in Chinese
- **Quality Control** (QC) photos before shipping
- **Consolidation** of multiple orders into one shipment
- **International Shipping** to your doorstep

## Step-by-Step Guide

1. Find your product on Taobao or 1688
2. Copy the item URL
3. Paste it into your chosen agent's website
4. Review the QC photos
5. Ship to your address

## Best Agents in 2026

Compare agents on our [platform comparison page](/partners) to find the best fees and shipping options for your needs.
`,
        excerpt: "Learn how to buy from Taobao using shopping agents. Complete guide for international buyers in 2026.",
        status: "published",
        is_ai_generated: false,
        focus_keyword: "buy from taobao",
        seo_title: "How to Buy from Taobao in 2026: Complete Guide | Finds Engine",
        seo_description: "Step-by-step guide to buying from Taobao using shopping agents. Compare fees, shipping, and QC services.",
        tags: ["taobao", "guide", "shopping-agent", "2026"],
      },
      {
        title: "Top 10 Sneakers to Buy from China in 2026",
        slug: "top-10-sneakers-china-2026",
        content: `# Top 10 Sneakers to Buy from China in 2026

China is the sneaker capital of the world. From authentic releases to high-quality replicas, you can find incredible deals.

## 1. Nike Dunk Low Retro
The classic silhouette that never goes out of style.

## 2. Adidas Yeezy Boost 350 V2
Kanye's iconic design remains hugely popular.

## 3. Balenciaga Triple S
The dad shoe trend continues strong.

## 4. Air Jordan 1 High
A timeless classic for any collection.

## 5. New Balance 550
The retro basketball shoe making a comeback.

Compare prices across all major agents on Finds Engine.
`,
        excerpt: "Discover the hottest sneakers to buy from China in 2026. Compare prices across agents.",
        status: "published",
        is_ai_generated: true,
        focus_keyword: "sneakers china",
        seo_title: "Top 10 Sneakers to Buy from China in 2026 | Finds Engine",
        seo_description: "Best sneakers to buy from China. Compare prices, fees, and shipping across top agents.",
        tags: ["sneakers", "nike", "adidas", "trending", "2026"],
      },
      {
        title: "Comparing Taobao Agents: Kakobuy vs CNFans vs Fishgoo",
        slug: "comparing-taobao-agents-kakobuy-cnfans-fishgoo",
        content: `# Comparing Taobao Agents: Kakobuy vs CNFans vs Fishgoo

Choosing the right shopping agent can save you hundreds of dollars. Here's how the top platforms compare.

## Service Fees

| Agent | Fee | QC Photos | Shipping |
|-------|-----|-----------|----------|
| Kakobuy | 0% | Free | EMS, DHL |
| CNFans | 3% | Free >$50 | EMS, DHL, UPS |
| Fishgoo | 2% | Paid | EMS, DHL, FedEx |

## Which One Should You Choose?

- **Kakobuy**: Best for budget buyers, zero fees
- **CNFans**: Best balance of fees and service
- **Fishgoo**: Best for fast shipping to EU/US

Read our full comparison on the [agents page](/partners).
`,
        excerpt: "Detailed comparison of Kakobuy, CNFans, and Fishgoo. Fees, shipping, and QC services compared.",
        status: "published",
        is_ai_generated: false,
        focus_keyword: "taobao agents comparison",
        seo_title: "Kakobuy vs CNFans vs Fishgoo 2026 Comparison | Finds Engine",
        seo_description: "Compare Kakobuy, CNFans, and Fishgoo side by side. Fees, shipping, QC, and payment methods reviewed.",
        tags: ["agents", "comparison", "kakobuy", "cnfans", "fishgoo"],
      },
    ]

    let blogInserted = 0
    let blogSkipped = 0
    for (const b of blogPosts) {
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", b.slug)
        .maybeSingle()

      if (existing) {
        blogSkipped++
      } else {
        const { error } = await supabase.from("blog_posts").insert({
          ...b,
          published_at: new Date().toISOString(),
        })
        if (!error) blogInserted++
      }
    }
    results.blog_posts = { inserted: blogInserted, skipped: blogSkipped }

    // ── 6. Seed site_settings ────────────────────────────────
    const { data: settingsExist } = await supabase
      .from("site_settings" as any)
      .select("id")
      .eq("id", 1)
      .maybeSingle()

    if (!settingsExist) {
      await supabase.from("site_settings" as any).insert({
        id: 1,
        site_name: "Finds Engine",
        site_description: "Find & Buy Anything from China",
        registration_open: true,
      })
      results.site_settings = { inserted: 1, skipped: 0 }
    } else {
      results.site_settings = { inserted: 0, skipped: 1 }
    }

    return NextResponse.json({
      success: true,
      message: "Seed data inserted successfully",
      results,
    })
  } catch (err: any) {
    console.error("Seed error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
