// 협업 게시판 공유 데이터 저장소
// 실제 프로덕션에서는 데이터베이스를 사용해야 합니다

export type CollaborationPost = {
  id: string
  title: string
  content: string
  author: string
  authorRole: "admin" | "guest"
  createdAt: string
  updatedAt: string
  files?: Array<{ name: string; url: string }>
}

declare global {
  var collaborationPosts: Record<string, CollaborationPost[]>
}

global.collaborationPosts = global.collaborationPosts || {}

export function getPosts(): Record<string, CollaborationPost[]> {
  if (!global.collaborationPosts) {
    global.collaborationPosts = {}
  }
  return global.collaborationPosts
}
