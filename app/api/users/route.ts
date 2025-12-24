import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    console.log("[v0] Fetching users from database")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("[v0] Supabase credentials not configured")
      return NextResponse.json({ error: "데이터베이스 설정이 필요합니다" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: users, error } = await supabase.from("users").select("id, username, role, created_at, updated_at")

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "사용자 목록을 불러오는데 실패했습니다" }, { status: 500 })
    }

    console.log("[v0] Users fetched:", users?.length || 0)

    const sortedUsers = (users || []).sort((a, b) => {
      // Admin users first
      if (a.role === "admin" && b.role !== "admin") return -1
      if (a.role !== "admin" && b.role === "admin") return 1

      // For same role, sort by updated_at or created_at (most recent first)
      const aDate = new Date(a.updated_at || a.created_at).getTime()
      const bDate = new Date(b.updated_at || b.created_at).getTime()
      return bDate - aDate
    })

    return NextResponse.json({
      users: sortedUsers,
    })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "사용자 목록을 불러오는데 실패했습니다" }, { status: 500 })
  }
}
