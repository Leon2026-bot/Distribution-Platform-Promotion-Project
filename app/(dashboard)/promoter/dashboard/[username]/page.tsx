"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PromoterDashboard } from "@/components/dashboard/PromoterDashboard"

export default function DashboardPage() {
  const params = useParams()
  const urlUsername = params.username as string
  const [verifiedUsername, setVerifiedUsername] = useState<string>("")
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setError("Not authenticated")
        return
      }
      supabase
        .from("promoters")
        .select("username")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.username) {
            if (data.username !== urlUsername) {
              setError("Access denied: username mismatch")
              return
            }
            setVerifiedUsername(data.username)
          }
        })
    })
  }, [supabase, urlUsername])

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  if (!verifiedUsername) {
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

  return <PromoterDashboard username={verifiedUsername} />
}
