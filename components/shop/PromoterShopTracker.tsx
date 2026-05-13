"use client"

import { useEffect } from "react"
import { getSessionId, getClientInfo } from "@/lib/tracking"

interface PromoterShopTrackerProps {
  promoterId: string
}

export function PromoterShopTracker({ promoterId }: PromoterShopTrackerProps) {
  useEffect(() => {
    const sessionId = getSessionId()
    if (!sessionId) return

    const clientInfo = getClientInfo()

    fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "promoter_shop_view",
        session_id: sessionId,
        promoter_id: promoterId,
        referrer: clientInfo.referrer,
        user_agent: clientInfo.user_agent,
      }),
    }).catch(() => {
      // Silent fail — tracking should never block user action
    })
  }, [promoterId])

  return null
}
