import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Analytics is non-critical, fail silently in development
      if (process.env.NODE_ENV === "development") {
        console.warn("[v0] Analytics: Supabase environment variables not configured. Analytics tracking disabled.")
        return NextResponse.json({ success: false, message: "Analytics not configured" }, { status: 503 })
      }
      // In production, still return 503 but don't log as error
      return NextResponse.json({ success: false, message: "Analytics service unavailable" }, { status: 503 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const body = await request.json()
    const { pagePath, sessionId } = body

    if (!pagePath || !sessionId) {
      return NextResponse.json({ error: "Missing required fields: pagePath and sessionId" }, { status: 400 })
    }

    // Get visitor IP and user agent
    const visitorIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Insert visit record
    const { error } = await supabase.from("page_visits").insert({
      page_path: pagePath,
      visitor_ip: visitorIp,
      user_agent: userAgent,
      session_id: sessionId,
      visited_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Analytics track error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics track error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to track visit" },
      { status: 500 },
    )
  }
}
