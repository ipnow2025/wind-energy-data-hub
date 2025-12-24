"use client"

import type React from "react"
import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"

function NewPostContent() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; size: number; sha256?: string }>>([])
  const [isUploading, setIsUploading] = useState(false)

  const currentDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const userId = localStorage.getItem("userId")
      const sessionId = localStorage.getItem("sessionId")
      const userRole = localStorage.getItem("userRole")

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (userId && sessionId && userRole) {
        headers["x-user-id"] = userId
        headers["x-session-id"] = sessionId
        headers["x-user-role"] = userRole
      }

      const fileData = uploadedFiles.map((file) => ({
        name: file.name,
        url: file.url,
        size: file.size,
        sha256: file.sha256,
      }))

      const res = await fetch("/api/knowledge/posts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          files: fileData,
          author: "admin",
        }),
      })

      if (res.ok) {
        router.push("/admin/knowledge")
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        alert(`게시글 작성에 실패했습니다: ${errorData.error || "알 수 없는 오류"}`)
      }
    } catch (error) {
      console.error("Failed to create post:", error)
      alert("게시글 작성 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const MAX_FILE_SIZE = 4.5 * 1024 * 1024 // 4.5MB

      setIsUploading(true)

      for (const file of files) {
        try {
          if (file.size > MAX_FILE_SIZE) {
            alert(`파일 크기가 너무 큽니다: ${file.name}\n최대 4.5MB까지 업로드 가능합니다.`)
            continue
          }

          const userId = localStorage.getItem("userId")
          const sessionId = localStorage.getItem("sessionId")
          const userRole = localStorage.getItem("userRole")

          const headers: HeadersInit = {}

          if (userId && sessionId && userRole) {
            headers["x-user-id"] = userId
            headers["x-session-id"] = sessionId
            headers["x-user-role"] = userRole
          }

          const formData = new FormData()
          formData.append("file", file)

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
          } else {
            const errorData = await res.json().catch(() => ({ error: "알 수 없는 오류" }))
            alert(`파일 업로드 실패: ${file.name}\n${errorData.error || "알 수 없는 오류"}`)
          }
        } catch (error) {
          alert(`파일 업로드 중 오류 발생: ${file.name}\n${error instanceof Error ? error.message : "알 수 없는 오류"}`)
        }
      }

      setIsUploading(false)
      e.target.value = ""
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <AdminLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6 p-6 border border-border rounded-lg bg-white">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-lg font-medium">새 게시글</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="border-gray-300"
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="disabled:opacity-100">
                    {isSubmitting ? "작성 중..." : "등록"}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">작성일</Label>
                      <Input value={currentDate} disabled className="mt-1 bg-gray-50" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">작성자</Label>
                      <Input value="KIER(관리자)" disabled className="mt-1 bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="content" className="text-sm font-medium">
                  내용 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="내용을 입력하세요"
                  required
                  rows={5}
                  className="min-h-[300px] resize-y"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">첨부파일</Label>
                  <span className="text-xs text-gray-500">(최대 4.5MB)</span>
                </div>
                <div>
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-sm text-gray-600">{isUploading ? "업로드 중..." : "파일 선택"}</span>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
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
    </AdminLayout>
  )
}

export default function AdminNewPostPage() {
  return (
    <Suspense
      fallback={
        <AdminLayout>
          <section className="py-20 px-4">
            <div className="container mx-auto">
              <div className="max-w-5xl mx-auto">
                <div className="space-y-6 p-6 border border-border rounded-lg bg-white">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h2 className="text-lg font-medium">새 게시글</h2>
                  </div>
                  <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded" />
                    <div className="h-64 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AdminLayout>
      }
    >
      <NewPostContent />
    </Suspense>
  )
}
