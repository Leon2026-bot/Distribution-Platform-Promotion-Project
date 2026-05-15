"use client"

import { useParams } from "next/navigation"
import { PromoterGuard } from "@/components/auth/PromoterGuard"
import { PromoterDashboard } from "@/components/dashboard/PromoterDashboard"

export default function DashboardPage() {
  const params = useParams()
  const username = params.username as string

  return (
    <PromoterGuard>
      <PromoterDashboard username={username} />
    </PromoterGuard>
  )
}
