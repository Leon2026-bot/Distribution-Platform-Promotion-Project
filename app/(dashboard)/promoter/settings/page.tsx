"use client"

import { useEffect, useState } from "react"
import { Check, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface Platform {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
}

interface Channel {
  id: string
  platform_id: string | null
  member_id: string
  is_active: boolean | null
}

export default function SettingsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/promoter/platforms").then((r) => r.json()),
      fetch("/api/promoter/channels").then((r) => r.json()),
    ]).then(([platData, chanData]) => {
      setPlatforms(platData.platforms ?? [])
      setChannels(chanData.channels ?? [])
    })
  }, [])

  const getMemberId = (platformId: string) => {
    const ch = channels.find((c) => c.platform_id === platformId)
    return ch?.member_id ?? ""
  }

  const handleChange = (platformId: string, value: string) => {
    setChannels((prev) => {
      const existing = prev.find((c) => c.platform_id === platformId)
      if (existing) {
        return prev.map((c) =>
          c.platform_id === platformId ? { ...c, member_id: value } : c
        )
      }
      return [
        ...prev,
        {
          id: "",
          platform_id: platformId,
          member_id: value,
          is_active: true,
        },
      ]
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/promoter/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels }),
      })

      if (res.ok) {
        toast.success("Settings saved")
      } else {
        toast.error("Failed to save")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Channel Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add your Member IDs for each platform to earn commissions.
        </p>
      </div>

      <div className="space-y-6">
        {platforms.map((platform) => {
          const memberId = getMemberId(platform.id)
          const isConfigured = memberId.trim().length > 0

          return (
            <div key={platform.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  {platform.logo_url ? (
                    <img
                      src={
                        platform.logo_url.startsWith("http")
                          ? platform.logo_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/partners/${platform.logo_url}`
                      }
                      alt={platform.name}
                      className="h-5 w-auto object-contain"
                    />
                  ) : null}
                  {platform.name}
                  {isConfigured ? (
                    <span className="text-green-500">
                      <Check className="size-4" />
                    </span>
                  ) : (
                    <span className="text-amber-500">⚠</span>
                  )}
                </Label>
                {platform.website_url && (
                  <a
                    href={platform.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-zinc-600"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              <Input
                placeholder={`Your ${platform.name} Member ID`}
                value={memberId}
                onChange={(e) => handleChange(platform.id, e.target.value)}
              />
              <p className="text-xs text-zinc-400">
                {isConfigured
                  ? "Configured ✓"
                  : `Not configured. Add your ${platform.name} Member ID.`}
              </p>
            </div>
          )
        })}
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  )
}
