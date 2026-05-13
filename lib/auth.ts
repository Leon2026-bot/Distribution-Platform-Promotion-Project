import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/supabase"

type PromoterRow = Database["public"]["Tables"]["promoters"]["Row"]

/**
 * Get the current logged-in user from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current promoter profile from the session.
 * Returns null if not authenticated or no promoter record.
 */
export async function getCurrentPromoter(): Promise<PromoterRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: promoter } = await supabase
    .from("promoters")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return promoter
}

/**
 * Require authentication. Throws if not logged in.
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

/**
 * Check if the current user has super_admin role.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  return user.user_metadata?.role === "super_admin"
}

/**
 * Require admin role. Throws if not admin.
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.user_metadata?.role !== "super_admin") {
    throw new Error("Forbidden: Admin access required")
  }
  return user
}
