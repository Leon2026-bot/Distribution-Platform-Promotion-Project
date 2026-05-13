"use client"

import { useEffect, useState } from "react"
import { Pencil, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface Promoter {
  id: string
  username: string
  display_name: string | null
  status: string
  created_at: string | null
}

export default function AdminPromotersPage() {
  const [promoters, setPromoters] = useState<Promoter[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPromoters = () => {
    fetch("/api/admin/promoters")
      .then((r) => r.json())
      .then((data) => {
        setPromoters(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchPromoters()
  }, [])

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "suspended" : "active"
    const res = await fetch(`/api/admin/promoters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      toast.success(`Promoter ${newStatus}`)
      fetchPromoters()
    } else {
      toast.error("Failed")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Promoters</h1>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Status</TableHead>
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
            ) : promoters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-400">
                  No promoters yet.
                </TableCell>
              </TableRow>
            ) : (
              promoters.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">@{p.username}</TableCell>
                  <TableCell className="text-zinc-500">{p.display_name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
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
