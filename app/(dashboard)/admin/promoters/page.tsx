"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pencil, Ban, CheckCircle, Eye, MousePointerClick, Package, Globe, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import toast from "react-hot-toast"

interface Promoter {
  id: string
  username: string
  display_name: string | null
  status: string | null
  permissions: Record<string, boolean> | null
  created_at: string | null
  total_clicks: number
  total_products: number
  total_channels: number
}

const defaultPermissions = {
  dashboard: true,
  products: true,
  my_products: true,
  custom: true,
  links: true,
  settings: true,
  decorate: true,
}

export default function AdminPromotersPage() {
  const [promoters, setPromoters] = useState<Promoter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchPromoters = () => {
    fetch("/api/admin/promoters")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPromoters(data)
        } else {
          setPromoters([])
          console.error("Promoters API returned non-array:", data)
        }
        setLoading(false)
      })
      .catch(() => {
        setPromoters([])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPromoters()
  }, [])

  const toggleStatus = async (id: string, current: string | null) => {
    const newStatus = current === "active" ? "suspended" : "active"
    const isActive = newStatus === "active"
    const res = await fetch(`/api/admin/promoters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, is_active: isActive }),
    })
    if (res.ok) {
      toast.success(`Promoter ${newStatus}`)
      fetchPromoters()
    } else {
      toast.error("Failed")
    }
  }

  // Client-side filtering
  const filteredPromoters = promoters.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.display_name && p.display_name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus =
      statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Promoters</h1>
        <p className="text-sm text-zinc-500">
          Showing {filteredPromoters.length} of {promoters.length}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promoter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <div className="h-8 animate-pulse rounded bg-zinc-100" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredPromoters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-400">
                  {searchQuery || statusFilter !== "all" ? "No promoters match your filters." : "No promoters yet."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPromoters.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600">
                        {p.display_name?.charAt(0) || p.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">@{p.username}</p>
                        <p className="text-xs text-zinc-500">{p.display_name || "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "default" : p.status === "suspended" ? "destructive" : "secondary"}>
                      {p.status || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1" title="Clicks">
                        <MousePointerClick className="size-3" />
                        {p.total_clicks}
                      </span>
                      <span className="flex items-center gap-1" title="Products">
                        <Package className="size-3" />
                        {p.total_products}
                      </span>
                      <span className="flex items-center gap-1" title="Channels">
                        <Globe className="size-3" />
                        {p.total_channels}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/promoters/${p.id}`}>
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="size-4 text-zinc-500" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(p.id, p.status)}
                        title={p.status === "active" ? "Suspend" : "Activate"}
                      >
                        {p.status === "active" ? (
                          <Ban className="size-4 text-red-500" />
                        ) : (
                          <CheckCircle className="size-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
