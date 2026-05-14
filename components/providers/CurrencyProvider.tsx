"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

export type Currency = "CNY" | "USD" | "EUR"

interface CurrencyContextValue {
  currency: Currency
  setCurrency: (c: Currency) => void
  convert: (priceCny: number) => number
  symbol: string
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CNY: "¥",
  USD: "$",
  EUR: "€",
}

const USD_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "7.2")
const EUR_RATE = parseFloat(process.env.NEXT_PUBLIC_EUR_RATE || "7.8")

function getRate(target: Currency): number {
  switch (target) {
    case "CNY":
      return 1
    case "USD":
      return USD_RATE
    case "EUR":
      return EUR_RATE
  }
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD")

  useEffect(() => {
    const saved = localStorage.getItem("preferred-currency") as Currency | null
    if (saved && ["CNY", "USD", "EUR"].includes(saved)) {
      setCurrencyState(saved)
    }
  }, [])

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem("preferred-currency", c)
  }, [])

  const convert = useCallback(
    (priceCny: number) => {
      return priceCny / getRate(currency)
    },
    [currency]
  )

  const symbol = CURRENCY_SYMBOLS[currency]

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}
