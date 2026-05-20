"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { User, Upload, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface ShopConfig {
  display_name: string
  bio: string
  banner_text: string
  banner_subtitle: string
  banner_color: string
  avatar_url: string
  banner_image_url: string
}

export default function DecoratePage() {
  const [config, setConfig] = useState<ShopConfig>({
    display_name: "",
    bio: "",
    banner_text: "",
    banner_subtitle: "",
    banner_color: "#f4f4f5",
    avatar_url: "",
    banner_image_url: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

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

  const handleUpload = async (file: File, field: "avatar_url" | "banner_image_url") => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB")
      return
    }
    setUploading(field)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("field", field)
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        setConfig((prev) => ({ ...prev, [field]: data.url }))
        toast.success("Image uploaded!")
      } else {
        toast.error("Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(null)
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
        {/* Avatar Upload */}
        <div className="space-y-2">
          <Label>Shop Avatar</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-2 ring-zinc-200">
              {config.avatar_url ? (
                <img src={config.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-zinc-400">
                  {(config.display_name || "S").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <input
                ref={avatarRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload(f, "avatar_url")
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => avatarRef.current?.click()}
                disabled={uploading === "avatar_url"}
              >
                {uploading === "avatar_url" ? (
                  <Loader2 className="mr-1 size-3 animate-spin" />
                ) : (
                  <Upload className="mr-1 size-3" />
                )}
                Upload Avatar
              </Button>
              <p className="mt-1 text-[10px] text-zinc-400">PNG, JPG, SVG, WebP. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Banner Image Upload */}
        <div className="space-y-2">
          <Label>Banner Cover Image</Label>
          <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center">
            {config.banner_image_url ? (
              <div className="relative">
                <img src={config.banner_image_url} alt="Banner" className="mx-auto max-h-32 rounded-md object-cover" />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => bannerRef.current?.click()}
                  disabled={uploading === "banner_image_url"}
                >
                  {uploading === "banner_image_url" ? (
                    <Loader2 className="mr-1 size-3 animate-spin" />
                  ) : (
                    <Upload className="mr-1 size-3" />
                  )}
                  Change
                </Button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto size-8 text-zinc-300" />
                <p className="mt-2 text-xs text-zinc-400">Upload a banner cover image</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => bannerRef.current?.click()}
                  disabled={uploading === "banner_image_url"}
                >
                  {uploading === "banner_image_url" ? (
                    <Loader2 className="mr-1 size-3 animate-spin" />
                  ) : (
                    <Upload className="mr-1 size-3" />
                  )}
                  Upload Image
                </Button>
              </div>
            )}
            <input
              ref={bannerRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleUpload(f, "banner_image_url")
              }}
            />
          </div>
        </div>

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
              <div className="mx-auto flex size-14 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                {config.avatar_url ? (
                  <img src={config.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : config.display_name ? (
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
