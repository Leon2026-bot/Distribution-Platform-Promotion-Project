const COOKIE_NAME = "_fg_ref"
const STORAGE_KEY = "_attribution"
const EXPIRY_DAYS = 7

/**
 * Set attribution for a promoter. Last Click Wins — always overwrites.
 * Writes to both localStorage and Cookie for redundancy.
 */
export function setAttribution(username: string): void {
  if (typeof window === "undefined") return

  const payload = JSON.stringify({
    username,
    timestamp: Date.now(),
  })

  // localStorage
  try {
    localStorage.setItem(STORAGE_KEY, payload)
  } catch {
    // localStorage may be full or disabled
  }

  // Cookie with 7-day expiry
  const expires = new Date()
  expires.setTime(expires.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(username)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

/**
 * Get the current attributed promoter username.
 * Reads from localStorage first, falls back to Cookie.
 */
export function getAttribution(): string | null {
  if (typeof window === "undefined") return null

  // Try localStorage first
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as { username: string; timestamp: number }
      // Check if within expiry
      const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000
      if (Date.now() - parsed.timestamp < expiryMs) {
        return parsed.username
      }
      // Expired, clean up
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore
  }

  // Fallback to Cookie
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`))
  if (match) {
    return decodeURIComponent(match[1]) || null
  }

  return null
}

/**
 * Clear all attribution data (both localStorage and Cookie).
 */
export function clearAttribution(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore
  }

  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

/**
 * Check URL params for ?ref=xxx and set attribution if found.
 * Call this on page load (client-side).
 */
export function checkUrlAttribution(): void {
  if (typeof window === "undefined") return

  const params = new URLSearchParams(window.location.search)
  const ref = params.get("ref")
  if (ref && ref.trim()) {
    setAttribution(ref.trim())
  }
}
