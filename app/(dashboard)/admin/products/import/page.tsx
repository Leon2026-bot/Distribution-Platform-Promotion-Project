"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Upload, ArrowLeft, AlertCircle, CheckCircle, Download, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import * as XLSX from "xlsx"

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

// CSV 字段定义
const CSV_FIELDS = [
  {
    field: "title",
    required: true,
    type: "string",
    example: "Nike Air Max 90",
    description: "商品英文标题，建议包含品牌+款式+颜色",
  },
  {
    field: "price_cny",
    required: true,
    type: "number",
    example: "299.00",
    description: "商品人民币售价，纯数字，不含货币符号",
  },
  {
    field: "source_type",
    required: true,
    type: "string",
    example: "kakobuy",
    description: "货源平台标识：kakobuy / cnfans / fishgoo / superbuy / ownpanda（只填一个，多平台用 / 分隔时自动取第一个）",
  },
  {
    field: "source_item_id",
    required: true,
    type: "string",
    example: "item_123456",
    description: "商品在原平台的唯一 ID，用于生成购买跳转链接",
  },
  {
    field: "title_zh",
    required: false,
    type: "string",
    example: "耐克 Air Max 90",
    description: "商品中文标题（可选），用于中文 SEO",
  },
  {
    field: "brand",
    required: false,
    type: "string",
    example: "Nike",
    description: "品牌名称，需与系统品牌库一致（大小写不敏感）",
  },
  {
    field: "category",
    required: false,
    type: "string",
    example: "Sneakers",
    description: "商品分类，不填默认为 Uncategorized",
  },
  {
    field: "source_url",
    required: false,
    type: "string",
    example: "https://kakobuy.com/item/123",
    description: "原平台商品页 URL（可选）",
  },
  {
    field: "description",
    required: false,
    type: "string",
    example: "Classic Nike running shoe...",
    description: "商品英文详情描述",
  },
  {
    field: "description_zh",
    required: false,
    type: "string",
    example: "经典款跑鞋...",
    description: "商品中文详情描述",
  },
  {
    field: "images",
    required: false,
    type: "string",
    example: "https://img1.jpg;https://img2.jpg",
    description: "商品图片 URL，多张以英文分号 ; 分隔",
  },
  {
    field: "sizes",
    required: false,
    type: "JSON",
    example: '["S","M","L","XL"]',
    description: "可选尺寸，JSON 数组格式，含引号需用双引号包裹整个字段",
  },
  {
    field: "colors",
    required: false,
    type: "string",
    example: "Black;White;Red",
    description: "可选颜色，多个颜色以英文分号 ; 分隔",
  },
  {
    field: "tags",
    required: false,
    type: "string",
    example: "trending;sale;new",
    description: "商品标签，多个标签以英文分号 ; 分隔，用于筛选和 SEO",
  },
  {
    field: "seo_title",
    required: false,
    type: "string",
    example: "Buy Nike Air Max 90 | Best Price",
    description: "SEO 标题，建议 50–60 字符，不填自动取 title",
  },
  {
    field: "seo_description",
    required: false,
    type: "string",
    example: "Shop Nike Air Max 90 at lowest price...",
    description: "SEO 描述，建议 120–160 字符",
  },
  {
    field: "is_active",
    required: false,
    type: "boolean",
    example: "true",
    description: "是否上架：true（默认）/ false，false 时商品不对外展示",
  },
]

// 规范化 source_type：多平台用 / 分隔时取第一个，转小写
function normalizeSourceType(raw: string): string {
  if (!raw) return ""
  const first = raw.split("/")[0].trim()
  return first.toLowerCase()
}

// 解析文件 → 统一转为行数组
async function parseFile(file: File): Promise<{ headers: string[]; rows: string[][] }> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "xlsx" || ext === "xls") {
    // 用 xlsx 库解析
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: "array" })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data: string[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: "",
      raw: false, // 全部转字符串
    }) as string[][]

    if (data.length < 2) return { headers: [], rows: [] }
    const headers = (data[0] as string[]).map((h) => String(h ?? "").trim())
    const rows = data.slice(1).map((row) =>
      (row as string[]).map((cell) => String(cell ?? "").trim())
    )
    return { headers, rows }
  } else {
    // CSV 文本解析
    const text = await file.text()
    const lines = text.split("\n").filter((l) => l.trim())
    if (lines.length < 2) return { headers: [], rows: [] }
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))
    const rows = lines.slice(1).map((line) => parseCsvLine(line))
    return { headers, rows }
  }
}

// 生成模版 CSV 内容
function generateTemplateCsv(): string {
  const headers = CSV_FIELDS.map((f) => f.field).join(",")
  const exampleRow = CSV_FIELDS.map((f) => {
    const val = f.example
    if (val.includes(",") || val.includes('"') || val.includes(";")) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }).join(",")
  return `${headers}\n${exampleRow}\n`
}

function downloadTemplate() {
  const csv = generateTemplateCsv()
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "finds-engine-products-template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export default function CsvImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showFields, setShowFields] = useState(false)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(null)
    setResult(null)

    let headers: string[] = []
    let rows: string[][] = []

    try {
      const parsed = await parseFile(f)
      headers = parsed.headers
      rows = parsed.rows
    } catch (err) {
      toast.error("Failed to parse file. Please check the format.")
      return
    }

    if (headers.length === 0) {
      toast.error("File is empty or missing headers")
      return
    }

    const required = ["title", "price_cny", "source_type", "source_item_id"]
    const missing = required.filter((r) => !headers.includes(r))
    if (missing.length > 0) {
      toast.error(`Missing required columns: ${missing.join(", ")}`)
      return
    }

    const valid: CsvRow[] = []
    const invalid: CsvRow[] = []

    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i]
      // 跳过完全空行
      if (cells.every((c) => !c)) continue

      const rowData: Record<string, string> = {}
      headers.forEach((h, idx) => {
        rowData[h] = cells[idx]?.trim() || ""
      })

      // 自动规范化 source_type（取多平台列表第一个，转小写）
      if (rowData.source_type) {
        rowData.source_type = normalizeSourceType(rowData.source_type)
      }

      const errors: string[] = []
      if (!rowData.title) errors.push("title is required")
      if (!rowData.price_cny || isNaN(parseFloat(rowData.price_cny))) errors.push("price_cny must be a number")
      if (!rowData.source_type) errors.push("source_type is required")
      if (!rowData.source_item_id) errors.push("source_item_id is required")

      const row = { row: i + 2, data: rowData, errors }
      if (errors.length > 0) {
        invalid.push(row)
      } else {
        valid.push(row)
      }
    }

    setPreview({ valid, invalid, total: rows.filter((r) => r.some((c) => c)).length })
  }, [])

  const handleImport = async () => {
    if (!preview || preview.valid.length === 0) return
    setImporting(true)

    const allPayload = preview.valid.map((v) => ({
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
      sizes: v.data.sizes ? (() => { try { return JSON.parse(v.data.sizes) } catch { return null } })() : null,
      colors: v.data.colors ? v.data.colors.split(";").filter(Boolean) : [],
      tags: v.data.tags ? v.data.tags.split(";").filter(Boolean) : [],
      seo_title: v.data.seo_title || null,
      seo_description: v.data.seo_description || null,
      is_active: v.data.is_active !== "false",
    }))

    // 分批发送，每批最多 100 条
    const BATCH_SIZE = 100
    const batches = []
    for (let i = 0; i < allPayload.length; i += BATCH_SIZE) {
      batches.push(allPayload.slice(i, i + BATCH_SIZE))
    }

    let totalCreated = 0
    let totalUpdated = 0
    let totalErrors = 0

    for (let b = 0; b < batches.length; b++) {
      toast.loading(`Importing batch ${b + 1}/${batches.length}...`, { id: "import-progress" })
      const res = await fetch("/api/admin/ingest/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(batches[b]),
      })
      const data = await res.json()
      if (res.ok) {
        totalCreated += data.created || 0
        totalUpdated += data.updated || 0
        totalErrors += data.errors || 0
      } else {
        totalErrors += batches[b].length
        console.error(`Batch ${b + 1} failed:`, data)
      }
    }

    toast.dismiss("import-progress")
    const finalResult = { created: totalCreated, updated: totalUpdated, errors: totalErrors }
    setResult(finalResult)
    setImporting(false)
    if (totalCreated > 0 || totalUpdated > 0) {
      toast.success(`Done! Created: ${totalCreated}, Updated: ${totalUpdated}${totalErrors > 0 ? `, Errors: ${totalErrors}` : ""}`)
    } else if (totalErrors > 0) {
      toast.error(`Import failed: ${totalErrors} errors. Check console for details.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">CSV Import</h1>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 size-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <Upload className="mx-auto size-8 text-zinc-400" />
        <p className="mt-2 text-sm font-medium text-zinc-700">Upload CSV or Excel file</p>
        <p className="mt-1 text-xs text-zinc-500">
          Supports <span className="font-medium text-zinc-700">.csv</span> and{" "}
          <span className="font-medium text-zinc-700">.xlsx / .xls</span> formats
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Required columns: title · price_cny · source_type · source_item_id
        </p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="mt-4 mx-auto block text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        {file && (
          <p className="mt-2 text-xs text-zinc-400">
            Selected: <span className="font-medium text-zinc-600">{file.name}</span>
          </p>
        )}
      </div>

      {/* Field Reference Table */}
      <div className="rounded-lg border border-zinc-200 bg-white">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={() => setShowFields((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <Info className="size-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-700">CSV Field Reference</span>
            <Badge variant="outline" className="text-xs">
              {CSV_FIELDS.filter((f) => f.required).length} required · {CSV_FIELDS.filter((f) => !f.required).length} optional
            </Badge>
          </div>
          <span className="text-xs text-zinc-400">{showFields ? "Hide ▲" : "Show ▼"}</span>
        </button>

        {showFields && (
          <div className="border-t border-zinc-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Field</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Required</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Example</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {CSV_FIELDS.map((f) => (
                    <tr key={f.field} className={f.required ? "bg-amber-50/40" : ""}>
                      <td className="px-4 py-2.5">
                        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-mono text-zinc-800">
                          {f.field}
                        </code>
                        {f.required && (
                          <span className="ml-1 text-red-500 font-bold text-xs">*</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {f.required ? (
                          <Badge className="bg-red-100 text-red-700 border-0 text-xs">Required</Badge>
                        ) : (
                          <Badge variant="outline" className="text-zinc-400 text-xs">Optional</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-zinc-500 font-mono">{f.type}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-zinc-600 font-mono break-all">{f.example}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-zinc-500">{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-2.5">
              <p className="text-xs text-zinc-400">
                <span className="text-red-500 font-bold">*</span> 必填字段（标红底色行）·
                多值字段使用英文分号 <code className="bg-zinc-200 px-1 rounded">;</code> 分隔 ·
                source_type 若填写多个平台（如 <code className="bg-zinc-200 px-1 rounded">Kakobuy/Superbuy</code>）系统自动取第一个
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
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

      {/* Result */}
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
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }
  result.push(current)
  return result.map((s) => s.trim())
}
