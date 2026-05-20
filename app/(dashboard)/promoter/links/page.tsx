"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import {
  Copy,
  Download,
  ExternalLink,
  QrCode,
  Store,
  Link as LinkIcon,
  Check,
  FileSpreadsheet,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface LinkProduct {
  id: string
  product_type: string | null
  custom_name: string | null
  custom_price: number | null
  custom_image: string | null
  custom_url: string | null
  is_pinned: boolean | null
  product: {
    title: string
    slug: string
    images: string[]
    price_cny: number
  } | null
}

interface ShortLink {
  id: string
  short_code: string
  final_url: string
  product_id: string
  click_count: number
  created_at: string
}

interface Channel {
  platform_id: string
  member_id: string
}

export default function LinksPage() {
  const [username, setUsername] = useState("")
  const [products, setProducts] = useState<LinkProduct[]>([])
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const siteUrl = typeof window !== "undefined" ? window.location.origin : ""

  useEffect(() => {
    Promise.all([
      fetch("/api/promoter/links").then((r) => r.json()),
      fetch("/api/promoter/short-links").then((r) => r.json()),
    ])
      .then(([linksData, shortLinksData]) => {
        setUsername(linksData.username ?? "")
        setProducts(linksData.products ?? [])
        setShortLinks(shortLinksData.links ?? [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load links")
        setLoading(false)
      })
  }, [])

  const getProductTitle = (p: LinkProduct) =>
    p.custom_name || p.product?.title || "Untitled"

  const getProductImage = (p: LinkProduct) =>
    p.custom_image || p.product?.images?.[0] || "/placeholder.webp"

  const getProductPrice = (p: LinkProduct) =>
    p.custom_price || p.product?.price_cny || 0

  const getProductSlug = (p: LinkProduct) => p.product?.slug

  const getShopLink = () => `${siteUrl}/shop/${username}`

  const getProductLink = (p: LinkProduct) => {
    const slug = getProductSlug(p)
    if (!slug) return "#"
    return `${siteUrl}/products/${slug}?ref=${username}`
  }

  /** Look up the real short link for a product from the database */
  const getShortLink = (p: LinkProduct) => {
    const shortLink = shortLinks.find((sl) => sl.product_id === p.id)
    if (shortLink) {
      return `${siteUrl}/r/${shortLink.short_code}`
    }
    return null
  }

  /** Generate a short link for a product */
  const handleGenerateShortLink = async (p: LinkProduct) => {
    const slug = getProductSlug(p)
    if (!slug) return

    setGeneratingId(p.id)
    try {
      const res = await fetch("/api/promoter/short-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: p.id,
          product_slug: slug,
        }),
      })

      if (res.ok) {
        const newLink = await res.json()
        setShortLinks((prev) => [...prev, newLink])
        toast.success("Short link created")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create short link")
      }
    } catch {
      toast.error("Failed to create short link")
    } finally {
      setGeneratingId(null)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success("Copied!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error("Copy failed")
    }
  }

  const showQr = async (url: string) => {
    try {
      const QRCode = await import("qrcode")
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: "#18181b", light: "#ffffff" },
      })
      setQrUrl(dataUrl)
      setShowQrDialog(true)
    } catch {
      toast.error("Failed to generate QR code")
    }
  }

  const downloadQr = async () => {
    if (!qrUrl) return
    try {
      const a = document.createElement("a")
      a.href = qrUrl
      a.download = `qr-code-${Date.now()}.png`
      a.click()
      toast.success("QR code downloaded")
    } catch {
      toast.error("Download failed")
    }
  }

  const exportCsv = () => {
    const rows = products.map((p) => ({
      name: getProductTitle(p),
      price: getProductPrice(p),
      shop_link: getShopLink(),
      product_link: getProductLink(p),
      short_link: getShortLink(p) || getProductLink(p),
    }))

    if (rows.length === 0) {
      toast.error("No products to export")
      return
    }

    const headers = ["Name", "Price", "Shop Link", "Product Link", "Short Link"]
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [
          '"' + r.name.replace(/"/g, '""') + '"',
          r.price,
          '"' + r.shop_link + '"',
          '"' + r.product_link + '"',
          '"' + r.short_link + '"',
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promotion-links-${username}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${rows.length} link(s)`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Promotion Links</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Copy and share your shop or product links.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <FileSpreadsheet className="mr-1.5 size-4" />
          Export CSV
        </Button>
      </div>

      {/* Shop Link Card */}
      <div className="rounded-xl border border-zinc-100 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
            <Store className="size-5 text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900">Your Shop Link</p>
            <p className="text-xs text-zinc-400 truncate">{getShopLink()}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => copyToClipboard(getShopLink(), "shop")}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
              title="Copy"
            >
              {copiedId === "shop" ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
            <button
              onClick={() => showQr(getShopLink())}
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
              title="QR Code"
            >
              <QrCode className="size-4" />
            </button>
            <a
              href={getShopLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
              title="Open"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Product Links */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-sm text-zinc-400">
            No products in your picks yet.
          </p>
          <a
            href="/promoter/products"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Browse products →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((item) => {
            const title = getProductTitle(item)
            const image = getProductImage(item)
            const productLink = getProductLink(item)
            const shortLink = getShortLink(item)
            const isCustom = item.product_type === "custom"
            const hasSlug = !!getProductSlug(item)

            return (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-100 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Image */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-50">
                    <Image
                      src={image.startsWith("http") ? image : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${image}`}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="56px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {title}
                      </p>
                      {isCustom && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                          Custom
                        </span>
                      )}
                      {item.is_pinned && (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">
                      ${getProductPrice(item)?.toFixed(2) ?? "—"}
                    </p>

                    {/* Links */}
                    {hasSlug ? (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <LinkIcon className="size-3 text-zinc-300" />
                          <span className="flex-1 truncate text-xs text-zinc-500">
                            {productLink}
                          </span>
                          <button
                            onClick={() => copyToClipboard(productLink, `prod-${item.id}`)}
                            className="rounded p-1 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                          >
                            {copiedId === `prod-${item.id}` ? (
                              <Check className="size-3 text-green-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        {/* Short link row */}
                        {shortLink ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-zinc-300 uppercase">
                            Short
                          </span>
                          <span className="flex-1 truncate text-xs text-zinc-500">
                            {shortLink}
                          </span>
                          <button
                            onClick={() => copyToClipboard(shortLink, `short-${item.id}`)}
                            className="rounded p-1 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                          >
                            {copiedId === `short-${item.id}` ? (
                              <Check className="size-3 text-green-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={() => handleGenerateShortLink(item)}
                              disabled={generatingId === item.id}
                            >
                              {generatingId === item.id ? (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                              ) : null}
                              Generate Short Link
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-zinc-400">
                        {isCustom
                          ? "Custom products use their own URL."
                          : "No product link available."}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    {hasSlug && (
                      <>
                        <button
                          onClick={() => showQr(productLink)}
                          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                          title="QR Code"
                        >
                          <QrCode className="size-4" />
                        </button>
                        <a
                          href={productLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                          title="Open"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      </>
                    )}
                    {item.custom_url && (
                      <a
                        href={item.custom_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                        title="Custom URL"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* QR Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {qrUrl && (
              <img
                src={qrUrl}
                alt="QR Code"
                className="rounded-lg border"
                width={200}
                height={200}
              />
            )}
            <Button variant="outline" onClick={downloadQr}>
              <Download className="mr-1.5 size-4" />
              Download PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
