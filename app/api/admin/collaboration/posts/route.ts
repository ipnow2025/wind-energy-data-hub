import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { validateApiAuth } from "@/lib/api-auth"

export const dynamic = "force-dynamic"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiAuth()
    if (!auth.authenticated) {
      return auth.response
    }

    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    console.log("[v0] Admin fetching all collaboration posts")

    const { data: posts, error } = await supabase
      .from("collaboration_posts")
      .select("*")
      .not("board_id", "like", "KNOWLEDGE%")
      .order("created_at", { ascending: false })

    if (error) throw error

    const formattedPosts =
      posts?.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        authorRole: "guest" as const,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        guestId: post.board_id,
        board_id: post.board_id,
        files: post.files || [],
      })) || []

    console.log("[v0] Admin - Total posts fetched:", formattedPosts.length)
    console.log(
      "[v0] Admin - Sample board_ids:",
      formattedPosts.slice(0, 3).map((p) => p.board_id),
    )

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error("Failed to fetch all posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
