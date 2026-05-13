"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    title_zh: "",
    slug: "",
    description: "",
    description_zh: "",
    price_cny: "",
    price_usd: "",
    brand: "",
    category: "",
    images: [] as string[],
    source_type: "manual",
    source_item_id: "",
    source_url: "",
    tags: "" as string,
    colors: "" as string,
    is_active: true,
    is_featured: false,
    seo_title: "",
    seo_description: "",
  })

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const addImage = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }))
  }

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }))
  }

  const updateImage = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === idx ? value : img)),
    }))
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price_cny: Number(form.price_cny) || 0,
          price_usd: form.price_usd ? Number(form.price_usd) : null,
          images: form.images.filter(Boolean),
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          colors: form.colors
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (res.ok) {
        toast.success("Product created")
        router.push("/admin/products")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-zinc-900">Add Product</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="space-y-4 lg:col-span-2">
          <div>
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                handleChange("title", e.target.value)
                if (!form.slug) handleChange("slug", generateSlug(e.target.value))
              }}
              placeholder="Product title"
            />
          </div>

          <div>
            <Label>Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="product-slug"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Price (CNY) *</Label>
              <Input
                type="number"
                value={form.price_cny}
                onChange={(e) => handleChange("price_cny", e.target.value)}
                placeholder="99.00"
              />
            </div>
            <div>
              <Label>Price (USD)</Label>
              <Input
                type="number"
                value={form.price_usd}
                onChange={(e) => handleChange("price_usd", e.target.value)}
                placeholder="13.75"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Brand</Label>
              <Input
                value={form.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                placeholder="Nike"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="clothing"
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Product description..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Images</Label>
            <div className="space-y-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    placeholder="https://... or filename.jpg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(idx)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addImage}>
                <Plus className="mr-1 size-3.5" />
                Add Image
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Source Type</Label>
              <Input
                value={form.source_type}
                onChange={(e) => handleChange("source_type", e.target.value)}
                placeholder="taobao / 1688 / manual"
              />
            </div>
            <div>
              <Label>Source Item ID</Label>
              <Input
                value={form.source_item_id}
                onChange={(e) => handleChange("source_item_id", e.target.value)}
                placeholder="123456789"
              />
            </div>
          </div>

          <div>
            <Label>Source URL</Label>
            <Input
              value={form.source_url}
              onChange={(e) => handleChange("source_url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Tags (comma separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="hot, new, limited"
              />
            </div>
            <div>
              <Label>Colors (comma separated)</Label>
              <Input
                value={form.colors}
                onChange={(e) => handleChange("colors", e.target.value)}
                placeholder="red, blue, black"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="mb-3 text-sm font-semibold">Status</h3>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Active</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => handleChange("is_active", v)}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Label className="text-sm">Featured</Label>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => handleChange("is_featured", v)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-100 p-4">
            <h3 className="mb-3 text-sm font-semibold">SEO</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">SEO Title</Label>
                <Input
                  value={form.seo_title}
                  onChange={(e) => handleChange("seo_title", e.target.value)}
                  placeholder="..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">SEO Description</Label>
                <Textarea
                  value={form.seo_description}
                  onChange={(e) => handleChange("seo_description", e.target.value)}
                  placeholder="..."
                  className="mt-1 min-h-[60px]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
