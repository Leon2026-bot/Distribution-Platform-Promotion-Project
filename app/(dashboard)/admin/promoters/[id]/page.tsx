"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  MousePointerClick,
  Package,
  Globe,
  Link2,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import toast from "react-hot-toast"

interface PromoterDetail {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  status: string | null
  is_active: boolean | null
  permissions: Record<string, boolean> | null
  created_at: string | null
  updated_at: string | null
  total_clicks: number
  total_products: number
  total_channels: number
  recent_links: Array<{
    id: string
    code: string
    product_id: string | null
    url: string | null
    created_at: string | null
  }>
}

const permissionLabels: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  my_products: "My Products",
  custom: "Custom",
  links: "Links",
  settings: "Settings",
  decorate: "Decorate",
}

export default function PromoterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [promoter, setPromoter] = useState<PromoterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchPromoter = () => {
    if (!id) return
    fetch(`/api/admin/promoters/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPromoter(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchPromoter()
  }, [id])

  const updatePermissions = async (key: string, value: boolean) => {
    if (!promoter) return
    setSaving(true)
    const newPermissions = { ...(promoter.permissions || {}), [key]: value }
    const res = await fetch(`/api/admin/promoters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: newPermissions }),
    })
    if (res.ok) {
      toast.success("Permission updated")
      setPromoter({ ...promoter, permissions: newPermissions })
    } else {
      toast.error("Failed")
    }
    setSaving(false)
  }

  const toggleActive = async () => {
    if (!promoter) return
    setSaving(true)
    const res = await fetch(`/api/admin/promoters/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !promoter.is_active }),
    })
    if (res.ok) {
      toast.success(`Promoter ${!promoter.is_active ? "activated" : "deactivated"}`)
      setPromoter({ ...promoter, is_active: !promoter.is_active })
    } else {
      toast.error("Failed")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
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

  if (!promoter) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-500">Promoter not found.</p>
        <Link href="/admin/promoters">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 size-4" />
            Back to List
          </Button>
        </Link>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Clicks",
      value: promoter.total_clicks,
      icon: MousePointerClick,
    },
    {
      title: "Products",
      value: promoter.total_products,
      icon: Package,
    },
    {
      title: "Channels",
      value: promoter.total_channels,
      icon: Globe,
    },
    {
      title: "Links",
      value: promoter.recent_links?.length || 0,
      icon: Link2,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/promoters">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              @{promoter.username}
            </h1>
            <p className="text-sm text-zinc-500">
              {promoter.display_name || "No display name"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={promoter.is_active ? "default" : "secondary"}>
            {promoter.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={promoter.status === "active" ? "default" : "secondary"}>
            {promoter.status || "unknown"}
          </Badge>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-zinc-600">
                {promoter.avatar_url ? (
                  <img
                    src={promoter.avatar_url}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="size-6" />
                )}
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  {promoter.display_name || promoter.username}
                </p>
                <p className="text-xs text-zinc-500">@{promoter.username}</p>
              </div>
            </div>
            {promoter.bio && (
              <p className="text-sm text-zinc-600">{promoter.bio}</p>
            )}
            <div className="space-y-2 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                Registered: {promoter.created_at ? new Date(promoter.created_at).toLocaleDateString() : "—"}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                Last updated: {promoter.updated_at ? new Date(promoter.updated_at).toLocaleDateString() : "—"}
              </div>
            </div>
            <div className="pt-2">
              <Button
                variant={promoter.is_active ? "destructive" : "default"}
                size="sm"
                onClick={toggleActive}
                disabled={saving}
              >
                {promoter.is_active ? (
                  <>
                    <XCircle className="mr-2 size-4" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 size-4" />
                    Activate Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Module Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Module Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3"
                >
                  <span className="text-sm font-medium text-zinc-700">
                    {label}
                  </span>
                  <Switch
                    checked={promoter.permissions?.[key] ?? true}
                    onCheckedChange={(v) => updatePermissions(key, v)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Links */}
      {promoter.recent_links && promoter.recent_links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {promoter.recent_links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Link2 className="size-4 text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Code: {link.code}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {link.url || "No URL"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {link.created_at
                      ? new Date(link.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
