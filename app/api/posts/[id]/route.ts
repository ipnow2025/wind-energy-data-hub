import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateApiAuth } from "@/lib/api-auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[v0] API GET /api/posts/" + id)

    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from("collaboration_posts")
      .select("*")
      .eq("id", id)
      .like("board_id", "KNOWLEDGE%")
      .single()

    console.log("[v0] API GET: Query result - error:", error, "post:", post ? "found" : "not found")

    if (error || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const responsePost = {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.board_id,
      author: post.author,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      files: post.files || [],
    }

    return NextResponse.json({ post: responsePost })
  } catch (error) {
    console.error("[v0] API GET error:", error)
    return NextResponse.json({ error: "Unknown error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("[v0] API PUT /api/posts/" + id)

  const auth = await validateApiAuth()
  console.log("[v0] API PUT: Auth result:", auth)

  if (!auth.authenticated) {
    return auth.response
  }
  const role = auth.role
  const body = await request.json()

  console.log("[v0] API PUT: Request body:", body)
  console.log("[v0] API PUT: User role:", role)

  const supabase = await createClient()

  const { data: post, error: fetchError } = await supabase
    .from("collaboration_posts")
    .select("*")
    .eq("id", id)
    .like("board_id", "KNOWLEDGE%")
    .single()

  console.log("[v0] API PUT: Fetch post result - error:", fetchError, "post:", post ? "found" : "not found")

  if (fetchError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  if (role !== "admin") {
    console.log("[v0] API PUT: Forbidden - user is not admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updateData = {
    title: body.title || post.title,
    content: body.content || post.content,
    files: body.files !== undefined ? body.files : post.files,
  }

  console.log("[v0] API PUT: Updating with data:", updateData)

  const { data: updatedPost, error: updateError } = await supabase
    .from("collaboration_posts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  console.log("[v0] API PUT: Update result - error:", updateError, "post:", updatedPost ? "updated" : "failed")

  if (updateError) {
    console.error("[v0] API PUT: Supabase update error:", updateError)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }

  const responsePost = {
    id: updatedPost.id,
    title: updatedPost.title,
    content: updatedPost.content,
    author: updatedPost.author,
    createdAt: updatedPost.created_at,
    updatedAt: updatedPost.updated_at,
    files: updatedPost.files || [],
  }

  return NextResponse.json({ post: responsePost })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("[v0] API DELETE /api/posts/" + id)

  const auth = await validateApiAuth()
  console.log("[v0] API DELETE: Auth result:", auth)

  if (!auth.authenticated) {
    return auth.response
  }
  const role = auth.role

  console.log("[v0] API DELETE: User role:", role)

  const supabase = await createClient()

  const { data: post, error: fetchError } = await supabase
    .from("collaboration_posts")
    .select("*")
    .eq("id", id)
    .like("board_id", "KNOWLEDGE%")
    .single()

  console.log("[v0] API DELETE: Fetch post result - error:", fetchError, "post:", post ? "found" : "not found")

  if (fetchError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  if (role !== "admin") {
    console.log("[v0] API DELETE: Forbidden - user is not admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error: deleteError } = await supabase.from("collaboration_posts").delete().eq("id", id)

  console.log("[v0] API DELETE: Delete result - error:", deleteError)

  if (deleteError) {
    console.error("[v0] API DELETE: Supabase delete error:", deleteError)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }

  console.log("[v0] API DELETE: Success")
  return NextResponse.json({ success: true })
}
