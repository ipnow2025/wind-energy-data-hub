import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, forceLogin } = body

    console.log("[v0] Login API: Request received", { username, forceLogin })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("[v0] Login API: Missing database configuration")
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    let supabase
    try {
      supabase = createClient(supabaseUrl, supabaseKey)
    } catch (clientError) {
      console.error("[v0] Login API: Failed to create Supabase client")
      return NextResponse.json({ error: "데이터베이스 연결에 실패했습니다." }, { status: 500 })
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, username, role")
      .eq("id", username)
      .maybeSingle()

    if (userError || !user) {
      console.log("[v0] Login API: User not found")
      return NextResponse.json({ error: "잘못된 아이디 또는 비밀번호입니다." }, { status: 401 })
    }

    const { data: passwordValid, error: passwordError } = await supabase.rpc("verify_user_password", {
      p_id: username,
      p_password: password,
    })

    if (passwordError || !passwordValid) {
      console.log("[v0] Login API: Invalid password")
      return NextResponse.json({ error: "잘못된 아이디 또는 비밀번호입니다." }, { status: 401 })
    }

    const userId = user.id
    const userRole = user.role
    const displayName = user.username

    console.log("[v0] Login API: User authenticated", { userId, userRole })

    // Check for existing session
    if (!forceLogin) {
      try {
        const { data } = await supabase.from("user_sessions").select("*").eq("user_id", userId).maybeSingle()

        if (data) {
          const expiresAt = new Date(data.expires_at)
          if (expiresAt > new Date()) {
            console.log("[v0] Login API: Active session exists")
            return NextResponse.json({ hasActiveSession: true }, { status: 200 })
          }
        }
      } catch (checkError) {
        console.error("[v0] Login API: Error checking existing session, proceeding with new session")
      }
    }

    const sessionId = crypto.randomUUID()
    console.log("[v0] Login API: Creating new session", { sessionId, userId })

    // Delete old sessions
    try {
      await supabase.from("user_sessions").delete().eq("user_id", userId)
    } catch (deleteError) {
      console.error("[v0] Login API: Error deleting old sessions, proceeding anyway")
    }

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    try {
      const { error: insertError } = await supabase.from("user_sessions").insert({
        user_id: userId,
        session_id: sessionId,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString(),
      })

      if (insertError) {
        const errorMsg = String(insertError?.message || insertError || "Unknown error")
        console.error("[v0] Login API: Session insert error:", errorMsg.substring(0, 200))
        return NextResponse.json(
          {
            error: "세션 생성에 실패했습니다.",
            details: errorMsg.substring(0, 100),
          },
          { status: 500 },
        )
      }
    } catch (insertException) {
      const errorMsg = insertException instanceof Error ? insertException.message : String(insertException)
      console.error("[v0] Login API: Session insert exception:", errorMsg.substring(0, 200))
      return NextResponse.json(
        {
          error: "세션 생성에 실패했습니다.",
          details: errorMsg.substring(0, 100),
        },
        { status: 500 },
      )
    }

    console.log("[v0] Login API: Login successful")
    return NextResponse.json({
      success: true,
      role: userRole,
      sessionData: {
        sessionId,
        userId,
        username: displayName,
        role: userRole,
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Login API: Unexpected error:", errorMsg.substring(0, 200))
    return NextResponse.json({ error: `서버 오류가 발생했습니다: ${errorMsg.substring(0, 50)}` }, { status: 500 })
  }
}
