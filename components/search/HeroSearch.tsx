"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchSuggestion {
  type: "product" | "brand" | "category"
  title: string
  slug: string
}

interface HeroSearchProps {
  placeholder?: string
  action?: string
  hotKeywords?: string[]
}

export function HeroSearch({
  placeholder = "Search sneakers, bags, electronics...",
  action = "/products",
  hotKeywords = ["Sneakers", "Bags", "Jordan", "Nike"],
}: HeroSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSuggestions = async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (value: string) => {
    setQuery(value)
    setShowDropdown(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
  }

  const handleSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title)
    setShowDropdown(false)
    if (suggestion.type === "brand") {
      window.location.href = `/products?brand=${suggestion.slug}`
    } else if (suggestion.type === "category") {
      window.location.href = `/products?category=${suggestion.slug}`
    } else {
      window.location.href = `/products/${suggestion.slug}`
    }
  }

  return (
    <div ref={containerRef} className="relative mx-auto mt-8 flex max-w-lg items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          name="q"
          type="search"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="h-11 pl-9 text-sm"
          autoComplete="off"
        />

        {/* Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
            {suggestions.map((s) => (
              <button
                key={`${s.type}-${s.slug}`}
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-zinc-50"
                onClick={() => handleSelect(s)}
              >
                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-zinc-500">
                  {s.type}
                </span>
                <span className="text-zinc-700">{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" size="lg" form="hero-search-form">
        Search
      </Button>

      {/* Hot Keywords */}
      {hotKeywords.length > 0 && !showDropdown && (
        <div className="absolute -bottom-7 left-0 flex items-center gap-2">
          <span className="text-[10px] text-zinc-400">Popular:</span>
          {hotKeywords.map((kw) => (
            <a
              key={kw}
              href={`${action}?q=${encodeURIComponent(kw)}`}
              className="text-[10px] text-zinc-500 hover:text-zinc-700 hover:underline"
            >
              {kw}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
