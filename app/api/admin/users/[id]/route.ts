import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// PUT - Update user
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { username, email, password } = body

    // Validate input
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if username is taken by another user
    const { data: existingUsername } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .neq("id", id)
      .maybeSingle()

    if (existingUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    const { data: updatedUser, error } = await supabase.rpc("update_user_password", {
      p_id: id,
      p_password: password || null,
      p_username: username,
    })

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    const { error: emailError } = await supabase
      .from("users")
      .update({ email: email || null })
      .eq("id", id)

    if (emailError) {
      console.error("Error updating email:", emailError)
    }

    // Return first row if array
    const user = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error in PUT /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Prevent deleting admin account
    if (id === "admin") {
      return NextResponse.json({ error: "Cannot delete admin account" }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Delete user sessions first
    await supabase.from("user_sessions").delete().eq("user_id", id)

    // Delete user
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      console.error("Error deleting user:", error)
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
