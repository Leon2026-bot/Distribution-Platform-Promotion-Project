"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    // Verify super_admin role
    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin =
      user?.user_metadata?.role === "super_admin" ||
      user?.app_metadata?.role === "super_admin"

    if (!isAdmin) {
      toast.error("Access denied. Admin only.")
      await supabase.auth.signOut()
      setIsLoading(false)
      return
    }

    toast.success("Welcome back, Admin!")
    router.push("/admin/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-zinc-900">
            <Shield className="size-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-900">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Super administrator access only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          This page is restricted to authorized administrators.
        </p>
      </div>
    </div>
  )
}
