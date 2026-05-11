"use client"

import { useEffect } from "react"
import { trackPageView } from "@/lib/tracking"
import { checkUrlAttribution } from "@/lib/attribution"

interface ProductViewTrackerProps {
  productId: string
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    // Check for ?ref= attribution param
    checkUrlAttribution()

    // Track page view
    trackPageView({
      page_url: window.location.pathname,
      page_type: "product",
    }).catch(() => {
      // Silent fail
    })
  }, [productId])

  return null
}
