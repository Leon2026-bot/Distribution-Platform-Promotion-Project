"use client"

import { useCurrency } from "@/components/providers/CurrencyProvider"

interface PriceDisplayProps {
  priceCny: number
  className?: string
  showOriginal?: boolean
}

export function PriceDisplay({ priceCny, className = "", showOriginal = false }: PriceDisplayProps) {
  const { convert, symbol, currency } = useCurrency()
  const value = convert(priceCny)

  const formatted =
    currency === "CNY"
      ? `${symbol}${Math.round(value).toLocaleString()}`
      : `${symbol}${value.toFixed(2)}`

  return (
    <span className={className}>
      {formatted}
      {showOriginal && currency !== "CNY" && (
        <span className="ml-1 text-xs text-zinc-400">¥{priceCny}</span>
      )}
    </span>
  )
}

export function PriceWithOriginal({ priceCny, className = "" }: PriceDisplayProps) {
  return <PriceDisplay priceCny={priceCny} className={className} showOriginal />
}
