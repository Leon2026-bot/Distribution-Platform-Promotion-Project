import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { checkPromoterAccess } from "@/lib/promoter-access"

export async function GET() {
  const access = await checkPromoterAccess("my_products")
  if (access.error) return access.error

  const serviceClient = createServiceClient()
  const promoterId = access.promoter!.id

  const { data: products } = await serviceClient
    .from("promoter_products")
    .select("*, product:product_id(title, brand, price_cny, images, slug)")
    .eq("promoter_id", promoterId)
    .eq("status", "active")
    .order("is_pinned", { ascending: false })
    .order("display_order", { ascending: true })

  return NextResponse.json({ products: products ?? [] })
}
