import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const board = searchParams.get("board")

    console.log("[v0] Email API: board parameter:", board)

    if (!board || board === "ALL") {
      return NextResponse.json({ email: null })
    }

    const userId = board.replace(/\s+/g, "").toLowerCase()
    console.log("[v0] Email API: converted userId:", userId)

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: user, error } = await supabase.from("users").select("email").eq("id", userId).maybeSingle()

    console.log("[v0] Email API: query result:", { user, error })

    if (error || !user) {
      return NextResponse.json({ email: null })
    }

    return NextResponse.json({ email: user.email })
  } catch (error) {
    console.error("[v0] Failed to fetch user email:", error)
    return NextResponse.json({ email: null })
  }
}
