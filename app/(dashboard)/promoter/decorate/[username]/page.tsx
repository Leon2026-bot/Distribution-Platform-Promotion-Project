"use client"

import { PromoterGuard } from "@/components/auth/PromoterGuard"
// @ts-ignore — Next.js page.tsx works at runtime
import DecoratePage from "../page"

export default function Page() {
  return (
    <PromoterGuard>
      <DecoratePage />
    </PromoterGuard>
  )
}
