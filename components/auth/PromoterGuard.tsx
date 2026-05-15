"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface PromoterGuardProps {
  children: ReactNode
}

export function PromoterGuard({ children }: PromoterGuardProps) {
  const params = useParams()
  const urlUsername = params.username as string | undefined
  const [state, setState] = useState<"loading" | "verified" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false

    async function verify() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return

      if (!user) {
        setErrorMsg("Not authenticated")
        setState("error")
        return
      }

      const username = user.user_metadata?.username as string | undefined

      if (!urlUsername) {
        setState("verified")
        return
      }

      if (username !== urlUsername) {
        setErrorMsg("Access denied: username mismatch")
        setState("error")
        return
      }

      setState("verified")
    }

    verify()
    return () => { cancelled = true }
  }, [urlUsername])

  if (state === "error") {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-red-500">{errorMsg}</p>
      </div>
    )
  }

  if (state === "loading") {
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

  return <>{children}</>
}
