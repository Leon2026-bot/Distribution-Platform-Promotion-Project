"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
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
          <Label className="flex items-center gap-2">
            Preview
            <span className="text-xs font-normal text-zinc-400">(scroll to see more)</span>
          </Label>
          <div className="max-h-[500px] overflow-y-auto rounded-xl border border-zinc-200 bg-white">
            {/* Banner */}
            <div
              className="px-6 py-10 text-center"
              style={{ backgroundColor: config.banner_color }}
            >
              <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                {config.banner_text || "Your Banner Text"}
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                {config.banner_subtitle || "Your banner subtitle"}
              </p>
            </div>

            {/* Shop Owner Info */}
            <div className="border-b border-zinc-100 bg-white px-6 py-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-100">
                {config.display_name ? (
                  <span className="text-lg font-bold text-zinc-600">
                    {config.display_name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="size-6 text-zinc-400" />
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900">
                {config.display_name || "Your Name"}&apos;s Shop
              </h3>
              {config.bio && (
                <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500">
                  {config.bio}
                </p>
              )}
            </div>

            {/* Product Grid Skeleton */}
            <div className="px-4 py-6 sm:px-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Curated Products
                </h4>
                <span className="text-xs text-zinc-400">View All →</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border border-zinc-100">
                    {/* Image placeholder */}
                    <div className="aspect-square bg-zinc-100" />
                    {/* Text placeholders */}
                    <div className="p-2 space-y-1.5">
                      <div className="h-3 w-3/4 rounded bg-zinc-100" />
                      <div className="h-3 w-1/2 rounded bg-zinc-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA placeholder */}
            <div className="px-4 pb-6 sm:px-6">
              <div className="rounded-xl bg-zinc-900 px-6 py-6 text-center">
                <p className="text-sm font-semibold text-white">
                  Want to start your own shop?
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Join as a promoter and earn commissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  )
}
