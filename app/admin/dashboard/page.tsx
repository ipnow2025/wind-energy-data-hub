"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Eye, FileText, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface DashboardStats {
  totalUsers: number
  todayVisitors: number
  knowledgePosts: number
  collaborationPosts: number
}

interface Activity {
  type: string
  title: string
  timestamp: string
  description: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    todayVisitors: 0,
    knowledgePosts: 0,
    collaborationPosts: 0,
  })
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const sessionId = localStorage.getItem("sessionId")

    if (!sessionId || userRole !== "admin") {
      router.push("/login")
      return
    }

    setIsAuthorized(true)
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/dashboard/stats")

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await response.json()
      setStats(data.stats)
      setActivities(data.activities)
    } catch (error) {
      console.error("[v0] Dashboard: Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">관리자 대시보드</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">전체 등록 계정 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">오늘 방문자</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.todayVisitors}</div>
              <p className="text-xs text-muted-foreground mt-1">오늘 접속한 방문자 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">지식센터 게시글</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.knowledgePosts}</div>
              <p className="text-xs text-muted-foreground mt-1">지식센터 게시글 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-sm font-medium">협업 게시판 게시글</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.collaborationPosts}</div>
              <p className="text-xs text-muted-foreground mt-1">협업 게시판 게시글 수</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>최근 활동</CardTitle>
              <CardDescription>플랫폼의 최근 활동 내역</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">로딩 중...</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">활동 내역이 없습니다</div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle>빠른 작업</CardTitle>
              <CardDescription>자주 사용하는 관리 기능</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/admin/knowledge/new")}
                  className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <p className="font-medium">지식센터 게시글 작성</p>
                  <p className="text-sm text-muted-foreground mt-1">지식센터에 새로운 게시글 추가</p>
                </button>
                <button
                  onClick={() => router.push("/admin/collaboration/new")}
                  className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <p className="font-medium">협업 게시판 게시글 작성</p>
                  <p className="text-sm text-muted-foreground mt-1">협업 게시판에 새로운 게시글 추가</p>
                </button>
                <button
                  onClick={() => router.push("/admin/users")}
                  className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <p className="font-medium">계정 관리</p>
                  <p className="text-sm text-muted-foreground mt-1">사용자 계정 및 권한 관리</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
