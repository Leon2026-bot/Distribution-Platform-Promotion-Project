"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"

export default function NewBlogPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image: "",
    status: "draft" as "draft" | "published",
    is_ai_generated: false,
    focus_keyword: "",
    seo_title: "",
    seo_description: "",
    tags: "" as string,
  })

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (res.ok) {
        toast.success(form.status === "published" ? "Published!" : "Saved as draft")
        router.push("/admin/blog")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" />
              Back
            </Button>
          </Link>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPreview((v) => !v)}>
          {preview ? <EyeOff className="mr-1 size-4" /> : <Eye className="mr-1 size-4" />}
          {preview ? "Edit" : "Preview"}
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-zinc-900">New Blog Post</h1>

      {preview ? (
        <div className="rounded-xl border border-zinc-100 bg-white p-6">
          {form.cover_image && (
            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.cover_image}
                alt={form.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-zinc-900">{form.title || "Untitled"}</h1>
          <div className="prose prose-zinc mt-4 max-w-none">
            {form.content ? (
              <div className="whitespace-pre-wrap text-sm text-zinc-600">{form.content}</div>
            ) : (
              <p className="text-zinc-400 italic">No content yet.</p>
            )}
          </div>
        </div>
      ) : (
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
                placeholder="Blog post title"
              />
            </div>

            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="blog-post-slug"
              />
            </div>

            <div>
              <Label>Content (Markdown supported)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="# Heading\n\nWrite your content here..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => handleChange("excerpt", e.target.value)}
                placeholder="Short summary for SEO and listings..."
                className="min-h-[60px]"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-100 p-4">
              <h3 className="mb-3 text-sm font-semibold">Publish</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Status</Label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ai-gen"
                    checked={form.is_ai_generated}
                    onChange={(e) => handleChange("is_ai_generated", e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  <Label htmlFor="ai-gen" className="text-xs">
                    AI Generated
                  </Label>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-100 p-4">
              <h3 className="mb-3 text-sm font-semibold">Featured Image</h3>
              <Input
                value={form.cover_image}
                onChange={(e) => handleChange("cover_image", e.target.value)}
                placeholder="https://..."
                className="text-xs"
              />
              {form.cover_image && (
                <div className="relative mt-2 h-24 w-full overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.cover_image}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-100 p-4">
              <h3 className="mb-3 text-sm font-semibold">SEO</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Focus Keyword</Label>
                  <Input
                    value={form.focus_keyword}
                    onChange={(e) => handleChange("focus_keyword", e.target.value)}
                    placeholder="..."
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">SEO Title</Label>
                  <Input
                    value={form.seo_title}
                    onChange={(e) => handleChange("seo_title", e.target.value)}
                    placeholder="..."
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">SEO Description</Label>
                  <Textarea
                    value={form.seo_description}
                    onChange={(e) => handleChange("seo_description", e.target.value)}
                    placeholder="..."
                    className="mt-1 min-h-[60px] text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Tags (comma separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="taobao, guide, 2026"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/admin/blog")}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving..." : form.status === "published" ? "Publish" : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
