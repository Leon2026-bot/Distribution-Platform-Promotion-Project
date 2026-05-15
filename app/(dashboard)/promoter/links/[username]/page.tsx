"use client"

import { PromoterGuard } from "@/components/auth/PromoterGuard"
// @ts-ignore — Next.js page.tsx works at runtime
import LinksPage from "../page"

export default function Page() {
  return (
    <PromoterGuard>
      <LinksPage />
    </PromoterGuard>
  )
}
