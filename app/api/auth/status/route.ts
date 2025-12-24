import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

async function queryWithRetry(supabase: any, userId: string, sessionId: string, maxRetries = 2) {
  let lastError = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("session_id", sessionId)
        .maybeSingle()

      if (!error) {
        return { data, error: null }
      }

      lastError = error

      if (attempt < maxRetries) {
        const waitTime = 500 * (attempt + 1)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    } catch (err) {
      lastError = err
      if (attempt < maxRetries) {
        const waitTime = 500 * (attempt + 1)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  return { data: null, error: lastError }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id")
    const sessionId = request.headers.get("X-Session-Id")

    if (!userId || !sessionId) {
      return NextResponse.json({ isLoggedIn: false, reason: "missing_credentials" }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ isLoggedIn: false, reason: "config_error" }, { status: 500 })
    }

    let supabase
    try {
      supabase = createClient(supabaseUrl, supabaseKey)
    } catch (error) {
      return NextResponse.json({ isLoggedIn: false, reason: "client_error" }, { status: 500 })
    }

    const { data, error } = await queryWithRetry(supabase, userId, sessionId)

    if (error) {
      const errorStr = String(error?.message || error || "")

      if (
        errorStr.includes("Too Many") ||
        errorStr.includes("rate limit") ||
        errorStr.includes("429") ||
        errorStr.toLowerCase().includes("too many r")
      ) {
        return NextResponse.json({ isLoggedIn: true })
      }

      console.error("[v0] Auth Status: Database error:", errorStr.substring(0, 100))
      return NextResponse.json({ isLoggedIn: false, reason: "db_error" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ isLoggedIn: false, reason: "not_found" }, { status: 401 })
    }

    const expiresAt = new Date(data.expires_at)
    const now = new Date()

    if (expiresAt < now) {
      await supabase.from("user_sessions").delete().eq("user_id", userId)
      return NextResponse.json({ isLoggedIn: false, reason: "expired" }, { status: 401 })
    }

    const lastActivity = data.last_activity ? new Date(data.last_activity) : new Date(data.created_at)
    const tenMinutesAgo = new Date()
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10)

    if (lastActivity < tenMinutesAgo) {
      await supabase.from("user_sessions").delete().eq("user_id", userId)
      return NextResponse.json({ isLoggedIn: false, reason: "inactivity" }, { status: 401 })
    }

    const fiveMinutesFromNow = new Date()
    fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5)

    if (expiresAt < fiveMinutesFromNow) {
      const newExpiresAt = new Date()
      newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 10)

      try {
        await supabase
          .from("user_sessions")
          .update({ expires_at: newExpiresAt.toISOString() })
          .eq("user_id", userId)
          .eq("session_id", sessionId)
      } catch (refreshError) {
        // Silently ignore refresh errors
      }
    }

    return NextResponse.json({ isLoggedIn: true })
  } catch (error) {
    return NextResponse.json({ isLoggedIn: false, reason: "unexpected_error" }, { status: 500 })
  }
}
