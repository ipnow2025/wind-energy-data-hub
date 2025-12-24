import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validateApiAuth } from "@/lib/api-auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiAuth()
  if (!auth.authenticated) {
    return auth.response
  }

  const { id } = await params
  const userId = auth.userId
  const role = auth.role

  const supabase = await createClient()

  const { data: post, error } = await supabase.from("collaboration_posts").select("*").eq("id", id).single()

  if (error || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  // 권한 체크 개선
  if (role !== "admin") {
    // admin이 아닌 경우
    if (post.board_id === "ALL") {
      // ALL 게시판은 모든 사용자가 볼 수 있음
    } else if (!userId) {
      // userId가 없으면 접근 불가
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    } else {
      // board_id와 userId를 비교 (대소문자 무시, 공백 제거)
      const normalizedBoardId = post.board_id.replace(/\s+/g, "").toUpperCase()
      const normalizedUserId = userId.replace(/\s+/g, "").toUpperCase()
      
      if (normalizedBoardId !== normalizedUserId && normalizedBoardId !== "ALL") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
  }

  const responsePost = {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    authorRole: post.author === "admin" ? "admin" : "guest",
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    files: post.files || [],
    board_id: post.board_id,
  }

  return NextResponse.json({ post: responsePost })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiAuth()
  if (!auth.authenticated) {
    return auth.response
  }

  const { id } = await params
  const userId = auth.userId
  const role = auth.role
  const body = await request.json()

  const supabase = await createClient()

  const { data: post, error: fetchError } = await supabase.from("collaboration_posts").select("*").eq("id", id).single()

  if (fetchError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  if (role !== "admin") {
    if (post.author === "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const normalizedBoardId = post.board_id.replace(/\s+/g, "").toUpperCase()
    const normalizedUserId = userId.replace(/\s+/g, "").toUpperCase()
    if (normalizedBoardId !== normalizedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const { data: updatedPost, error: updateError } = await supabase
    .from("collaboration_posts")
    .update({
      title: body.title || post.title,
      content: body.content || post.content,
      files: body.files !== undefined ? body.files : post.files,
      board_id: body.board_id ? body.board_id.toUpperCase() : post.board_id,
    })
    .eq("id", id)
    .select()
    .single()

  if (updateError) {
    console.error("[v0] Supabase update error:", updateError)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }

  const responsePost = {
    id: updatedPost.id,
    title: updatedPost.title,
    content: updatedPost.content,
    author: updatedPost.author,
    authorRole: role as "admin" | "guest",
    createdAt: updatedPost.created_at,
    updatedAt: updatedPost.updated_at,
    files: updatedPost.files || [],
    board_id: updatedPost.board_id,
  }

  return NextResponse.json({ post: responsePost })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateApiAuth()
  if (!auth.authenticated) {
    return auth.response
  }

  const { id } = await params
  const userId = auth.userId
  const role = auth.role

  const supabase = await createClient()

  const { data: post, error: fetchError } = await supabase.from("collaboration_posts").select("*").eq("id", id).single()

  if (fetchError || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  if (role !== "admin") {
    if (post.author === "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const normalizedBoardId = post.board_id.replace(/\s+/g, "").toUpperCase()
    const normalizedUserId = userId.replace(/\s+/g, "").toUpperCase()
    if (normalizedBoardId !== normalizedUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const { error: deleteError } = await supabase.from("collaboration_posts").delete().eq("id", id)

  if (deleteError) {
    console.error("[v0] Supabase delete error:", deleteError)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
