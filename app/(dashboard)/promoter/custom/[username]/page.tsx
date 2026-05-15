"use client"

import { PromoterGuard } from "@/components/auth/PromoterGuard"
// @ts-ignore — Next.js page.tsx works at runtime
import CustomProductsPage from "../page"

export default function Page() {
  return (
    <PromoterGuard>
      <CustomProductsPage />
    </PromoterGuard>
  )
}
