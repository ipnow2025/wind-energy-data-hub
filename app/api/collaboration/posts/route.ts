import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { validateApiAuth } from "@/lib/api-auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiAuth()
    if (!auth.authenticated) {
      return auth.response
    }

    console.log("[v0] ==================== GET /api/collaboration/posts ====================")
    console.log("[v0] Authenticated role:", auth.role)

    const searchParams = request.nextUrl.searchParams
    const guestId = searchParams.get("guestId")

    console.log("[v0] Query parameter guestId:", guestId)

    const supabase = await createClient()

    if (auth.role === "admin" && guestId) {
      console.log("[v0] ADMIN FILTERING - Board:", guestId)

      const { data: posts, error } = await supabase
        .from("collaboration_posts")
        .select("*")
        .or(`board_id.eq.${guestId},board_id.eq.ALL`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
      }

      console.log("[v0] Posts found for board '" + guestId + "':", posts?.length || 0)

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

      console.log("[v0] Admin - Returning", formattedPosts.length, "posts")
      return NextResponse.json({ posts: formattedPosts })
    } else if (auth.role === "guest") {
      const boardId = auth.userId?.toUpperCase()
      console.log("[v0] Guest viewing own board:", boardId, "(original:", auth.userId, ")")
      const { data: posts, error } = await supabase
        .from("collaboration_posts")
        .select("*")
        .or(`board_id.eq.${boardId},board_id.eq.ALL`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
      }

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

      console.log("[v0] Guest - User posts count:", formattedPosts.length)
      return NextResponse.json({ posts: formattedPosts })
    } else if (auth.role === "admin") {
      console.log("[v0] Admin viewing all boards")
      const { data: boards, error } = await supabase.from("collaboration_posts").select("board_id").order("board_id")

      if (error) {
        console.error("[v0] Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 })
      }

      const uniqueBoards = [...new Set(boards?.map((b) => b.board_id) || [])]
      return NextResponse.json({ boards: uniqueBoards })
    }

    console.log("[v0] ==================== END GET ====================")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("[v0] GET error:", error)
    return NextResponse.json({ error: "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] ========== POST HANDLER CALLED ==========")

  try {
    console.log("[v0] Step 1: Validating authentication")
    const auth = await validateApiAuth()
    if (!auth.authenticated) {
      console.log("[v0] Step 2: Authentication failed")
      return auth.response
    }

    console.log("[v0] Step 2: Authentication successful")
    const cookieStore = await cookies()
    const usernameCookie = cookieStore.get("username")

    console.log("[v0] Step 3: Parsing request body")
    const body = await request.json()
    console.log("[v0] Step 4: Body parsed", body)

    const { title, content } = body

    if (!title || !content) {
      console.log("[v0] Step 5: Validation failed - missing fields")
      return NextResponse.json({ error: "제목과 내용은 필수입니다" }, { status: 400 })
    }

    const role = auth.role
    const authorName = role === "admin" ? "KIER(관리자)" : body.author || auth.userId || "unknown"
    const boardId = role === "admin" && body.board ? body.board.toUpperCase() : auth.userId?.toUpperCase()

    console.log("[v0] Step 7: Creating Supabase client")
    const supabase = await createClient()

    console.log("[v0] Step 8: Inserting post into database", {
      author: authorName,
      boardId: boardId,
    })
    const { data: newPost, error } = await supabase
      .from("collaboration_posts")
      .insert({
        title,
        content,
        author: authorName,
        board_id: boardId,
        files: body.files || [],
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      return NextResponse.json({ error: "게시글 작성에 실패했습니다" }, { status: 500 })
    }

    console.log("[v0] Step 9: Post created successfully", {
      postId: newPost.id,
    })

    const responsePost = {
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      author: newPost.author,
      authorRole: role || "guest",
      createdAt: newPost.created_at,
      updatedAt: newPost.updated_at,
      files: newPost.files || [],
      board_id: newPost.board_id,
    }

    console.log("[v0] ========== POST HANDLER SUCCESS ==========")
    return NextResponse.json({ post: responsePost }, { status: 201 })
  } catch (error) {
    console.error("[v0] ========== POST HANDLER ERROR ==========")
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    console.error("[v0] ========== END ERROR ==========")

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
