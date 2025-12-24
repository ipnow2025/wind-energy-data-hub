import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: posts, error } = await supabase
      .from("collaboration_posts")
      .select("*")
      .like("board_id", "KNOWLEDGE%")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json([], { status: 200 })
    }

    const formattedPosts =
      posts?.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        board_id: post.board_id,
        author: post.author,
        created_at: post.created_at,
        attachments: post.files || [],
      })) || []

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("[v0] GET error:", error)
    return NextResponse.json([], { status: 200 })
  }
}
