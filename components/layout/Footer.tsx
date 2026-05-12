import Link from "next/link"

const footerSections = [
  {
    title: "Browse",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Brands", href: "/brands" },
      { label: "Categories", href: "/categories" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Agents", href: "/partners" },
      { label: "Blog", href: "/blog" },
      { label: "For Promoters", href: "/promoter/register" },
    ],
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 bg-zinc-900 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-lg font-bold tracking-tight text-white">
                Finds<span className="text-zinc-500"> Engine</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              Discover 150,000+ products from 380+ brands. Search by keyword.
              Compare prices across trusted agents.
            </p>
            {/* Social Links Placeholder */}
            <div className="mt-4 flex gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                X
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                IG
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                YT
              </span>
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white">
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-zinc-800 pt-6">
          <p className="text-center text-xs text-zinc-500">
            &copy; {currentYear} Finds Engine. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
