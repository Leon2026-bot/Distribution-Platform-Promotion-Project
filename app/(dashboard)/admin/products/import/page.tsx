"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Upload, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

interface CsvRow {
  row: number
  data: Record<string, string>
  errors: string[]
}

interface PreviewResult {
  valid: CsvRow[]
  invalid: CsvRow[]
  total: number
}

export default function CsvImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(null)
    setResult(null)

    const text = await f.text()
    const lines = text.split("\n").filter((l) => l.trim())
    if (lines.length < 2) {
      toast.error("CSV file is empty or missing headers")
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    const required = ["title", "price_cny", "source_type", "source_item_id"]
    const missing = required.filter((r) => !headers.includes(r))
    if (missing.length > 0) {
      toast.error(`Missing required columns: ${missing.join(", ")}`)
      return
    }

    const valid: CsvRow[] = []
    const invalid: CsvRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i])
      if (cells.length < headers.length) continue

      const rowData: Record<string, string> = {}
      headers.forEach((h, idx) => {
        rowData[h] = cells[idx]?.trim() || ""
      })

      const errors: string[] = []
      if (!rowData.title) errors.push("title is required")
      if (!rowData.price_cny || isNaN(parseFloat(rowData.price_cny))) errors.push("price_cny must be a number")
      if (!rowData.source_type) errors.push("source_type is required")
      if (!rowData.source_item_id) errors.push("source_item_id is required")

      const row = { row: i + 1, data: rowData, errors }
      if (errors.length > 0) {
        invalid.push(row)
      } else {
        valid.push(row)
      }
    }

    setPreview({ valid, invalid, total: lines.length - 1 })
  }, [])

  const handleImport = async () => {
    if (!preview || preview.valid.length === 0) return
    setImporting(true)

    const payload = preview.valid.map((v) => ({
      source_type: v.data.source_type,
      source_item_id: v.data.source_item_id,
      source_url: v.data.source_url || null,
      title_zh: v.data.title_zh || null,
      title: v.data.title,
      description_zh: v.data.description_zh || null,
      description: v.data.description || null,
      price_cny: parseFloat(v.data.price_cny),
      images: v.data.images ? v.data.images.split(";").filter(Boolean) : [],
      brand: v.data.brand || null,
      category: v.data.category || "Uncategorized",
      sizes: v.data.sizes ? JSON.parse(v.data.sizes) : null,
      colors: v.data.colors ? v.data.colors.split(";").filter(Boolean) : [],
      tags: v.data.tags ? v.data.tags.split(";").filter(Boolean) : [],
      seo_title: v.data.seo_title || null,
      seo_description: v.data.seo_description || null,
      is_active: v.data.is_active !== "false",
    }))

    const res = await fetch("/api/admin/ingest/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_INGEST_TOKEN || "dev-token"}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setResult(data)
    setImporting(false)
    if (data.created > 0) {
      toast.success(`Imported ${data.created} products`)
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

      <h1 className="text-2xl font-bold text-zinc-900">CSV Import</h1>

      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <Upload className="mx-auto size-8 text-zinc-400" />
        <p className="mt-2 text-sm font-medium text-zinc-700">Upload CSV file</p>
        <p className="mt-1 text-xs text-zinc-500">
          Required columns: title, price_cny, source_type, source_item_id
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mt-4 mx-auto block text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </div>

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="size-4 text-green-500" />
              Valid: {preview.valid.length}
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="size-4 text-red-500" />
              Invalid: {preview.invalid.length}
            </span>
            <span className="text-zinc-400">Total: {preview.total}</span>
          </div>

          {preview.invalid.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800">Invalid Rows</h3>
              <div className="mt-2 space-y-2">
                {preview.invalid.slice(0, 5).map((row) => (
                  <div key={row.row} className="text-xs text-red-700">
                    Row {row.row}: {row.errors.join(", ")}
                  </div>
                ))}
                {preview.invalid.length > 5 && (
                  <p className="text-xs text-red-600">
                    ...and {preview.invalid.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {preview.valid.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-4 py-3">
                <h3 className="text-sm font-semibold">Preview (first 10 rows)</h3>
              </div>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Brand</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {preview.valid.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 truncate max-w-xs">{row.data.title}</td>
                        <td className="px-4 py-2">{row.data.brand || "—"}</td>
                        <td className="px-4 py-2">¥{row.data.price_cny}</td>
                        <td className="px-4 py-2">
                          <Badge variant="outline">{row.data.source_type}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={importing || preview.valid.length === 0}>
              {importing ? "Importing..." : `Import ${preview.valid.length} Products`}
            </Button>
            <Button variant="outline" onClick={() => { setFile(null); setPreview(null); setResult(null) }}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="text-sm font-semibold text-green-800">Import Result</h3>
          <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-green-700">
            <div>Created: <strong>{result.created ?? 0}</strong></div>
            <div>Updated: <strong>{result.updated ?? 0}</strong></div>
            <div>Errors: <strong>{result.errors ?? 0}</strong></div>
          </div>
          {result.details?.length > 0 && (
            <div className="mt-2 space-y-1">
              {result.details.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="text-xs text-green-600">
                  {d.status}: {d.product_id}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result.map((s) => s.trim())
}
