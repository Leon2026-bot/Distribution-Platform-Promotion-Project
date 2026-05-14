import Link from "next/link"
import { redirect } from "next/navigation"
import {
  LayoutDashboard,
  PackageSearch,
  PackageCheck,
  PlusCircle,
  Link2,
  Settings,
  Paintbrush,
  LogOut,
  Menu,
} from "lucide-react"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { label: "Dashboard", href: "/promoter/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/promoter/products", icon: PackageSearch },
  { label: "My Products", href: "/promoter/my-products", icon: PackageCheck },
  { label: "Custom", href: "/promoter/custom", icon: PlusCircle },
  { label: "Links", href: "/promoter/links", icon: Link2 },
  { label: "Settings", href: "/promoter/settings", icon: Settings },
  { label: "Decorate", href: "/promoter/decorate", icon: Paintbrush },
]

export default async function PromoterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Use service client to bypass RLS for promoter lookup
  // User identity is already verified above via getUser()
  const serviceClient = createServiceClient()
  const {
    data: promoter,
    error: promoterError,
  } = await serviceClient
    .from("promoters")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!promoter || promoterError) {
    // Diagnostic mode: show error instead of silent redirect
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <div className="max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-lg font-bold text-red-700">
            Promoter 查询失败
          </h1>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-zinc-700">当前 User ID:</span>
              <code className="mt-1 block rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-900">
                {user.id}
              </code>
            </div>
            <div>
              <span className="font-semibold text-zinc-700">User Email:</span>
              <code className="mt-1 block rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-900">
                {user.email}
              </code>
            </div>
            {promoterError && (
              <div>
                <span className="font-semibold text-zinc-700">查询错误:</span>
                <code className="mt-1 block rounded bg-red-50 px-2 py-1 text-xs text-red-800">
                  {promoterError.message} (code: {promoterError.code})
                </code>
              </div>
            )}
            {!promoterError && (
              <div className="text-red-700">
                promoters 表中找不到 user_id 匹配的记录。
              </div>
            )}
            <hr className="border-zinc-200" />
            <p className="text-zinc-500">
              请把上面 User ID 复制到 Supabase SQL Editor 执行：
            </p>
            <code className="block rounded bg-zinc-900 px-3 py-2 text-xs text-green-400">
              SELECT * FROM promoters WHERE user_id = &apos;{user.id}&apos;;
            </code>
            <a
              href="/login"
              className="inline-block text-sm text-zinc-900 underline"
            >
              返回登录页
            </a>
          </div>
        </div>
      </div>
    )
  }

  const { data: channels } = await supabase
    .from("promoter_channels")
    .select("*")
    .eq("promoter_id", promoter.id)

  const { data: allPlatforms } = await supabase
    .from("agent_platforms")
    .select("*")
    .eq("is_active", true)

  const configuredCount = channels?.length ?? 0
  const totalPlatforms = allPlatforms?.length ?? 0
  const missingChannels = totalPlatforms - configuredCount

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <nav className="flex-1 space-y-1 p-3 pt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-zinc-100 p-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500">
              {promoter.display_name?.charAt(0) ?? "P"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-zinc-900">
                {promoter.display_name}
              </p>
              <p className="text-xs text-zinc-400">@{promoter.username}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post" className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs text-zinc-500"
              type="submit"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-zinc-200 bg-white px-4 lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Menu className="size-5" />
                </button>
              }
            />
            <SheetContent side="left" className="w-60 p-0">
              <div className="flex h-14 items-center border-b border-zinc-100 px-4">
                <span className="text-sm font-bold text-zinc-900">
                  Finds Engine
                </span>
              </div>
              <nav className="space-y-1 p-3">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium text-zinc-900">
            {promoter.display_name}
          </span>
        </header>

        {/* Channel alert banner */}
        {missingChannels > 0 && (
          <div className="bg-red-50 px-4 py-2 text-sm text-red-700">
            <span className="font-medium">⚠️ Channel config incomplete.</span>{" "}
            You have {missingChannels} platform(s) without MemberID configured.{" "}
            <Link
              href="/promoter/settings"
              className="font-medium underline underline-offset-2"
            >
              Configure Now
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
