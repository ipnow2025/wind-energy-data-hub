"use client"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Loader2 } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorRole: "admin" | "guest"
  createdAt: string
  updatedAt: string
  files?: Array<{ name: string; url: string }>
  views?: number
}

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

export default function CollaborationPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [searchType, setSearchType] = useState("title")
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedSearchType, setAppliedSearchType] = useState("title")
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 10

  useEffect(() => {
    const checkAuth = () => {
      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")

      if (!sessionId || !userId) {
        router.push("/login?redirect=/collaboration")
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!isCheckingAuth) {
      fetchPosts()
    }
  }, [isCheckingAuth])

  const fetchPosts = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")
      const userRole = localStorage.getItem("userRole")

      console.log("[v0] Collaboration: Session info - userId:", userId, "sessionId:", sessionId, "role:", userRole)

      const headers: HeadersInit = {}

      if (sessionId && userId && userRole) {
        headers["x-user-id"] = userId
        headers["x-session-id"] = sessionId
        headers["x-user-role"] = userRole
        console.log("[v0] Collaboration: Headers to send:", headers)
      } else {
        console.log("[v0] Collaboration: Missing session data in localStorage")
      }

      console.log("[v0] Collaboration: Calling API with headers:", headers)
      const res = await fetch("/api/collaboration/posts", { headers })
      console.log("[v0] Collaboration: API response status:", res.status)

      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      } else if (res.status === 401) {
        console.log("[v0] Collaboration: Unauthorized, redirecting to login")
        router.push("/login?redirect=/collaboration")
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error)
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-balance mb-6 text-foreground">
              <span className="text-primary">협업 게시판</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="text-muted-foreground text-base">
              전체 {filteredPosts.length}건 | 현재 페이지 {currentPage}/{totalPages || 1}
            </div>

            <div className="flex items-center gap-2">
              <Select value={searchType} onValueChange={setSearchType} modal={false}>
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
              <Button
                onClick={() => router.push("/collaboration/new")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />새 게시글
              </Button>
            </div>
          </div>

          <Card className="mt-0 p-0 rounded-none">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 pt-3 pb-3 text-center w-20 font-semibold text-gray-700">번호</th>
                      <th className="px-4 pt-3 pb-3 text-center font-semibold text-gray-700">제목</th>
                      <th className="px-4 pt-3 pb-3 text-center w-32 font-semibold text-gray-700">작성자</th>
                      <th className="px-4 pt-3 pb-3 text-center w-32 font-semibold text-gray-700">작성일자</th>
                      <th className="px-4 pt-3 pb-3 text-center font-semibold text-gray-700 w-32">첨부파일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <div className="h-64 bg-white"></div>
                        </td>
                      </tr>
                    ) : currentPosts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
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
                          <td className="p-4 text-left" onClick={() => router.push(`/collaboration/post/${post.id}`)}>
                            <div className="font-medium text-gray-900 hover:text-primary">{post.title}</div>
                          </td>
                          <td className="p-4 text-center text-gray-600">
                            {post.author === "admin" ? "KIER(관리자)" : post.author}
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
      </section>
    </div>
  )
}
