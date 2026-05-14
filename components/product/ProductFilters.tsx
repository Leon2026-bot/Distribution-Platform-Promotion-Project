"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  slug: string
  name: string
  product_count: number | null
}

interface BrandOption {
  slug: string
  name: string
}

interface ActiveFilter {
  key: string
  label: string
  value: string
}

interface ProductFiltersProps {
  categories: Category[]
  brands: BrandOption[]
  tags: string[]
  activeFilters: ActiveFilter[]
  sortValue: string
  searchQuery: string
  priceMin: string
  priceMax: string
  totalProducts: number
}

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

export function ProductFilters({
  categories,
  brands,
  tags,
  activeFilters,
  sortValue,
  searchQuery,
  priceMin,
  priceMax,
  totalProducts,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: false,
    tags: false,
  })

  const toggleSection = (section: "category" | "brand" | "tags") => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Build new URL params
  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      // Reset page when filters change
      params.delete("page")
      const qs = params.toString()
      return qs ? `/products?${qs}` : "/products"
    },
    [searchParams]
  )

  const navigate = useCallback(
    (updates: Record<string, string | null>) => {
      router.push(buildUrl(updates))
    },
    [router, buildUrl]
  )

  // Remove a specific filter
  const removeFilter = useCallback(
    (key: string) => {
      navigate({ [key]: null })
    },
    [navigate]
  )

  const clearAll = useCallback(() => {
    router.push("/products")
    setMobileOpen(false)
  }, [router])

  // Sidebar filter content (shared between desktop & mobile)
  const filterContent = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Search
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const q = fd.get("q") as string
            navigate({ q: q || null })
            setMobileOpen(false)
          }}
        >
          <Input
            name="q"
            placeholder="Search products..."
            defaultValue={searchQuery}
            className="h-9"
          />
        </form>
      </div>

      {/* Category */}
      <div className="border-b border-zinc-100 pb-4">
        <button
          onClick={() => toggleSection("category")}
          className="flex w-full items-center justify-between py-1"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Category
          </span>
          <div className="flex items-center gap-1.5">
            {(() => {
              const current = searchParams.get("category")
              if (!current) return null
              const catName = categories.find((c) => c.slug === current)?.name ?? current
              return (
                <span className="max-w-[100px] truncate text-[11px] text-zinc-700">
                  {catName}
                </span>
              )
            })()}
            {openSections.category ? (
              <ChevronUp className="size-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="size-3.5 text-zinc-400" />
            )}
          </div>
        </button>
        {openSections.category && (
          <div className="mt-2 space-y-1">
            <button
              onClick={() => {
                navigate({ category: null })
                setMobileOpen(false)
              }}
              className={`block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                !searchParams.get("category")
                  ? "bg-zinc-900 font-medium text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  navigate({ category: cat.slug })
                  setMobileOpen(false)
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                  searchParams.get("category") === cat.slug
                    ? "bg-zinc-900 font-medium text-white"
                    : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <span>{cat.name}</span>
                {cat.product_count !== null && cat.product_count > 0 && (
                  <span className="text-xs opacity-60">({cat.product_count})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="border-b border-zinc-100 pb-4">
        <button
          onClick={() => toggleSection("brand")}
          className="flex w-full items-center justify-between py-1"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Brand
          </span>
          <div className="flex items-center gap-1.5">
            {(() => {
              const currentBrands = searchParams.getAll("brand")
              if (currentBrands.length === 0) return null
              if (currentBrands.length === 1) {
                const name = brands.find((b) => b.slug === currentBrands[0])?.name ?? currentBrands[0]
                return <span className="max-w-[100px] truncate text-[11px] text-zinc-700">{name}</span>
              }
              return (
                <span className="text-[11px] text-zinc-700">
                  {currentBrands.length} selected
                </span>
              )
            })()}
            {openSections.brand ? (
              <ChevronUp className="size-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="size-3.5 text-zinc-400" />
            )}
          </div>
        </button>
        {openSections.brand && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {brands.map((brand) => {
              const currentBrands = searchParams.getAll("brand")
              const isActive = currentBrands.includes(brand.slug)
              return (
                <button
                  key={brand.slug}
                  onClick={() => {
                    const next = isActive
                      ? currentBrands.filter((b) => b !== brand.slug)
                      : [...currentBrands, brand.slug]
                    if (next.length === 0) {
                      const params = new URLSearchParams(searchParams.toString())
                      params.delete("brand")
                      params.delete("page")
                      const qs = params.toString()
                      router.push(qs ? `/products?${qs}` : "/products")
                      return
                    }
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("brand")
                    params.delete("page")
                    next.forEach((b) => params.append("brand", b))
                    const qs = params.toString()
                    router.push(qs ? `/products?${qs}` : "/products")
                    setMobileOpen(false)
                  }}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {brand.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Discover Collections */}
      <div className="border-b border-zinc-100 pb-4">
        <button
          onClick={() => toggleSection("tags")}
          className="flex w-full items-center justify-between py-1"
        >
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Discover
          </span>
          <div className="flex items-center gap-1.5">
            {(() => {
              const sort = searchParams.get("sort")
              if (!sort || sort === "popular") return null
              const label = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? sort
              return (
                <span className="max-w-[100px] truncate text-[11px] text-zinc-700">
                  {label}
                </span>
              )
            })()}
            {openSections.tags ? (
              <ChevronUp className="size-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="size-3.5 text-zinc-400" />
            )}
          </div>
        </button>
        {openSections.tags && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              { value: "popular", label: "Best Sellers" },
              { value: "newest", label: "New Arrivals" },
              { value: "price_desc", label: "You may also like" },
            ].map((item) => {
              const currentSort = searchParams.get("sort") || "popular"
              const isActive = currentSort === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    navigate({ sort: isActive ? null : item.value })
                    setMobileOpen(false)
                  }}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Price Range (USD)
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const min = (fd.get("price_min") as string) || ""
            const max = (fd.get("price_max") as string) || ""
            navigate({ price_min: min || null, price_max: max || null })
            setMobileOpen(false)
          }}
          className="flex items-center gap-2"
        >
          <Input
            name="price_min"
            type="number"
            placeholder="Min"
            defaultValue={priceMin || ""}
            className="h-9 w-full"
            min="0"
          />
          <span className="text-sm text-zinc-400">—</span>
          <Input
            name="price_max"
            type="number"
            placeholder="Max"
            defaultValue={priceMax || ""}
            className="h-9 w-full"
            min="0"
          />
          <Button type="submit" variant="outline" size="sm">
            Go
          </Button>
        </form>
      </div>
    </div>
  )

  return (
    <div>
      {/* Top bar: sort + mobile filter toggle */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {totalProducts} product{totalProducts !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select
            value={sortValue}
            onValueChange={(val) => navigate({ sort: val })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mobile filter button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 h-7 text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
                >
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                </button>
              }
            />
            <SheetContent side="left" className="w-[320px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4 pt-2">{filterContent}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-400">Active:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={`${filter.key}-${filter.value}`}
              variant="secondary"
              className="cursor-pointer gap-1 pr-1"
              onClick={() => removeFilter(filter.key)}
            >
              {filter.label}
              <X className="size-3" />
            </Badge>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-20 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
          {filterContent}
        </div>
      </div>
    </div>
  )
}
