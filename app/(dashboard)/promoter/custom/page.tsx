"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"

interface CustomProduct {
  id: string
  custom_name: string | null
  custom_price: number | null
  custom_image: string | null
  custom_url: string | null
  custom_category: string | null
  custom_tags: string[] | null
  is_pinned: boolean | null
  status: string | null
  added_at: string | null
}

const CSV_TEMPLATE = `name,price,image_url,product_url,category,tags
"Custom Nike Shirt",25.99,"https://example.com/image1.jpg","https://example.com/product1","Clothing","hot,new"
"Vintage Sneakers",89.00,"https://example.com/image2.jpg","https://example.com/product2","Shoes","vintage,limited"
`

export default function CustomProductsPage() {
  const [products, setProducts] = useState<CustomProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showImportPanel, setShowImportPanel] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null)
  const [csvText, setCsvText] = useState("")
  const [csvPreview, setCsvPreview] = useState<Array<Record<string, unknown>> | null>(null)
  const [importing, setImporting] = useState(false)

  const [form, setForm] = useState({
    custom_name: "",
    custom_price: "",
    custom_image: "",
    custom_url: "",
    custom_category: "",
    custom_tags: "",
  })

  const fetchProducts = useCallback(() => {
    setLoading(true)
    fetch("/api/promoter/custom-products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load custom products")
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const resetForm = () => {
    setForm({
      custom_name: "",
      custom_price: "",
      custom_image: "",
      custom_url: "",
      custom_category: "",
      custom_tags: "",
    })
  }

  const openEdit = (product: CustomProduct) => {
    setEditingProduct(product)
    setForm({
      custom_name: product.custom_name || "",
      custom_price: product.custom_price?.toString() || "",
      custom_image: product.custom_image || "",
      custom_url: product.custom_url || "",
      custom_category: product.custom_category || "",
      custom_tags: product.custom_tags?.join(", ") || "",
    })
    setShowEditDialog(true)
  }

  const handleSubmit = async () => {
    if (!form.custom_name.trim() || !form.custom_price) {
      toast.error("Name and price are required")
      return
    }

    const payload = {
      custom_name: form.custom_name.trim(),
      custom_price: Number(form.custom_price),
      custom_image: form.custom_image.trim() || null,
      custom_url: form.custom_url.trim() || null,
      custom_category: form.custom_category.trim() || null,
      custom_tags: form.custom_tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    try {
      const res = await fetch("/api/promoter/custom-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Custom product added")
        setShowAddDialog(false)
        resetForm()
        fetchProducts()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to add")
      }
    } catch {
      toast.error("Network error")
    }
  }

  const handleUpdate = async () => {
    if (!editingProduct) return
    if (!form.custom_name.trim() || !form.custom_price) {
      toast.error("Name and price are required")
      return
    }

    const payload = {
      custom_name: form.custom_name.trim(),
      custom_price: Number(form.custom_price),
      custom_image: form.custom_image.trim() || null,
      custom_url: form.custom_url.trim() || null,
      custom_category: form.custom_category.trim() || null,
      custom_tags: form.custom_tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    }

    try {
      const res = await fetch(`/api/promoter/custom-products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Updated successfully")
        setShowEditDialog(false)
        setEditingProduct(null)
        resetForm()
        fetchProducts()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update")
      }
    } catch {
      toast.error("Network error")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this custom product?")) return

    try {
      const res = await fetch(`/api/promoter/custom-products/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Deleted")
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast.error("Failed to delete")
      }
    } catch {
      toast.error("Network error")
    }
  }

  const handleTogglePin = async (product: CustomProduct) => {
    try {
      const res = await fetch(`/api/promoter/custom-products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_pinned: !product.is_pinned }),
      })

      if (res.ok) {
        toast.success(product.is_pinned ? "Unpinned" : "Pinned")
        fetchProducts()
      } else {
        toast.error("Failed to update")
      }
    } catch {
      toast.error("Network error")
    }
  }

  /* ── CSV import helpers ──────────────────────────────────── */
  const parseCSV = (text: string): Array<Record<string, unknown>> => {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    return lines.slice(1).map((line) => {
      const values: string[] = []
      let current = ""
      let inQuotes = false
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""))
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""))

      const row: Record<string, unknown> = {}
      headers.forEach((h, i) => {
        row[h] = values[i] || ""
      })
      return row
    })
  }

  const handleCsvPreview = () => {
    if (!csvText.trim()) {
      toast.error("Please paste CSV data")
      return
    }
    const rows = parseCSV(csvText)
    if (!rows.length) {
      toast.error("No valid data found")
      return
    }
    setCsvPreview(rows.slice(0, 10))
  }

  const handleCsvImport = async () => {
    if (!csvPreview || csvPreview.length === 0) return

    setImporting(true)
    try {
      const res = await fetch("/api/promoter/custom-products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: csvPreview }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Imported ${data.imported} product(s)`)
        setShowImportPanel(false)
        setCsvText("")
        setCsvPreview(null)
        fetchProducts()
      } else {
        const err = await res.json()
        toast.error(err.error || "Import failed")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "custom-products-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── Form field component ───────────────────────────────── */
  const FormFields = () => (
    <div className="space-y-4">
      <div>
        <Label>Product Name *</Label>
        <Input
          value={form.custom_name}
          onChange={(e) => setForm((f) => ({ ...f, custom_name: e.target.value }))}
          placeholder="e.g. Custom Nike Shirt"
        />
      </div>
      <div>
        <Label>Price (USD) *</Label>
        <Input
          type="number"
          step="0.01"
          value={form.custom_price}
          onChange={(e) => setForm((f) => ({ ...f, custom_price: e.target.value }))}
          placeholder="25.99"
        />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input
          value={form.custom_image}
          onChange={(e) => setForm((f) => ({ ...f, custom_image: e.target.value }))}
          placeholder="https://..."
        />
        {form.custom_image && (
          <div className="relative mt-2 h-32 w-32 overflow-hidden rounded-lg border">
            <Image
              src={form.custom_image}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => toast.error("Failed to load image")}
            />
          </div>
        )}
      </div>
      <div>
        <Label>Product URL</Label>
        <Input
          value={form.custom_url}
          onChange={(e) => setForm((f) => ({ ...f, custom_url: e.target.value }))}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Category</Label>
        <Input
          value={form.custom_category}
          onChange={(e) => setForm((f) => ({ ...f, custom_category: e.target.value }))}
          placeholder="e.g. Clothing"
        />
      </div>
      <div>
        <Label>Tags (comma separated)</Label>
        <Input
          value={form.custom_tags}
          onChange={(e) => setForm((f) => ({ ...f, custom_tags: e.target.value }))}
          placeholder="hot, new, limited"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Custom Products</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add your own products that are not in the platform catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportPanel((v) => !v)}>
            <Upload className="mr-1.5 size-4" />
            CSV Import
          </Button>
          <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
            <Plus className="mr-1.5 size-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* CSV Import Panel */}
      {showImportPanel && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">CSV Import</h3>
            <button
              onClick={() => { setShowImportPanel(false); setCsvPreview(null); setCsvText("") }}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="mr-1 size-3.5" />
              Download Template
            </Button>
          </div>

          {!csvPreview ? (
            <>
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={`Paste CSV data here...\nname,price,image_url,product_url,category,tags\n"Custom Shirt",25.99,"https://...","https://...","Clothing","hot"`}
                className="min-h-[120px] font-mono text-xs"
              />
              <Button className="mt-3" size="sm" onClick={handleCsvPreview}>
                Preview
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Previewing {csvPreview.length} row(s):
              </p>
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-100">
                    <tr>
                      {Object.keys(csvPreview[0]).map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-2 text-zinc-600">
                            {String(v).slice(0, 40)}
                            {String(v).length > 40 ? "..." : ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCsvImport} disabled={importing}>
                  {importing ? "Importing..." : "Confirm Import"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCsvPreview(null)}
                  disabled={importing}
                >
                  Edit CSV
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-sm text-zinc-400">No custom products yet.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImportPanel(true)}>
              <Upload className="mr-1 size-3.5" />
              CSV Import
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowAddDialog(true) }}>
              <Plus className="mr-1 size-3.5" />
              Add First Product
            </Button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
          {products.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-4 py-3"
            >
              {/* Image */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-50">
                {item.custom_image ? (
                  <Image
                    src={item.custom_image}
                    alt={item.custom_name || ""}
                    fill
                    className="object-cover"
                    sizes="56px"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-300">
                    No img
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">
                  {item.custom_name || "Untitled"}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-400">
                  <span>${item.custom_price?.toFixed(2) ?? "—"}</span>
                  {item.custom_category && (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5">
                      {item.custom_category}
                    </span>
                  )}
                  {item.custom_tags && item.custom_tags.length > 0 && (
                    <span>{item.custom_tags.join(", ")}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTogglePin(item)}
                  className={`rounded-lg p-2 ${
                    item.is_pinned
                      ? "text-amber-500 hover:bg-amber-50"
                      : "text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                  }`}
                  title={item.is_pinned ? "Unpin" : "Pin"}
                >
                  {item.is_pinned ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </button>

                {item.custom_url && (
                  <a
                    href={item.custom_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                    title="Open link"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}

                <button
                  onClick={() => openEdit(item)}
                  className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                  title="Edit"
                >
                  <Edit3 className="size-4" />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg p-2 text-zinc-300 hover:bg-red-50 hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Product</DialogTitle>
          </DialogHeader>
          <FormFields />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Custom Product</DialogTitle>
          </DialogHeader>
          <FormFields />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
