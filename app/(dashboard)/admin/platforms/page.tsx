"use client"

import { useEffect, useState } from "react"
import { Globe, Pencil, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"

interface Platform {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website_url: string | null
  jump_url_template: string
  site_promo_code: string | null
  supported_sources: string[] | null
  fee_description: string | null
  display_order: number | null
  is_active: boolean | null
}

const emptyPlatform = {
  name: "",
  slug: "",
  logo_url: "",
  website_url: "",
  jump_url_template: "https://example.com/item/{item_id}?ref={member_id}",
  site_promo_code: "",
  supported_sources: [] as string[],
  fee_description: "",
  display_order: 0,
  is_active: true,
}

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Platform | null>(null)
  const [form, setForm] = useState(emptyPlatform)

  const fetchPlatforms = () => {
    fetch("/api/admin/platforms")
      .then((r) => r.json())
      .then((data) => {
        setPlatforms(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyPlatform)
    setDialogOpen(true)
  }

  const openEdit = (p: Platform) => {
    setEditing(p)
    setForm({
      name: p.name,
      slug: p.slug,
      logo_url: p.logo_url || "",
      website_url: p.website_url || "",
      jump_url_template: p.jump_url_template,
      site_promo_code: p.site_promo_code || "",
      supported_sources: p.supported_sources || [],
      fee_description: p.fee_description || "",
      display_order: p.display_order ?? 0,
      is_active: p.is_active ?? true,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editing ? `/api/admin/platforms/${editing.id}` : "/api/admin/platforms"
    const method = editing ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        supported_sources: form.supported_sources.filter(Boolean),
      }),
    })

    if (res.ok) {
      toast.success(editing ? "Platform updated" : "Platform created")
      setDialogOpen(false)
      fetchPlatforms()
    } else {
      const data = await res.json()
      toast.error(data.error || "Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return

    const res = await fetch(`/api/admin/platforms/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Platform deleted")
      fetchPlatforms()
    } else {
      toast.error("Failed to delete")
    }
  }

  const toggleSource = (source: string) => {
    setForm((prev) => ({
      ...prev,
      supported_sources: prev.supported_sources.includes(source)
        ? prev.supported_sources.filter((s) => s !== source)
        : [...prev.supported_sources, source],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Platforms</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add Platform
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-zinc-100" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Site Promo Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-400">
                    No platforms yet. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
              {platforms.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="size-6 rounded object-contain" />
                      ) : (
                        <Globe className="size-5 text-zinc-400" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">{p.slug}</TableCell>
                  <TableCell className="text-zinc-500">{p.site_promo_code || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Platform" : "Add Platform"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="e.g. kakobuy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jump_url_template">Jump URL Template *</Label>
              <Input
                id="jump_url_template"
                value={form.jump_url_template}
                onChange={(e) => setForm({ ...form, jump_url_template: e.target.value })}
                required
                placeholder="https://kakobuy.com/item/{item_id}?ref={member_id}"
              />
              <p className="text-xs text-zinc-400">Use {'{item_id}'} and {'{member_id}'} as placeholders</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_promo_code">Site Promo Code</Label>
                <Input
                  id="site_promo_code"
                  value={form.site_promo_code}
                  onChange={(e) => setForm({ ...form, site_promo_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supported Sources</Label>
              <div className="flex gap-3">
                {["taobao", "1688", "weidian"].map((source) => (
                  <label key={source} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={form.supported_sources.includes(source)}
                      onChange={() => toggleSource(source)}
                      className="rounded border-zinc-300"
                    />
                    {source}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee_description">Fee Description</Label>
              <Textarea
                id="fee_description"
                value={form.fee_description}
                onChange={(e) => setForm({ ...form, fee_description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save Changes" : "Create Platform"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
