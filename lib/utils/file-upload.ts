/**
 * Shared file upload utilities
 */

export interface UploadedFile {
  name: string
  url: string
  size: number
  sha256?: string
}

import { getAuthFromStorage } from "./auth"

export interface FileUploadOptions {
  userId?: string | null
  sessionId?: string | null
  userRole?: string | null
}

/**
 * Get authentication headers for API requests (without Content-Type for file uploads)
 */
function getFileUploadHeaders(options: FileUploadOptions = {}): HeadersInit {
  const headers: HeadersInit = {}

  if (options.userId && options.sessionId && options.userRole) {
    headers["x-user-id"] = options.userId
    headers["x-session-id"] = options.sessionId
    headers["x-user-role"] = options.userRole
  }

  return headers
}

/**
 * Upload a single file
 */
export async function uploadFile(
  file: File,
  maxSize: number,
  options: FileUploadOptions = {}
): Promise<UploadedFile> {
  if (file.size > maxSize) {
    throw new Error(`파일 크기가 너무 큽니다: ${file.name}\n최대 ${maxSize / 1024 / 1024}MB까지 업로드 가능합니다.`)
  }

  const formData = new FormData()
  formData.append("file", file)

  const headers = getFileUploadHeaders(options)

  const res = await fetch("/api/collaboration/upload", {
    method: "POST",
    headers,
    body: formData,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "알 수 없는 오류" }))
    throw new Error(`파일 업로드 실패: ${file.name}\n${errorData.error || "알 수 없는 오류"}`)
  }

  const data = await res.json()
  return {
    name: data.filename,
    url: data.url,
    size: data.size,
    sha256: data.sha256,
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  maxSize: number,
  options: FileUploadOptions = {}
): Promise<UploadedFile[]> {
  const results: UploadedFile[] = []

  for (const file of files) {
    try {
      const uploaded = await uploadFile(file, maxSize, options)
      results.push(uploaded)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      throw error
    }
  }

  return results
}

