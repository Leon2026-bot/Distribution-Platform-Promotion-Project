"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  MousePointerClick,
  Package,
  Link as LinkIcon,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  total_clicks: number
  trend_data: Array<{ date: string; count: number }>
  top_products: Array<{ id: string; title: string; clicks: number }>
  click_details: Array<{
    id: string
    event_type: string
    product_id: string | null
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

export function PromoterDashboard({ username }: PromoterDashboardProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/promoter/dashboard?username=${encodeURIComponent(username)}`).then((r) => r.json()),
      fetch(`/api/promoter/stats?username=${encodeURIComponent(username)}`).then((r) => r.json()),
    ])
      .then(([dash, stat]) => {
        setDashboard(dash)
        setStats(stat)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [username])

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
      title: "Total Clicks",
      value: dashboard?.total_clicks ?? 0,
      icon: MousePointerClick,
      description: "All time clicks",
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
      description: "Clicks today",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <Link
          href={`/promoter/products/${username}`}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          + Add Products
        </Link>
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
                      {click.product_id ? `Product: ${click.product_id.slice(0, 8)}...` : "Direct"}
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
