"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Search, Pencil, Trash2, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import toast from "react-hot-toast"

interface Product {
  id: string
  title: string
  brand: string | null
  category: string
  price_cny: number
  price_usd: number | null
  source_type: string
  is_active: boolean | null
  view_count: number | null
  click_count: number | null
  created_at: string | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const offset = (page - 1) * perPage
    const url = new URL("/api/admin/products", window.location.origin)
    url.searchParams.set("limit", String(perPage))
    url.searchParams.set("offset", String(offset))
    if (search) url.searchParams.set("search", search)

    fetch(url.toString())
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Deleted")
      fetchProducts()
    } else {
      toast.error("Failed")
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/import">
            <Button variant="outline">
              <Upload className="mr-2 size-4" />
              CSV Import
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="mr-2 size-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <div className="h-8 animate-pulse rounded bg-zinc-100" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-400">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="max-w-xs truncate font-medium">{p.title}</div>
                  </TableCell>
                  <TableCell className="text-zinc-500">{p.brand || "—"}</TableCell>
                  <TableCell className="text-zinc-500">{p.category}</TableCell>
                  <TableCell className="text-zinc-500">
                    ¥{p.price_cny}
                    {p.price_usd ? ` (~$${p.price_usd})` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${p.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
