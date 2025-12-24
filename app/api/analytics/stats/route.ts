import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "daily"
    const year = searchParams.get("year") ? Number.parseInt(searchParams.get("year")!) : new Date().getFullYear()

    let stats: any[] = []

    try {
      if (period === "daily") {
        const now = new Date()
        const startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0))

        const { data, error } = await supabase
          .from("page_visits")
          .select("*")
          .gte("visited_at", startDate.toISOString())
          .not("page_path", "like", "/admin%")

        if (error) {
          console.error("[v0] Daily stats query error:", error)
          return NextResponse.json({ stats: [] })
        }

        const grouped = new Map<string, { visitors: Set<string>; pageViews: number }>()

        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0, 0))
          const dateStr = date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", timeZone: "UTC" })
          grouped.set(dateStr, { visitors: new Set(), pageViews: 0 })
        }

        data?.forEach((visit) => {
          const date = new Date(visit.visited_at).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            timeZone: "UTC",
          })
          if (grouped.has(date)) {
            const group = grouped.get(date)!
            group.visitors.add(visit.session_id)
            group.pageViews++
          }
        })

        stats = Array.from(grouped.entries()).map(([date, data]) => ({
          date,
          visitors: data.visitors.size,
          page_views: data.pageViews,
        }))
      } else if (period === "weekly") {
        const { data, error } = await supabase
          .from("page_visits")
          .select("*")
          .gte("visited_at", new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString())
          .not("page_path", "like", "/admin%")

        if (error) {
          console.error("[v0] Weekly stats query error:", error)
          return NextResponse.json({ stats: [] })
        }

        const grouped = new Map<number, { visitors: Set<string>; pageViews: number }>()

        for (let i = 0; i < 5; i++) {
          grouped.set(i, { visitors: new Set(), pageViews: 0 })
        }

        data?.forEach((visit) => {
          const week = Math.floor((Date.now() - new Date(visit.visited_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
          if (week < 5) {
            const group = grouped.get(week)!
            group.visitors.add(visit.session_id)
            group.pageViews++
          }
        })

        stats = Array.from(grouped.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([week, data], index) => ({
            week: `${5 - index}주차`,
            visitors: data.visitors.size,
            page_views: data.pageViews,
          }))
      } else if (period === "monthly") {
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31, 23, 59, 59)

        const { data, error } = await supabase
          .from("page_visits")
          .select("*")
          .gte("visited_at", startDate.toISOString())
          .lte("visited_at", endDate.toISOString())
          .not("page_path", "like", "/admin%")

        if (error) {
          console.error("[v0] Monthly stats query error:", error)
          return NextResponse.json({ stats: [] })
        }

        const grouped = new Map<number, { visitors: Set<string>; pageViews: number }>()

        for (let i = 1; i <= 12; i++) {
          grouped.set(i, { visitors: new Set(), pageViews: 0 })
        }

        data?.forEach((visit) => {
          const month = new Date(visit.visited_at).getMonth() + 1
          const group = grouped.get(month)!
          group.visitors.add(visit.session_id)
          group.pageViews++
        })

        stats = Array.from(grouped.entries()).map(([month, data]) => ({
          month: `${month}월`,
          visitors: data.visitors.size,
          page_views: data.pageViews,
        }))
      } else if (period === "yearly") {
        const { data, error } = await supabase
          .from("page_visits")
          .select("*")
          .gte("visited_at", new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString())
          .not("page_path", "like", "/admin%")

        if (error) {
          console.error("[v0] Yearly stats query error:", error)
          return NextResponse.json({ stats: [] })
        }

        const grouped = new Map<string, { visitors: Set<string>; pageViews: number }>()

        const currentYear = new Date().getFullYear()
        for (let i = 0; i < 5; i++) {
          const year = (currentYear - i).toString()
          grouped.set(year, { visitors: new Set(), pageViews: 0 })
        }

        data?.forEach((visit) => {
          const year = new Date(visit.visited_at).getFullYear().toString()
          if (grouped.has(year)) {
            const group = grouped.get(year)!
            group.visitors.add(visit.session_id)
            group.pageViews++
          }
        })

        stats = Array.from(grouped.entries())
          .sort((a, b) => Number.parseInt(a[0]) - Number.parseInt(b[0]))
          .map(([year, data]) => ({
            year,
            visitors: data.visitors.size,
            page_views: data.pageViews,
          }))
      }
    } catch (queryError: any) {
      console.error(`[v0] ${period} stats query error:`, queryError)

      // 빈 데이터 구조 반환
      if (period === "daily") {
        stats = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
          return {
            date: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
            visitors: 0,
            page_views: 0,
          }
        })
      } else if (period === "weekly") {
        stats = Array.from({ length: 5 }, (_, i) => ({
          week: `${5 - i}주차`,
          visitors: 0,
          page_views: 0,
        }))
      } else if (period === "monthly") {
        stats = Array.from({ length: 12 }, (_, i) => ({
          month: `${i + 1}월`,
          visitors: 0,
          page_views: 0,
        }))
      } else if (period === "yearly") {
        const currentYear = new Date().getFullYear()
        stats = Array.from({ length: 5 }, (_, i) => ({
          year: (currentYear - 4 + i).toString(),
          visitors: 0,
          page_views: 0,
        }))
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[v0] Analytics stats error:", error)
    return NextResponse.json({ stats: [] })
  }
}
