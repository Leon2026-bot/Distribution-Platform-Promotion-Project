"use client"

import { PromoterGuard } from "@/components/auth/PromoterGuard"
// @ts-ignore — Next.js page.tsx works at runtime
import SettingsPage from "../page"

export default function Page() {
  return (
    <PromoterGuard>
      <SettingsPage />
    </PromoterGuard>
  )
}
