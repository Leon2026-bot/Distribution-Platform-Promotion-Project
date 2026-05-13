"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface ShopConfig {
  display_name: string
  bio: string
  banner_text: string
  banner_subtitle: string
  banner_color: string
}

export default function DecoratePage() {
  const [config, setConfig] = useState<ShopConfig>({
    display_name: "",
    bio: "",
    banner_text: "",
    banner_subtitle: "",
    banner_color: "#f4f4f5",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/promoter/shop-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig(data.config)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/promoter/shop-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      })

      if (res.ok) {
        toast.success("Shop updated")
      } else {
        toast.error("Failed to save")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Shop Decoration</h1>
        <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Shop Decoration</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Customize how your shop looks to visitors.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={config.display_name}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, display_name: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={3}
            value={config.bio}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, bio: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_text">Banner Text</Label>
          <Input
            id="banner_text"
            value={config.banner_text}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, banner_text: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_subtitle">Banner Subtitle</Label>
          <Input
            id="banner_subtitle"
            value={config.banner_subtitle}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                banner_subtitle: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_color">Banner Background Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.banner_color}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  banner_color: e.target.value,
                }))
              }
              className="h-10 w-16 rounded border border-zinc-200"
            />
            <Input
              value={config.banner_color}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  banner_color: e.target.value,
                }))
              }
              className="w-32"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="rounded-xl px-6 py-8 text-center"
            style={{ backgroundColor: config.banner_color }}
          >
            <h2 className="text-lg font-bold text-zinc-900">
              {config.banner_text || "Your Banner Text"}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {config.banner_subtitle || "Your banner subtitle"}
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}
