import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("[v0] Dashboard stats: Error fetching users count:", usersError)
    }

    let todayVisitors = 0
    try {
      const now = new Date()
      const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0))

      const { data: visitsData, error: visitsError } = await serviceSupabase
        .from("page_visits")
        .select("*")
        .gte("visited_at", startDate.toISOString())
        .not("page_path", "like", "/admin%")

      if (visitsError) {
        console.error("[v0] Dashboard stats: Error fetching visits:", visitsError)
      } else if (visitsData) {
        // Group by date and count unique visitors
        const grouped = new Map<string, Set<string>>()

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0))
          const dateStr = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", timeZone: "UTC" })
          grouped.set(dateStr, new Set())
        }

        // Group visits by date
        visitsData.forEach((visit) => {
          const date = new Date(visit.visited_at).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            timeZone: "UTC",
          })
          if (grouped.has(date)) {
            grouped.get(date)!.add(visit.session_id)
          }
        })

        // Get today's visitors (last entry)
        const todayDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0))
        const todayStr = todayDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", timeZone: "UTC" })
        todayVisitors = grouped.get(todayStr)?.size || 0
      }
    } catch (visitsError) {
      console.error("[v0] Dashboard stats: Error calculating today's visitors:", visitsError)
    }

    // Get knowledge center posts count
    const { count: knowledgePosts, error: knowledgeError } = await supabase
      .from("knowledge_posts")
      .select("*", { count: "exact", head: true })

    if (knowledgeError) {
      console.error("[v0] Dashboard stats: Error fetching knowledge posts count:", knowledgeError)
    }

    // Get collaboration board posts count
    const { count: collaborationPosts, error: collaborationError } = await supabase
      .from("collaboration_posts")
      .select("*", { count: "exact", head: true })

    if (collaborationError) {
      console.error("[v0] Dashboard stats: Error fetching collaboration posts count:", collaborationError)
    }

    // Get recent activities (last 10)
    const { data: recentPosts, error: recentPostsError } = await supabase
      .from("collaboration_posts")
      .select("id, title, board_id, created_at, updated_at, author")
      .order("updated_at", { ascending: false })
      .limit(5)

    if (recentPostsError) {
      console.error("[v0] Dashboard stats: Error fetching recent posts:", recentPostsError)
    }

    const { data: recentUsers, error: recentUsersError } = await supabase
      .from("users")
      .select("id, username, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentUsersError) {
      console.error("[v0] Dashboard stats: Error fetching recent users:", recentUsersError)
    }

    // Combine and sort activities
    const activities = []

    if (recentPosts) {
      recentPosts.forEach((post) => {
        const isKnowledge = post.board_id === "KNOWLEDGE"
        const boardName = isKnowledge ? "지식센터" : "협업 게시판"

        activities.push({
          type: "post_update",
          title: `${boardName} 게시글 수정: ${post.title}`,
          timestamp: post.updated_at,
          description: `${post.author}님이 게시글을 수정했습니다`,
        })
      })
    }

    if (recentUsers) {
      recentUsers.forEach((user) => {
        activities.push({
          type: "user_created",
          title: `새 계정 등록: ${user.username}`,
          timestamp: user.created_at,
          description: "새로운 사용자가 등록되었습니다",
        })
      })
    }

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        todayVisitors: todayVisitors,
        knowledgePosts: knowledgePosts || 0,
        collaborationPosts: collaborationPosts || 0,
      },
      activities: activities.slice(0, 5),
    })
  } catch (error) {
    console.error("[v0] Dashboard stats: Error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
