"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Database } from "@/types/supabase"

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"]

interface BlogContentProps {
  content: string
  relatedProducts?: Array<{
    id: string
    title: string
    slug: string
    images: string[]
    price_usd: number | null
    price_cny: number
  }>
}

// Very lightweight markdown-ish renderer (no heavy deps)
function renderContent(content: string): string {
  return content
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold / Italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline underline-offset-2 hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.+<\/li>\n?)+/g, "<ul>$&</ul>")
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rule
    .replace(/^---$/gm, "<hr />")
    // Paragraphs (double newline)
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim()
      if (!block) return ""
      if (block.startsWith("<h") || block.startsWith("<ul") || block.startsWith("<li") || block.startsWith("<blockquote") || block.startsWith("<hr"))
        return block
      return `<p>${block.replace(/\n/g, "<br />")}</p>`
    })
    .filter(Boolean)
    .join("\n")
}

export function BlogContent({ content }: BlogContentProps) {
  const html = useMemo(() => renderContent(content), [content])

  return (
    <div
      className="prose prose-zinc max-w-none
        prose-headings:font-bold prose-headings:text-zinc-900
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-100 prose-h2:pb-3
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:text-base
        prose-a:text-blue-600 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-blue-800
        prose-strong:text-zinc-800
        prose-ul:space-y-1 prose-li:text-zinc-600 prose-li:text-sm
        prose-blockquote:border-l-4 prose-blockquote:border-zinc-200 prose-blockquote:pl-4 prose-blockquote:text-zinc-500 prose-blockquote:italic
        prose-hr:border-zinc-100
        prose-code:text-sm prose-code:bg-zinc-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-zinc-700
        prose-pre:bg-zinc-900 prose-pre:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

interface RelatedProductsProps {
  products: Array<{
    id: string
    title: string
    slug: string
    images: string[]
    price_usd: number | null
    price_cny: number
  }>
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null

  const USD_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "7.2")

  return (
    <section className="mt-12 rounded-xl border border-zinc-100 p-6">
      <h2 className="mb-4 text-lg font-bold text-zinc-900">Products Mentioned</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const priceUsd = product.price_usd ?? product.price_cny / USD_RATE
          const imgUrl = product.images?.[0]
            ? product.images[0].startsWith("http")
              ? product.images[0]
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${product.images[0]}`
            : null

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-lg border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-sm"
            >
              {imgUrl && (
                <div className="aspect-square overflow-hidden bg-zinc-50">
                  <Image
                    src={imgUrl}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-3">
                <p className="line-clamp-2 text-xs font-medium text-zinc-800 group-hover:text-zinc-600">
                  {product.title}
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-900">≈ ${priceUsd.toFixed(2)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
