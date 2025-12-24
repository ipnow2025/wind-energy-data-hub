import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createHash } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileUrl = searchParams.get("url")

    if (!fileUrl) {
      return NextResponse.json({ error: "파일 URL이 필요합니다." }, { status: 400 })
    }

    // 먼저 데이터베이스에서 해시값과 파일명을 찾아봅니다
    const supabase = await createClient()
    let sha256: string | null = null
    let filename: string | null = null

    // knowledge_posts에서 검색
    const { data: knowledgePosts } = await supabase.from("knowledge_posts").select("files")
    if (knowledgePosts) {
      for (const post of knowledgePosts) {
        const files = (post.files as Array<{ url: string; name?: string; sha256?: string }>) || []
        const file = files.find((f) => f.url === fileUrl)
        if (file) {
          if (file.sha256) {
            sha256 = file.sha256
          }
          if (file.name) {
            filename = file.name
          }
          if (sha256 && filename) break
        }
      }
    }

    // collaboration_posts에서 검색 (해시값을 찾지 못한 경우)
    if (!sha256 || !filename) {
      const { data: collaborationPosts } = await supabase.from("collaboration_posts").select("files")
      if (collaborationPosts) {
        for (const post of collaborationPosts) {
          const files = (post.files as Array<{ url: string; name?: string; sha256?: string }>) || []
          const file = files.find((f) => f.url === fileUrl)
          if (file) {
            if (file.sha256 && !sha256) {
              sha256 = file.sha256
            }
            if (file.name && !filename) {
              filename = file.name
            }
            if (sha256 && filename) break
          }
        }
      }
    }

    // 데이터베이스에서 파일명을 찾지 못한 경우 URL에서 추출 (URL 디코딩)
    if (!filename) {
      const urlParts = fileUrl.split("/")
      const encodedFilename = urlParts[urlParts.length - 1].split("?")[0] // 쿼리 파라미터 제거
      try {
        filename = decodeURIComponent(encodedFilename)
      } catch {
        filename = encodedFilename // 디코딩 실패 시 원본 사용
      }
    }

    // 데이터베이스에서 해시값을 찾지 못한 경우 파일을 다운로드하여 계산
    if (!sha256) {
      const fileResponse = await fetch(fileUrl)
      if (!fileResponse.ok) {
        return NextResponse.json({ error: "파일을 다운로드할 수 없습니다." }, { status: 404 })
      }

      const arrayBuffer = await fileResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      sha256 = createHash("sha256").update(buffer).digest("hex")
    }

    // .sha256 파일 형식: "해시값  파일명" (GNU coreutils sha256sum 형식)
    const sha256Content = `${sha256}  ${filename}\n`

    // SHA256 파일 반환
    return new NextResponse(sha256Content, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="${filename}.sha256"`,
      },
    })
  } catch (error) {
    console.error("[v0] SHA256 file generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SHA256 파일 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}

