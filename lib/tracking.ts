/**
 * Generate or retrieve a session ID from sessionStorage.
 * Used for anonymous click tracking across page views.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return ""

  const storageKey = "_fe_session_id"
  let sessionId = sessionStorage.getItem(storageKey)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(storageKey, sessionId)
  }

  return sessionId
}

/**
 * Extract referrer and user agent from the browser environment.
 */
export function getClientInfo(): {
  referrer: string
  user_agent: string
} {
  if (typeof window === "undefined") {
    return { referrer: "", user_agent: "" }
  }

  return {
    referrer: document.referrer || "",
    user_agent: navigator.userAgent || "",
  }
}

interface TrackClickParams {
  product_id: string
  platform_id: string
  promoter_id?: string | null
  promoter_code?: string | null
}

/**
 * Send a click event to the tracking API.
 * Called when a user clicks a "Buy Now" button.
 */
export async function trackClick(params: TrackClickParams): Promise<void> {
  const sessionId = getSessionId()
  if (!sessionId) return

  const clientInfo = getClientInfo()

  try {
    await fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "product_click",
        session_id: sessionId,
        product_id: params.product_id,
        platform_id: params.platform_id,
        promoter_id: params.promoter_id || null,
        promoter_code: params.promoter_code || null,
        referrer: clientInfo.referrer,
        user_agent: clientInfo.user_agent,
      }),
    })
  } catch {
    // Silent fail — tracking should never block user action
  }
}

interface TrackPageViewParams {
  page_url: string
  page_type: "home" | "products" | "product" | "blog" | "agents" | "agent" | "promoter" | "other"
  promoter_id?: string | null
}

/**
 * Send a page view event to the tracking API.
 * Called on page load via client component.
 */
export async function trackPageView(params: TrackPageViewParams): Promise<void> {
  const sessionId = getSessionId()
  if (!sessionId) return

  const clientInfo = getClientInfo()

  try {
    await fetch("/api/clicks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "page_view",
        session_id: sessionId,
        page_url: params.page_url,
        page_type: params.page_type,
        promoter_id: params.promoter_id || null,
        referrer: clientInfo.referrer,
        user_agent: clientInfo.user_agent,
      }),
    })
  } catch {
    // Silent fail
  }
}
