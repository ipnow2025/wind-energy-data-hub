import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// Update last activity time for the session
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id")
    const sessionId = request.headers.get("X-Session-Id")

    if (!userId || !sessionId) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: false }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update last_activity timestamp
    const { error } = await supabase
      .from("user_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("session_id", sessionId)

    if (error) {
      console.error("[v0] Activity update error:", error)
      return NextResponse.json({ success: false }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Activity update error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
