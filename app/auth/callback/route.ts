import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user and determine redirect target
      const { data: { user } } = await supabase.auth.getUser()
      const isAdmin =
        user?.user_metadata?.role === "super_admin" ||
        user?.app_metadata?.role === "super_admin"

      if (isAdmin) {
        return NextResponse.redirect(`${origin}/admin/dashboard`)
      }

      // Promoter: username is stored in user_metadata (avoids RLS issues on promoters table)
      const username = user?.user_metadata?.username as string | undefined

      if (username) {
        return NextResponse.redirect(`${origin}/promoter/dashboard/${username}`)
      }

      return NextResponse.redirect(`${origin}/promoter/dashboard`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
