"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  board_id: string
  files?: Array<{ name: string; url: string }>
  view_count?: number // Add view_count to interface
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

export default function KnowledgePage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchType, setSearchType] = useState("title")
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedSearchType, setAppliedSearchType] = useState("title")
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const postsPerPage = 10

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/knowledge/posts")
      if (res.ok) {
        const data = await res.json()
        setPosts(Array.isArray(data) ? data : [])
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
  const displayPosts = viewMode === "card" ? filteredPosts.slice(0, 6) : currentPosts

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery)
    setAppliedSearchType(searchType)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-balance mb-6 text-foreground">
              <span className="text-primary">지식센터</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="space-y-6">
            {viewMode === "table" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-base">
                    전체 {filteredPosts.length}건 | 현재 페이지 {currentPage}/{totalPages || 1}
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
                  </div>
                </div>
              </>
            )}

            {viewMode === "card" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full h-96"></div>
                ) : displayPosts.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">게시글이 없습니다</p>
                  </div>
                ) : (
                  displayPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded">기술 보고서</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {formatDate(post.created_at)}
                          </span>
                        </div>

                        <h3 className="font-bold text-lg line-clamp-2 min-h-[3.5rem]">{post.title}</h3>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          {post.files && post.files.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{post.files.length}개 파일 첨부</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span>{post.author === "admin" ? "KIER(관리자)" : post.author}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.view_count || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => router.push(`/knowledge/${post.id}`)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            읽기
                          </Button>
                          {post.files && post.files.length > 0 && (
                            <Button
                              className="bg-primary hover:bg-primary/90"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(post.files![0].url, "_blank")
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {viewMode === "table" && (
              <Card className="rounded-none mt-0 p-0">
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
                            <td colSpan={5} className="p-12">
                              <div className="h-64"></div>
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
                              <td className="p-4 text-left" onClick={() => router.push(`/knowledge/${post.id}`)}>
                                <div className="font-medium text-gray-900 hover:text-primary">{post.title}</div>
                              </td>
                              <td className="p-4 text-center text-gray-600">
                                {post.author === "admin" ? "KIER(관리자)" : post.author}
                              </td>
                              <td className="p-4 text-center text-gray-600">{formatDate(post.created_at)}</td>
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
            )}

            {viewMode === "card" && !isLoading && filteredPosts.length > 6 && (
              <div className="flex justify-center pt-8">
                <Button variant="outline" size="lg" onClick={() => setViewMode("table")} className="px-8">
                  더 많은 보고서 보기
                </Button>
              </div>
            )}

            {viewMode === "table" && !isLoading && totalPages > 1 && (
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
        </div>
      </section>
    </div>
  )
}
