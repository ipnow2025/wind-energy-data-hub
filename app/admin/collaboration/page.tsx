"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorRole: "admin" | "guest"
  createdAt: string
  updatedAt: string
  files?: Array<{ name: string; url: string }>
  guestId?: string
  board_id?: string
}

import { ALL_BOARDS } from "@/lib/constants"

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "-"
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "/")
    .replace(/\.$/, "")
}

export default function AdminCollaborationPage() {
  const router = useRouter()
  const [boards] = useState<string[]>(ALL_BOARDS)
  const [selectedBoard, setSelectedBoard] = useState<string>("all")
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchType, setSearchType] = useState("title")
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedSearchType, setAppliedSearchType] = useState("title")
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 10

  useEffect(() => {
    if (selectedBoard) {
      fetchPosts()
    }
  }, [selectedBoard])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")
      const sessionId = localStorage.getItem("sessionId")
      const userRole = localStorage.getItem("userRole")

      const headers: HeadersInit = {}
      if (userId && sessionId && userRole) {
        headers["x-user-id"] = userId
        headers["x-session-id"] = sessionId
        headers["x-user-role"] = userRole
      }

      const url =
        selectedBoard === "all" ? "/api/admin/collaboration/posts" : `/api/collaboration/posts?guestId=${selectedBoard}`

      console.log("[v0] Fetching posts from:", url)
      console.log("[v0] Selected board:", selectedBoard)
      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        console.log("[v0] Fetched posts:", data.posts?.length || 0)
        if (data.posts && data.posts.length > 0) {
          console.log(
            "[v0] Sample post board_ids:",
            data.posts.slice(0, 3).map((p: Post) => p.board_id || p.guestId),
          )
        }
        setPosts(data.posts || [])
      } else {
        console.error("[v0] Failed to fetch posts:", res.status)
        setPosts([])
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (!appliedSearchQuery) return true
    const query = appliedSearchQuery.toLowerCase()
    if (appliedSearchType === "title") {
      return post.title.toLowerCase().includes(query)
    } else if (appliedSearchType === "content") {
      return post.content.toLowerCase().includes(query)
    } else if (appliedSearchType === "titleContent") {
      return post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
    } else if (appliedSearchType === "author") {
      return post.author.toLowerCase().includes(query)
    }
    return true
  })

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const indexOfLastPost = currentPage * postsPerPage
  const indexOfFirstPost = indexOfLastPost - postsPerPage
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost)

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery)
    setAppliedSearchType(searchType)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const handleNewPost = () => {
    router.push(`/admin/collaboration/new?board=${selectedBoard}`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">협업 게시판 관리</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground text-base">
              전체 {filteredPosts.length}건 | 현재 페이지 {currentPage}/{totalPages || 1}
            </div>
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 게시판</SelectItem>
                {boards.map((board) => (
                  <SelectItem key={board} value={board}>
                    {board.toUpperCase()} 게시판
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-32 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">제목</SelectItem>
                <SelectItem value="content">내용</SelectItem>
                <SelectItem value="titleContent">제목+내용</SelectItem>
                <SelectItem value="author">작성자</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-64 bg-white"
            />
            <Button onClick={handleSearch} className="bg-gray-200 hover:bg-gray-300 text-gray-700">
              검색
            </Button>
            <Button onClick={handleNewPost} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 h-4 w-4" />새 게시글
            </Button>
          </div>
        </div>

        <Card className="rounded-none mt-0 p-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 pt-3 pb-3 text-center w-20 font-semibold text-gray-700">번호</th>
                    <th className="px-4 pt-3 pb-3 text-center font-semibold text-gray-700">제목</th>
                    <th className="px-4 pt-3 pb-3 text-center w-32 font-semibold text-gray-700">작성자</th>
                    <th className="px-4 pt-3 pb-3 text-center w-32 font-semibold text-gray-700">게시판</th>
                    <th className="px-4 pt-3 pb-3 text-center w-32 font-semibold text-gray-700">작성일자</th>
                    <th className="px-4 pt-3 pb-3 text-center font-semibold text-gray-700 w-32">첨부파일</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-12">
                        <div className="h-64"></div>
                      </td>
                    </tr>
                  ) : currentPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-4" />
                        <p>게시글이 없습니다</p>
                      </td>
                    </tr>
                  ) : (
                    currentPosts.map((post, index) => (
                      <tr key={post.id} className="border-b hover:bg-gray-50 cursor-pointer">
                        <td className="p-4 text-center text-gray-600">
                          {filteredPosts.length - (indexOfFirstPost + index)}
                        </td>
                        <td
                          className="p-4 text-left"
                          onClick={() => router.push(`/admin/collaboration/post/${post.id}`)}
                        >
                          <div className="font-medium text-gray-900 hover:text-primary">{post.title}</div>
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          {post.author === "admin" ? "KIER(관리자)" : post.author}
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          {(post.guestId || post.board_id) === "ALL"
                            ? "전체 게시판"
                            : post.guestId || post.board_id || "-"}
                        </td>
                        <td className="p-4 text-center text-gray-600">{formatDate(post.createdAt)}</td>
                        <td className="p-4 text-center">
                          {post.files && post.files.length > 0 && (
                            <div className="flex justify-center gap-2">
                              {post.files.map((file, fileIndex) => (
                                <a
                                  key={fileIndex}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-primary hover:text-primary/80"
                                  onClick={(e) => e.stopPropagation()}
                                  title={file.name}
                                >
                                  <FileText className="h-5 w-5" />
                                </a>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-3"
            >
              &laquo;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3"
            >
              &lt;
            </Button>

            {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className={currentPage === pageNum ? "bg-primary hover:bg-primary/90 text-white px-3" : "px-3"}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3"
            >
              &gt;
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3"
            >
              &raquo;
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
