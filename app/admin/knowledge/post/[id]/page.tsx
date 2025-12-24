"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { FileText, Edit, Trash2, List, Download, Copy, CheckCircle2 } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
  files?: Array<{ name: string; url: string; sha256?: string }>
}

export default function AdminPostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")
      const userRole = localStorage.getItem("userRole")

      const headers: HeadersInit = {}
      if (sessionId && userId && userRole) {
        headers["x-user-id"] = userId
        headers["x-session-id"] = sessionId
        headers["x-user-role"] = userRole
      }

      const res = await fetch(`/api/knowledge/posts/${postId}`, { headers })

      if (res.ok) {
        const data = await res.json()
        setPost(data.post || data)
      } else if (res.status === 401) {
        router.push("/login")
      } else {
        alert("게시글을 찾을 수 없습니다.")
        router.push("/admin/knowledge")
      }
    } catch (error) {
      console.error("Failed to fetch post:", error)
      alert("게시글을 불러오는 중 오류가 발생했습니다.")
      router.push("/admin/knowledge")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return
    }

    setIsDeleting(true)
    try {
      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")
      const userRole = localStorage.getItem("userRole")

      const headers: HeadersInit = {}
      if (sessionId && userId && userRole) {
        headers["x-user-id"] = userId
        headers["x-session-id"] = sessionId
        headers["x-user-role"] = userRole
      }

      const res = await fetch(`/api/knowledge/posts/${postId}`, {
        method: "DELETE",
        headers,
      })

      if (res.ok) {
        router.push("/admin/knowledge")
      } else {
        alert("게시글 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to delete post:", error)
      alert("게시글 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto max-w-4xl py-20 px-4">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!post) {
    return null
  }

  return (
    <AdminLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-6 p-6 border border-border rounded-lg bg-white">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-lg font-medium">게시글</h2>
                <div className="flex gap-2">
                  <Button onClick={() => router.push("/admin/knowledge")} disabled={isDeleting} variant="outline">
                    <List className="mr-2 h-4 w-4" />
                    목록
                  </Button>
                  <Button
                    onClick={() => router.push(`/admin/knowledge/post/${postId}/edit`)}
                    disabled={isDeleting}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-600/90 text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <div className="text-sm text-gray-500 mb-1">제목</div>
                  <div className="text-base">{post.title}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">작성일</div>
                    <div className="text-base">
                      {new Date(post.created_at)
                        .toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                        .replace(/\. /g, "-")
                        .replace(".", "")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">작성자</div>
                    <div className="text-base">{post.author === "admin" ? "KIER(관리자)" : post.author}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">내용</div>
                <div className="min-h-[300px] p-4 rounded border whitespace-pre-wrap">{post.content}</div>
              </div>

              {post.files && post.files.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">첨부파일</div>
                  <div className="space-y-3">
                    {post.files.map((file, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded border space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-primary flex-1"
                          >
                            {file.name}
                          </a>
                          <a
                            href={`/api/files/sha256?url=${encodeURIComponent(file.url)}`}
                            download={`${file.name}.sha256`}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            title="SHA256 체크섬 파일 다운로드"
                          >
                            <Download className="h-3 w-3" />
                            .sha256
                          </a>
                        </div>
                        {file.sha256 && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">SHA256 해시값:</div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all flex-1">
                                {file.sha256}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(file.sha256!)
                                  alert("해시값이 클립보드에 복사되었습니다.")
                                }}
                                title="해시값 복사"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold mb-1">파일 무결성 검증 안내</div>
                        <div className="space-y-1 text-blue-700">
                          <div>• 다운로드한 파일의 무결성을 확인하려면 SHA256 해시값을 사용하세요.</div>
                          <div>• Windows: <code className="bg-blue-100 px-1 rounded">certutil -hashfile 파일명 SHA256</code></div>
                          <div>• macOS/Linux: <code className="bg-blue-100 px-1 rounded">shasum -a 256 파일명</code></div>
                          <div>• 계산된 해시값이 위에 표시된 값과 일치하면 파일이 원본과 동일합니다.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
