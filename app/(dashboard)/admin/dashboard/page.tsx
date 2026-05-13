"use client"

import { useEffect, useState } from "react"
import {
  Package,
  Users,
  MousePointerClick,
  Globe,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminStats {
  total_products: number
  total_promoters: number
  total_clicks: number
  total_platforms: number
  total_blog_posts: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 animate-pulse rounded bg-zinc-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Products",
      value: stats?.total_products ?? 0,
      icon: Package,
      description: "Total in database",
    },
    {
      title: "Promoters",
      value: stats?.total_promoters ?? 0,
      icon: Users,
      description: "Registered promoters",
    },
    {
      title: "Clicks",
      value: stats?.total_clicks ?? 0,
      icon: MousePointerClick,
      description: "All time clicks",
    },
    {
      title: "Platforms",
      value: stats?.total_platforms ?? 0,
      icon: Globe,
      description: "Active agent platforms",
    },
    {
      title: "Blog Posts",
      value: stats?.total_blog_posts ?? 0,
      icon: FileText,
      description: "Published articles",
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">{card.title}</p>
                    <p className="mt-1 text-2xl font-bold text-zinc-900">
                      {card.value}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {card.description}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                    <Icon className="size-5 text-zinc-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <QuickLink href="/admin/products" label="Manage Products" />
              <QuickLink href="/admin/platforms" label="Manage Platforms" />
              <QuickLink href="/admin/blog" label="Manage Blog" />
              <QuickLink href="/admin/promoters" label="Manage Promoters" />
              <QuickLink href="/admin/settings" label="Site Settings" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
    >
      {label}
      <span className="text-zinc-400">→</span>
    </a>
  )
}
