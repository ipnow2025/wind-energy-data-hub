import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: knowledgePosts, error: knowledgeError } = await supabase
      .from("knowledge_posts")
      .select("*, view_count")
      .order("created_at", { ascending: false })

    const { data: collaborationPosts, error: collaborationError } = await supabase
      .from("collaboration_posts")
      .select("*")
      .like("board_id", "KNOWLEDGE%")
      .order("created_at", { ascending: false })

    if (knowledgeError && collaborationError) {
      console.error("[v0] Error fetching posts:", { knowledgeError, collaborationError })
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    // Combine posts from both tables
    const allPosts = [
      ...(knowledgePosts || []).map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        created_at: post.created_at,
        updated_at: post.updated_at,
        files: post.files || [],
        view_count: post.view_count || 0,
      })),
      ...(collaborationPosts || []).map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        created_at: post.created_at,
        updated_at: post.updated_at,
        files: post.files || [],
        view_count: 0,
      })),
    ]

    // Sort by created_at descending
    allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json(allPosts)
  } catch (error) {
    console.error("[v0] Error in GET /api/knowledge/posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, content, author, files } = body

    if (!title || !content || !author) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const postData = {
      title,
      content,
      author,
      files: files || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: post, error } = await supabase.from("knowledge_posts").insert([postData]).select().single()

    if (error) {
      console.error("[v0] Error creating knowledge post:", error)
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in POST /api/knowledge/posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
