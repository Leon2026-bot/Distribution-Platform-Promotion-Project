"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Search, Menu, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useCurrency, type Currency } from "@/components/providers/CurrencyProvider"

const navLinks = [
  { label: "Browse", href: "/products", children: [
    { label: "All Products", href: "/products" },
    { label: "Brands", href: "/brands" },
    { label: "Categories", href: "/category/sneakers" },
  ]},
  { label: "Agents", href: "/partners" },
  { label: "Blog", href: "/blog" },
]

const CURRENCY_LABELS: Record<Currency, string> = {
  CNY: "CNY ¥",
  USD: "USD $",
  EUR: "EUR €",
}

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { currency, setCurrency, symbol } = useCurrency()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const isDashboard = pathname.startsWith("/promoter") || pathname.startsWith("/admin")

  // Check if current page is a promoter's shop page (/{username})
  const pathSegments = pathname.split("/").filter(Boolean)
  const firstSegment = pathSegments[0] ?? ""
  const knownRoutes = [
    "products", "brands", "blog", "search", "login", "register",
    "category", "brand", "partners", "admin", "promoter", "api", "auth",
  ]
  const isPromoterShop = pathSegments.length >= 1 && !knownRoutes.includes(firstSegment)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-[#0d1117]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold tracking-tight text-white">
            {isDashboard ? "Promotion" : "Finds"}
            <span className="text-orange-400">{isDashboard ? " Dashboard" : " Engine"}</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isDashboard && (
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) =>
              link.children ? (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white ${
                      pathname.startsWith(link.href)
                        ? "text-white"
                        : "text-zinc-400"
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.href}>
                        <Link href={child.href} className="flex w-full">
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white ${
                    pathname === link.href
                      ? "text-white"
                      : "text-zinc-400"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        )}

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-2 md:flex">
          {!isDashboard && (
            <>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-80 border-zinc-700/60 bg-white/5 pl-8 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-orange-500/50"
                />
              </form>

              {/* Currency Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">
                  <span className="text-sm font-medium">{symbol}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  {(Object.keys(CURRENCY_LABELS) as Currency[]).map((c) => (
                    <DropdownMenuItem
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={currency === c ? "bg-zinc-100 font-medium" : ""}
                    >
                      {CURRENCY_LABELS[c]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {!isPromoterShop && (
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
              )}
              <Link href="/register">
                <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600">Register</Button>
              </Link>
            </>
          )}

          {isDashboard && (
            (() => {
              // Extract username from /promoter/*/{username} URL
              const segments = pathname.split("/").filter(Boolean)
              const username = segments.length >= 3 && segments[0] === "promoter"
                ? segments[segments.length - 1]
                : null
              const frontendUrl = username ? `/${username}` : "/"
              return (
                <a href={frontendUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    Access Frontend
                  </Button>
                </a>
              )
            })()
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#0d1117] shadow-xl border-l border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <span className="text-lg font-bold text-white">
                Finds<span className="text-orange-400"> Engine</span>
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="px-4 py-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-zinc-700 bg-white/5 pl-8 text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              </form>
            </div>
            <nav className="flex flex-col px-2">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-6 py-2 text-sm text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-white/5 ${
                      pathname === link.href
                        ? "text-white"
                        : "text-zinc-400"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="my-2 h-px bg-zinc-800" />
              <Link
                href="/promoter/register"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              >
                For Promoters
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-md bg-orange-500 px-3 py-2.5 text-center text-sm font-bold text-white hover:bg-orange-600"
              >
                Register
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
