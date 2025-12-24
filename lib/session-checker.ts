"use client"

export async function checkSessionStatus(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/status")
    if (response.status === 401) {
      const sessionExpired = response.headers.get("X-Session-Expired") === "true"
      if (sessionExpired) {
        // 세션이 만료되었으므로 로그인 페이지로 리다이렉트
        window.location.href = "/login?reason=session_expired"
        return false
      }
    }
    return response.ok
  } catch (error) {
    console.error("[v0] Session check failed:", error)
    return false
  }
}
