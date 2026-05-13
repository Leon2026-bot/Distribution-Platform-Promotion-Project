import Link from "next/link"
import { redirect } from "next/navigation"
import {
  LayoutDashboard,
  Globe,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  Shield,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Platforms", href: "/admin/platforms", icon: Globe },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Promoters", href: "/admin/promoters", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default async function AdminLayout({
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

  const isAdmin = user.user_metadata?.role === "super_admin"
  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-14 items-center border-b border-zinc-100 px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Shield className="size-4 text-zinc-700" />
            Admin
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
              A
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-zinc-900">
                {user.email}
              </p>
              <p className="text-xs text-zinc-400">Super Admin</p>
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
            <SheetTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <div className="flex h-14 items-center border-b border-zinc-100 px-4">
                <span className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <Shield className="size-4" />
                  Admin
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
          <span className="text-sm font-medium text-zinc-900">Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
