"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  MousePointerClick,
  Package,
  Link as LinkIcon,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AreaChart, Area, ResponsiveContainer } from "recharts"

interface DashboardData {
  total_clicks: number
  prev_total_clicks: number
  trend_data: Array<{ date: string; count: number }>
  top_products: Array<{ id: string; title: string; clicks: number }>
  click_details: Array<{
    id: string
    event_type: string
    product_id: string | null
    product_title: string | null
    platform_id: string | null
    created_at: string | null
  }>
}

interface StatsData {
  promoted_products: number
  configured_channels: number
  total_platforms: number
}

interface PromoterDashboardProps {
  username: string
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

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  if (Math.abs(pct) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400">
        <Minus className="size-3" /> 0%
      </span>
    )
  }
  const isUp = pct > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] ${isUp ? "text-green-600" : "text-red-500"}`}>
      {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {isUp ? "+" : ""}{pct.toFixed(0)}%
    </span>
  )
}

export function PromoterDashboard({ username }: PromoterDashboardProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>("all")

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("username", username)
    const dateRange = getDateRange(timeRange)
    if (dateRange.from) params.set("from", dateRange.from)
    if (dateRange.to) params.set("to", dateRange.to)

    Promise.all([
      fetch(`/api/promoter/dashboard?${params.toString()}`).then((r) => r.json()),
      fetch(`/api/promoter/stats?username=${encodeURIComponent(username)}`).then((r) => r.json()),
    ])
      .then(([dash, stat]) => {
        setDashboard(dash)
        setStats(stat)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username, timeRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const statCards: Array<{
    title: string
    value: number | string
    icon: any
    description: string
    trend?: React.ReactNode
  }> = [
    {
      title: "Total Clicks",
      value: dashboard?.total_clicks ?? 0,
      icon: MousePointerClick,
      description: timeRange === "all" ? "All time clicks" : `Clicks in selected range`,
      trend: timeRange !== "all" ? (
        <TrendBadge current={dashboard?.total_clicks ?? 0} previous={dashboard?.prev_total_clicks ?? 0} />
      ) : null,
    },
    {
      title: "Products",
      value: stats?.promoted_products ?? 0,
      icon: Package,
      description: "In your shop",
    },
    {
      title: "Channels",
      value: `${stats?.configured_channels ?? 0}/${stats?.total_platforms ?? 0}`,
      icon: LinkIcon,
      description: "Platforms configured",
    },
    {
      title: "Trend",
      value: dashboard?.trend_data?.length
        ? `+${dashboard.trend_data[dashboard.trend_data.length - 1]?.count ?? 0}`
        : "0",
      icon: TrendingUp,
      description: "Latest period clicks",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <div className="flex items-center gap-3">
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
          <Link
            href={`/promoter/products/${username}`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            + Add Products
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
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
                    {card.trend && <div className="mt-0.5">{card.trend}</div>}
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

      {/* Click Trend Sparkline */}
      {dashboard?.trend_data && dashboard.trend_data.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              Click Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={dashboard.trend_data}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#18181b"
                  strokeWidth={2}
                  fill="url(#clickGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Click Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.click_details && dashboard.click_details.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {dashboard.click_details.map((click) => (
                <div
                  key={click.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {click.event_type === "buy_click"
                        ? "Buy Click"
                        : click.event_type === "product_view"
                          ? "Product View"
                          : click.event_type}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {click.product_title
                        ? click.product_title
                        : click.product_id
                          ? `Product: ${click.product_id.slice(0, 8)}...`
                          : "Direct"}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {click.created_at
                      ? new Date(click.created_at).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-zinc-400">
              No clicks yet. Share your shop to start getting traffic!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.top_products && dashboard.top_products.length > 0 ? (
            <div className="divide-y divide-zinc-100">
              {dashboard.top_products.map((product, idx) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-zinc-900">
                      {product.title}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">
                    {product.clicks} clicks
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-zinc-400">
              No product clicks yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
