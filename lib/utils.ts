import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cny: number, rate?: number): string {
  const usdRate = rate ?? parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "7.2")
  return `$${(cny / usdRate).toFixed(2)}`
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function extractSourceItemId(url: string): string | null {
  // 淘宝 / 天猫
  const taobaoMatch = url.match(/[?&]id=(\d+)/)
  if (taobaoMatch) return taobaoMatch[1]
  // 1688
  const alibababMatch = url.match(/\/offer\/(\d+)/)
  if (alibababMatch) return alibababMatch[1]
  return null
}

export function buildPromoUrl(
  template: string,
  itemId: string,
  memberId: string
): string {
  return template
    .replace('{item_id}', itemId)
    .replace('{member_id}', memberId)
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.webp'
  if (path.startsWith('http')) return path
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${path}`
}
