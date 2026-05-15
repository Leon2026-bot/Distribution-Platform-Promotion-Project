"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PromoterDashboard } from "@/components/dashboard/PromoterDashboard"

export default function DashboardPage() {
  const [username, setUsername] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("promoters")
          .select("username")
          .eq("user_id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.username) {
              setUsername(data.username)
            }
          })
      }
    })
  }, [supabase])

  if (!username) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      </div>
    )
  }

  return <PromoterDashboard username={username} />
}
