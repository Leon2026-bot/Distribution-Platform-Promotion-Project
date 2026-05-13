"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, Eye } from "lucide-react"
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

interface BlogPost {
  id: string
  title: string
  slug: string
  status: string
  is_ai_generated: boolean | null
  published_at: string | null
  view_count: number | null
  created_at: string | null
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = () => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return
    const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Deleted")
      fetchPosts()
    } else {
      toast.error("Failed")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Blog</h1>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="mr-2 size-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
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
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-400">
                  No posts yet.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-zinc-500">{p.slug}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "published" ? "default" : "secondary"}>
                      {p.status}
                    </Badge>
                    {p.is_ai_generated && (
                      <Badge variant="outline" className="ml-2">AI</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500">{p.view_count ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/blog/${p.slug}`} target="_blank">
                        <Button variant="ghost" size="icon">
                          <Eye className="size-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/blog/${p.id}`}>
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
    </div>
  )
}
