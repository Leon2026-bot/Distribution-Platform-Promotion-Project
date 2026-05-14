"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type AgentPlatform = Database["public"]["Tables"]["agent_platforms"]["Row"]

interface ChannelConfig {
  platform_id: string
  member_id: string
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [platforms, setPlatforms] = useState<AgentPlatform[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Account
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")

  // Step 2: Profile
  const [bio, setBio] = useState("")

  // Step 3: Channels
  const [channels, setChannels] = useState<ChannelConfig[]>([])

  // Fetch platforms on mount
  useEffect(() => {
    supabase
      .from("agent_platforms")
      .select("*")
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) {
          setPlatforms(data)
          setChannels(
            data.map((p) => ({ platform_id: p.id, member_id: "" }))
          )
        }
      })
  }, [supabase])

  // Validate username
  const usernameError = (() => {
    if (!username) return "Username is required"
    if (username.length < 3) return "Minimum 3 characters"
    if (username.length > 30) return "Maximum 30 characters"
    if (!/^[a-zA-Z0-9-]+$/.test(username)) return "Only letters, numbers, hyphens"
    return ""
  })()

  const passwordError = (() => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Minimum 8 characters"
    if (!/[a-zA-Z]/.test(password)) return "Must contain a letter"
    if (!/[0-9]/.test(password)) return "Must contain a number"
    return ""
  })()

  const canProceedStep1 =
    email &&
    !usernameError &&
    !passwordError &&
    displayName.length >= 1

  // Check username uniqueness
  const checkUsername = async () => {
    const { data } = await supabase
      .from("promoters")
      .select("username")
      .eq("username", username)
      .single()

    if (data) {
      toast.error("Username already taken")
      return false
    }
    return true
  }

  const handleSignUp = async () => {
    setIsLoading(true)

    const usernameAvailable = await checkUsername()
    if (!usernameAvailable) {
      setIsLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    // Create or update promoter profile
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase
        .from("promoters")
        .upsert({
          user_id: userData.user.id,
          username,
          display_name: displayName,
          bio,
        }, { onConflict: "user_id" })
    }

    // Save channels
    const validChannels = channels.filter((c) => c.member_id.trim())
    if (validChannels.length > 0 && userData.user) {
      const { data: promoter } = await supabase
        .from("promoters")
        .select("id")
        .eq("user_id", userData.user.id)
        .single()

      if (promoter) {
        await supabase.from("promoter_channels").insert(
          validChannels.map((c) => ({
            promoter_id: promoter.id,
            platform_id: c.platform_id,
            member_id: c.member_id.trim(),
            is_active: true,
          }))
        )
      }
    }

    toast.success("Account created! Welcome aboard.")
    setIsLoading(false)
    setStep(4)
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Create Account</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Step {step} of 3 — {step === 1 ? "Account" : step === 2 ? "Profile" : "Channels"}
        </p>
      </div>

      {/* Step 1: Account */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="your-username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              required
            />
            {username && usernameError && (
              <p className="text-xs text-red-500">{usernameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars, letter + number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={!canProceedStep1}
            onClick={() => setStep(2)}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Step 2: Profile */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Channels */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">
            Add your Member IDs to earn commissions. You can skip and configure later.
          </p>

          {platforms.map((platform, idx) => (
            <div key={platform.id} className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm">
                {platform.logo_url ? (
                  <img
                    src={
                      platform.logo_url.startsWith("http")
                        ? platform.logo_url
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/partners/${platform.logo_url}`
                    }
                    alt={platform.name}
                    className="h-4 w-auto object-contain"
                  />
                ) : null}
                {platform.name}
                {channels[idx]?.member_id?.trim() ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-amber-500">⚠</span>
                )}
              </Label>
              <Input
                placeholder={`Your ${platform.name} Member ID`}
                value={channels[idx]?.member_id || ""}
                onChange={(e) => {
                  const updated = [...channels]
                  updated[idx] = { ...updated[idx], member_id: e.target.value }
                  setChannels(updated)
                }}
              />
            </div>
          ))}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full text-xs text-zinc-400"
            onClick={handleSignUp}
            disabled={isLoading}
          >
            Skip for now
          </Button>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="space-y-4 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-bold text-zinc-900">All set!</h2>
          <p className="text-sm text-zinc-500">
            Your account has been created. Redirecting to dashboard...
          </p>
          <Button className="w-full" onClick={() => router.push("/promoter/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      )}

      {step < 4 && (
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  )
}
