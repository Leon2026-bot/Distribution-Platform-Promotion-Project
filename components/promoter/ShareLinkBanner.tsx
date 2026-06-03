"use client"

import { useState } from "react"
import { Copy, Check, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareLinkBannerProps {
  username: string
}

export function ShareLinkBanner({ username }: ShareLinkBannerProps) {
  const [copied, setCopied] = useState(false)
  const shopUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `https://findsengine.com/${username}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shopUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement("input")
      el.value = shopUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mx-auto mt-5 flex max-w-lg items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <Share2 className="size-4 shrink-0 text-zinc-400" />
      <span className="min-w-0 flex-1 truncate text-sm text-zinc-600 font-mono select-all">
        {shopUrl}
      </span>
      <Button
        size="sm"
        variant={copied ? "default" : "outline"}
        className="shrink-0 gap-1.5"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check className="size-3.5" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  )
}
