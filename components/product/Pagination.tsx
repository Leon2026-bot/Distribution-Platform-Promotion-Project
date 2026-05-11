"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams: Record<string, string | string[] | undefined>
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Build URL with params
  function buildPageUrl(page: number) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (!value || key === "page") continue
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v))
      } else {
        params.set(key, value)
      }
    }
    if (page > 1) params.set("page", String(page))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  // Determine which page numbers to show
  const pages: (number | "ellipsis")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("ellipsis")
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
  }

  const linkCls =
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
  const activeCls =
    "inline-flex items-center justify-center rounded-lg bg-zinc-900 px-2.5 h-8 text-sm font-medium text-white min-w-[32px]"

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {currentPage > 1 ? (
        <Link href={buildPageUrl(currentPage - 1)} className={linkCls}>
          <ChevronLeft className="size-3.5" />
          Previous
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="size-3.5" />
          Previous
        </Button>
      )}

      <div className="flex items-center gap-1">
        {pages.map((page, idx) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-zinc-400">
              ...
            </span>
          ) : page === currentPage ? (
            <span key={page} className={cn(activeCls)}>
              {page}
            </span>
          ) : (
            <Link key={page} href={buildPageUrl(page)} className={cn(linkCls, "min-w-[32px]")}>
              {page}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <Link href={buildPageUrl(currentPage + 1)} className={linkCls}>
          Next
          <ChevronRight className="size-3.5" />
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
          <ChevronRight className="size-3.5" />
        </Button>
      )}
    </nav>
  )
}
