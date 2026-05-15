"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setError("Not authenticated")
        return
      }
      const { data, error: err } = await supabase
        .from("promoters")
        .select("username")
        .eq("user_id", user.id)
        .single()

      if (cancelled) return
      if (err || !data?.username) {
        setError("Failed to load promoter profile")
        return
      }
      // Redirect to the username-specific dashboard
      router.replace(`/promoter/dashboard/${data.username}`)
    }

    load()
    return () => { cancelled = true }
  }, [supabase, router])

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

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
