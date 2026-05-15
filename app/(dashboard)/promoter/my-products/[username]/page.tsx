"use client"

import { PromoterGuard } from "@/components/auth/PromoterGuard"
// @ts-ignore — Next.js page.tsx works at runtime
import MyProductsPage from "../page"

export default function Page() {
  return (
    <PromoterGuard>
      <MyProductsPage />
    </PromoterGuard>
  )
}
