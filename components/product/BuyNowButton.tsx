"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"

type AgentPlatform = Database["public"]["Tables"]["agent_platforms"]["Row"]

interface BuyNowButtonProps {
  platform: AgentPlatform
  product: {
    id: string
    title: string
    source_item_id: string | null
  }
  memberId: string
  onClick?: () => void
}

function buildJumpUrl(
  platform: AgentPlatform,
  product: { source_item_id: string | null },
  memberId: string
): string {
  const template = platform.jump_url_template
  if (!template) return "#"
  return template
    .replace("{item_id}", product.source_item_id || "")
    .replace("{member_id}", memberId || "")
}

export function BuyNowButton({
  platform,
  product,
  memberId,
  onClick,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)

    // Call onClick callback (for tracking, implemented in Task 6)
    onClick?.()

    // Build and open jump URL
    const url = buildJumpUrl(platform, product, memberId)
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer")
    }

    setIsLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading || !product.source_item_id}
      className="gap-1.5 text-xs"
    >
      Buy on {platform.name}
      <ExternalLink className="size-3" />
    </Button>
  )
}
