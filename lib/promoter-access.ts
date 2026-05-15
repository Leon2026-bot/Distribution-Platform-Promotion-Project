import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { isModuleEnabled, type ModuleKey } from "@/lib/permissions"

export interface PromoterAccessResult {
  promoter: {
    id: string
    username: string
    permissions: Record<string, boolean> | null
    is_active: boolean | null
  } | null
  userId: string | null
  error: NextResponse | null
}

/**
 * Check promoter access for API routes.
 * Returns promoter data if authorized, or an error response.
 */
export async function checkPromoterAccess(
  requiredModule?: ModuleKey
): Promise<PromoterAccessResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      promoter: null,
      userId: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  // Use service client to bypass RLS
  const serviceClient = createServiceClient()
  const { data: promoter } = await serviceClient
    .from("promoters")
    .select("id, username, permissions, is_active")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!promoter) {
    return {
      promoter: null,
      userId: null,
      error: NextResponse.json({ error: "Promoter not found" }, { status: 404 }),
    }
  }

  // Check account activation
  if (promoter.is_active === false) {
    return {
      promoter: null,
      userId: null,
      error: NextResponse.json(
        { error: "Account inactive" },
        { status: 403 }
      ),
    }
  }

  // Check module permission
  const permissions = promoter.permissions as Record<string, boolean> | null
  if (requiredModule && !isModuleEnabled(permissions, requiredModule)) {
    return {
      promoter: null,
      userId: null,
      error: NextResponse.json(
        { error: "Module disabled" },
        { status: 403 }
      ),
    }
  }

  return {
    promoter: {
      id: promoter.id,
      username: promoter.username,
      permissions: promoter.permissions as Record<string, boolean> | null,
      is_active: promoter.is_active,
    },
    userId: user.id,
    error: null,
  }
}
