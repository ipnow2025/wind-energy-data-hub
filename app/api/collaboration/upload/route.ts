import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { validateApiAuth } from "@/lib/api-auth"
import { createHash } from "crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")

    const auth = await validateApiAuth()
    if (!auth.authenticated) {
      console.log("[v0] Authentication failed")
      return auth.response
    }

    console.log("[v0] Authentication successful")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] Uploading file:", file.name, "size:", file.size, "type:", file.type)

    const MAX_FILE_SIZE = 4.5 * 1024 * 1024 // 4.5MB
    if (file.size > MAX_FILE_SIZE) {
      console.log("[v0] File too large:", file.size)
      return NextResponse.json({ error: `파일 크기가 너무 큽니다. 최대 4.5MB까지 업로드 가능합니다.` }, { status: 400 })
    }

    try {
      // Calculate SHA256 hash of the file
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const sha256 = createHash("sha256").update(buffer).digest("hex")

      console.log("[v0] File SHA256 hash calculated:", sha256)

      // Check for Vercel Blob token
      const token = process.env.BLOB_READ_WRITE_TOKEN
      if (!token) {
        console.error("[v0] BLOB_READ_WRITE_TOKEN environment variable is not set")
        return NextResponse.json(
          {
            error:
              "파일 업로드 서비스가 구성되지 않았습니다. BLOB_READ_WRITE_TOKEN 환경 변수가 필요합니다.",
          },
          { status: 500 },
        )
      }

      const blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
        token: token,
      })

      console.log("[v0] File uploaded successfully:", blob.url)

      return NextResponse.json({
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
        sha256: sha256,
      })
    } catch (blobError: any) {
      // Handle Vercel Blob specific errors
      const errorStr = String(blobError?.message || blobError || "Unknown error")
      console.error("[v0] Blob upload error:", errorStr)

      // Check for common error patterns
      if (
        errorStr.includes("Request Entity Too Large") ||
        errorStr.includes("413") ||
        errorStr.includes("Request En") ||
        errorStr.includes("too large")
      ) {
        return NextResponse.json(
          {
            error:
              "파일이 너무 큽니다. Vercel의 제한으로 인해 약 4.5MB 이상의 파일은 서버를 통해 업로드할 수 없습니다. 대용량 파일은 YouTube, Vimeo, Dropbox 등의 외부 링크를 사용해주세요.",
          },
          { status: 413 },
        )
      }

      return NextResponse.json({ error: "파일 업로드에 실패했습니다. 다시 시도해주세요." }, { status: 500 })
    }
  } catch (error: any) {
    const errorStr = String(error?.message || error || "Unknown error")
    console.error("[v0] Upload error:", errorStr)
    return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 })
  }
}
