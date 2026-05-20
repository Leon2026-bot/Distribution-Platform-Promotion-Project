"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Package,
  Users,
  MousePointerClick,
  Globe,
  FileText,
  TrendingUp,
  Award,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface AdminStats {
  total_products: number
  total_promoters: number
  total_clicks: number
  total_platforms: number
  total_blog_posts: number
  trend_data: Array<{ date: string; count: number }>
  top_products: Array<{ id: string; title: string; clicks: number }>
  filter_username: string | null
}

interface PromoterOption {
  id: string
  username: string
  display_name: string | null
}

const timeRanges = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "This Month", value: "month" },
]

function getDateRange(value: string): { from?: string; to?: string } {
  const now = new Date()
  const to = now.toISOString().split("T")[0]

  switch (value) {
    case "today": {
      const from = to
      return { from, to }
    }
    case "7d": {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      return { from: d.toISOString().split("T")[0], to }
    }
    case "30d": {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return { from: d.toISOString().split("T")[0], to }
    }
    case "month": {
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
      return { from, to }
    }
    default:
      return {}
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [promoters, setPromoters] = useState<PromoterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsername, setSelectedUsername] = useState<string>("all")
  const [timeRange, setTimeRange] = useState<string>("all")

  const fetchStats = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedUsername && selectedUsername !== "all") {
      params.set("username", selectedUsername)
    }
    const dateRange = getDateRange(timeRange)
    if (dateRange.from) params.set("from", dateRange.from)
    if (dateRange.to) params.set("to", dateRange.to)

    fetch(`/api/admin/stats?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedUsername, timeRange])

  const fetchPromoters = useCallback(() => {
    fetch("/api/admin/promoters")
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          console.error("Promoters API error:", r.status, data)
          setPromoters([])
          return
        }
        if (Array.isArray(data)) {
          setPromoters(data)
        } else {
          setPromoters([])
          console.error("Promoters API returned non-array:", data)
        }
      })
      .catch((err) => {
        console.error("Promoters API fetch failed:", err)
        setPromoters([])
      })
  }, [])

  useEffect(() => {
    fetchPromoters()
    fetchStats()
  }, [fetchPromoters, fetchStats])

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
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
      description: "Filtered clicks",
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-3">
          <Select value={selectedUsername} onValueChange={(v) => setSelectedUsername(v || "all")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by promoter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Promoters</SelectItem>
              {promoters.map((p) => (
                <SelectItem key={p.id} value={p.username}>
                  @{p.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(v) => setTimeRange(v || "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedUsername !== "all" && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Showing data for promoter: <span className="font-medium">@{selectedUsername}</span>
        </div>
      )}

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
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              Click Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.trend_data && stats.trend_data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.trend_data}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px" }}
                    labelStyle={{ color: "#27272a" }}
                  />
                  <Bar dataKey="count" fill="#18181b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-400">No click data for selected range.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="size-4" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.top_products && stats.top_products.length > 0 ? (
              <div className="space-y-3">
                {stats.top_products.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                      {i + 1}
                    </span>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium text-zinc-900">{p.title}</p>
                    </div>
                    <span className="text-xs font-medium text-zinc-500">{p.clicks} clicks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-400">No product click data.</p>
            )}
          </CardContent>
        </Card>
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
