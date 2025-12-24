import { cookies, headers } from "next/headers"
import { validateSession, refreshSession } from "./session-manager"
import { NextResponse } from "next/server"

export async function validateApiAuth(): Promise<
  { authenticated: true; userId: string; role: string } | { authenticated: false; response: NextResponse }
> {
  const headersList = await headers()
  const headerUserId = headersList.get("x-user-id")
  const headerSessionId = headersList.get("x-session-id")
  const headerRole = headersList.get("x-user-role")

  console.log("[v0] API auth: Checking headers", {
    headerUserId,
    headerSessionId,
    headerRole,
    allHeaders: Object.fromEntries(headersList.entries()),
  })

  // 헤더에 세션 정보가 있으면 헤더 기반 인증 사용
  if (headerUserId && headerSessionId) {
    console.log("[v0] API auth: Using header-based authentication")
    const validationResult = await validateSession(headerUserId, headerSessionId)
    if (!validationResult.valid) {
      const reason = validationResult.reason === "not_found" ? "replaced" : "expired"

      return {
        authenticated: false,
        response: NextResponse.json(
          { error: "Session expired or invalid", sessionExpired: true, reason },
          {
            status: 401,
            headers: {
              "X-Session-Expired": "true",
              "X-Session-Expired-Reason": reason,
            },
          },
        ),
      }
    }

    await refreshSession(headerUserId, headerSessionId)

    return {
      authenticated: true,
      userId: headerUserId,
      role: headerRole || "guest",
    }
  }

  console.log("[v0] API auth: No headers found, falling back to cookie-based authentication")

  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")
  const userRole = cookieStore.get("user-role")
  const userId = cookieStore.get("user-id")
  const sessionId = cookieStore.get("session-id")

  console.log("[v0] API auth validation:", {
    hasSession: !!session,
    sessionValue: session?.value,
    userId: userId?.value,
    sessionId: sessionId?.value,
    role: userRole?.value,
  })

  if (!session || session.value !== "authenticated") {
    console.log("[v0] API auth failed: No valid session cookie")
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: "Unauthorized", sessionExpired: true },
        {
          status: 401,
          headers: {
            "X-Session-Expired": "true",
          },
        },
      ),
    }
  }

  if (userId?.value && sessionId?.value) {
    const validationResult = await validateSession(userId.value, sessionId.value)
    if (!validationResult.valid) {
      console.log(
        "[v0] API auth failed: Session validation failed for user:",
        userId.value,
        "reason:",
        validationResult.reason,
      )

      const reason = validationResult.reason === "not_found" ? "replaced" : "expired"

      return {
        authenticated: false,
        response: NextResponse.json(
          { error: "Session expired or invalid", sessionExpired: true, reason },
          {
            status: 401,
            headers: {
              "X-Session-Expired": "true",
              "X-Session-Expired-Reason": reason,
            },
          },
        ),
      }
    }

    await refreshSession(userId.value, sessionId.value)
  } else {
    console.log("[v0] API auth warning: Missing userId or sessionId cookie")
  }

  console.log("[v0] API auth successful for user:", userId?.value)
  return {
    authenticated: true,
    userId: userId?.value || "",
    role: userRole?.value || "guest",
  }
}
