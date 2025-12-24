"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText } from "lucide-react"

export default function EditCollaborationPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    files: [] as File[],
  })
  const [existingFiles, setExistingFiles] = useState<Array<{ name: string; url: string; size: number; sha256?: string }>>([])
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; size: number; sha256?: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [boardId, setBoardId] = useState<string>("")
  const [createdAt, setCreatedAt] = useState<string>("")
  const [author, setAuthor] = useState<string>("")

  useEffect(() => {
    fetchPost()
  }, [])

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

      const res = await fetch(`/api/collaboration/posts/${postId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const post = data.post
        if (post) {
          const boardRes = await fetch(`/api/collaboration/posts/${postId}`, { headers })
          const boardData = await boardRes.json()
          const currentBoardId = boardData.post?.board_id || ""

          setFormData({ title: post.title, content: post.content, files: [] })
          setExistingFiles(post.files || [])
          setBoardId(currentBoardId)
          setCreatedAt(post.createdAt)
          setAuthor(post.author || "")
        } else {
          alert("게시글을 찾을 수 없습니다.")
          router.push("/collaboration")
        }
      } else if (res.status === 403) {
        alert("이 게시글을 수정할 권한이 없습니다.")
        router.push("/collaboration")
      } else {
        alert("게시글을 찾을 수 없습니다.")
        router.push("/collaboration")
      }
    } catch (error) {
      console.error("Failed to fetch post:", error)
      alert("게시글을 불러오는 중 오류가 발생했습니다.")
      router.push("/collaboration")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const allFiles = [...existingFiles, ...uploadedFiles]

      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")
      const userRole = localStorage.getItem("userRole")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }
      if (sessionId && userId && userRole) {
        headers["x-user-id"] = userId
        headers["x-session-id"] = sessionId
        headers["x-user-role"] = userRole
      }

      const res = await fetch(`/api/collaboration/posts/${postId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          files: allFiles,
        }),
      })

      if (res.ok) {
        router.push(`/collaboration/post/${postId}`)
      } else if (res.status === 403) {
        alert("이 게시글을 수정할 권한이 없습니다.")
      } else {
        alert("게시글 수정에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to update post:", error)
      alert("게시글 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)

      for (const file of files) {
        try {
          const formData = new FormData()
          formData.append("file", file)

          const sessionId = localStorage.getItem("sessionId")
          const userId = localStorage.getItem("userId")
          const userRole = localStorage.getItem("userRole")

          const headers: HeadersInit = {}
          if (sessionId && userId && userRole) {
            headers["x-user-id"] = userId
            headers["x-session-id"] = sessionId
            headers["x-user-role"] = userRole
          }

          const res = await fetch("/api/collaboration/upload", {
            method: "POST",
            headers,
            body: formData,
          })

          if (res.ok) {
            const data = await res.json()
            setUploadedFiles((prev) => [
              ...prev,
              {
                name: data.filename,
                url: data.url,
                size: data.size,
                sha256: data.sha256,
              },
            ])
            setFormData((prev) => ({ ...prev, files: [...prev.files, file] }))
          } else {
            alert(`파일 업로드 실패: ${file.name}`)
          }
        } catch (error) {
          console.error("File upload error:", error)
          alert(`파일 업로드 중 오류 발생: ${file.name}`)
        }
      }
    }
  }

  const removeExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeUploadedFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index)
    const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index)
    setFormData({ ...formData, files: newFiles })
    setUploadedFiles(newUploadedFiles)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl py-20 px-4">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6 p-6 border border-border rounded-lg bg-white">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-lg font-medium">게시글 수정</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => router.push(`/collaboration/post/${postId}`)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-white disabled:opacity-100"
                  >
                    {isSubmitting ? "수정 중..." : "수정"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">
                      제목 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="제목을 입력하세요"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">작성일</Label>
                      <Input
                        value={
                          createdAt
                            ? new Date(createdAt)
                                .toLocaleDateString("ko-KR", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })
                                .replace(/\. /g, "-")
                                .replace(".", "")
                            : "알 수 없음"
                        }
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">작성자</Label>
                      <Input value={author} disabled className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">게시판</Label>
                      <Input value={boardId} disabled className="mt-1 bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="내용을 입력하세요"
                  rows={5}
                  required
                  className="min-h-[300px] resize-y"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">첨부파일</Label>
                </div>

                {existingFiles.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {existingFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex items-center gap-2 flex-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm truncate hover:text-primary"
                          >
                            {file.name}
                          </a>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeExistingFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors bg-white"
                  >
                    <span className="text-sm text-gray-600">파일 추가</span>
                    <input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeUploadedFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
