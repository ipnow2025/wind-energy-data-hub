import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, email, role, created_at, updated_at")

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    const sortedUsers = (users || []).sort((a, b) => {
      // Admin users first
      if (a.role === "admin" && b.role !== "admin") return -1
      if (a.role !== "admin" && b.role === "admin") return 1

      // For same role, sort by updated_at or created_at (most recent first)
      const aDate = new Date(a.updated_at || a.created_at).getTime()
      const bDate = new Date(b.updated_at || b.created_at).getTime()
      return bDate - aDate
    })

    return NextResponse.json({ users: sortedUsers })
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, username, email, password, role } = body

    // Validate input
    if (!id || !username || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const userRole = role === "admin" ? "guest" : "guest"

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database configuration missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("id", id).maybeSingle()

    if (existingUser) {
      return NextResponse.json({ error: "User ID already exists" }, { status: 409 })
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase.from("users").select("id").eq("username", username).maybeSingle()

    if (existingUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    const { data: newUser, error } = await supabase.rpc("create_user_with_password", {
      p_id: id,
      p_username: username,
      p_password: password,
      p_role: userRole,
    })

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Return first row if array
    const user = Array.isArray(newUser) ? newUser[0] : newUser

    if (email) {
      await supabase.from("users").update({ email }).eq("id", id)
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
