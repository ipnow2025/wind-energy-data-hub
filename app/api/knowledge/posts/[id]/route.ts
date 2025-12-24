import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    let post = null
    let error = null
    let isKnowledgePost = false

    const { data: knowledgePost, error: knowledgeError } = await supabase
      .from("knowledge_posts")
      .select("*")
      .eq("id", id)
      .single()

    if (knowledgePost) {
      post = knowledgePost
      isKnowledgePost = true

      await supabase
        .from("knowledge_posts")
        .update({ view_count: (knowledgePost.view_count || 0) + 1 })
        .eq("id", id)
    } else {
      // Fallback to collaboration_posts for backward compatibility
      const { data: collaborationPost, error: collaborationError } = await supabase
        .from("collaboration_posts")
        .select("*")
        .eq("id", id)
        .like("board_id", "KNOWLEDGE%")
        .single()

      if (collaborationPost) {
        post = collaborationPost
      } else {
        error = collaborationError
      }
    }

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      created_at: post.created_at,
      updated_at: post.updated_at,
      files: post.files || [],
      view_count: post.view_count || 0, // Include view_count in response
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/knowledge/posts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { title, content, author, date, files } = body

    if (!title || !content || !author) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updateData = {
      title,
      content,
      author,
      files: files || [],
      created_at: date || undefined,
      updated_at: new Date().toISOString(),
    }

    const { data: post, error } = await supabase
      .from("knowledge_posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating knowledge post:", error)
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("[v0] Error in PUT /api/knowledge/posts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("knowledge_posts").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting knowledge post:", error)
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/knowledge/posts/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
