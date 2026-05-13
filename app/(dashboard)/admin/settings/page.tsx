"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"

interface SiteSettings {
  site_name: string
  site_description: string
  logo_url: string
  favicon_url: string
  social_instagram: string
  social_twitter: string
  social_discord: string
  social_reddit: string
  registration_open: boolean
}

const defaultSettings: SiteSettings = {
  site_name: "Finds Engine",
  site_description: "Find & Buy Anything from China",
  logo_url: "",
  favicon_url: "",
  social_instagram: "",
  social_twitter: "",
  social_discord: "",
  social_reddit: "",
  registration_open: true,
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) setSettings({ ...defaultSettings, ...data })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      toast.success("Settings saved")
    } else {
      toast.error("Failed to save")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">Site Settings</h1>
        <div className="h-64 animate-pulse rounded bg-zinc-100" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Site Settings</h1>

      <div className="max-w-2xl space-y-6 rounded-lg border border-zinc-200 bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name</Label>
          <Input
            id="site_name"
            value={settings.site_name}
            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="site_description">Site Description</Label>
          <Textarea
            id="site_description"
            value={settings.site_description}
            onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon_url">Favicon URL</Label>
            <Input
              id="favicon_url"
              value={settings.favicon_url}
              onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Social Links</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Instagram URL"
              value={settings.social_instagram}
              onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
            />
            <Input
              placeholder="Twitter URL"
              value={settings.social_twitter}
              onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
            />
            <Input
              placeholder="Discord URL"
              value={settings.social_discord}
              onChange={(e) => setSettings({ ...settings, social_discord: e.target.value })}
            />
            <Input
              placeholder="Reddit URL"
              value={settings.social_reddit}
              onChange={(e) => setSettings({ ...settings, social_reddit: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="registration_open"
            checked={settings.registration_open}
            onCheckedChange={(checked) => setSettings({ ...settings, registration_open: checked })}
          />
          <Label htmlFor="registration_open">Open Registration</Label>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 size-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
