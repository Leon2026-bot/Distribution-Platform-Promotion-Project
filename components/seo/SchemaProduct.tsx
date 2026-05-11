import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]
type AgentPlatform = Database["public"]["Tables"]["agent_platforms"]["Row"]

interface SchemaProductProps {
  product: Product
  platforms: AgentPlatform[]
}

export function SchemaProduct({ product, platforms }: SchemaProductProps) {
  const activePlatforms = platforms.filter((p) => p.is_active)

  const images = product.images
    ?.map((img) =>
      img.startsWith("http")
        ? img
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${img}`
    )
    ?.slice(0, 5)

  const priceUsd = product.price_usd ?? product.price_cny / 7.2

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.seo_title || product.title,
    image: images?.length ? images : undefined,
    description: product.seo_description || product.description || undefined,
    sku: product.source_item_id || undefined,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: priceUsd.toFixed(2),
      highPrice: priceUsd.toFixed(2),
      priceCurrency: "USD",
      offerCount: activePlatforms.length,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
