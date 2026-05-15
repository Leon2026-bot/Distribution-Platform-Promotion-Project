"use client"

import { useParams } from "next/navigation"
import { PromoterGuard } from "@/components/auth/PromoterGuard"
// @ts-ignore — Next.js page.tsx works at runtime
import ProductsPage from "../page"

export default function Page() {
  return (
    <PromoterGuard>
      <ProductsPage />
    </PromoterGuard>
  )
}
