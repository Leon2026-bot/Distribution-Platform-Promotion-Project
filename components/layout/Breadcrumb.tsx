import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-zinc-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5 text-zinc-300" />}
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-zinc-700"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
