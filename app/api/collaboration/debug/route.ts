import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all posts with their board_id
    const { data: posts, error } = await supabase
      .from("collaboration_posts")
      .select("id, title, author, board_id, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching posts:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Count posts by board_id
    const boardCounts: Record<string, number> = {}
    posts?.forEach((post) => {
      const boardId = post.board_id || "null"
      boardCounts[boardId] = (boardCounts[boardId] || 0) + 1
    })

    console.log("[v0] Total posts:", posts?.length)
    console.log("[v0] Posts by board:", boardCounts)
    console.log("[v0] Sample posts:", posts?.slice(0, 5))

    return NextResponse.json({
      totalPosts: posts?.length || 0,
      postsByBoard: boardCounts,
      samplePosts: posts?.slice(0, 10),
      allPosts: posts,
    })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
