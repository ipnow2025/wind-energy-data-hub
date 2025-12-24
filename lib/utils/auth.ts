/**
 * Authentication utility functions
 */

export interface AuthHeaders {
  "x-user-id"?: string
  "x-session-id"?: string
  "x-user-role"?: string
}

/**
 * Get authentication data from localStorage
 */
export function getAuthFromStorage(): {
  userId: string | null
  sessionId: string | null
  userRole: string | null
} {
  if (typeof window === "undefined") {
    return { userId: null, sessionId: null, userRole: null }
  }

  return {
    userId: localStorage.getItem("userId"),
    sessionId: localStorage.getItem("sessionId"),
    userRole: localStorage.getItem("userRole"),
  }
}

/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders(): HeadersInit {
  const { userId, sessionId, userRole } = getAuthFromStorage()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (userId && sessionId && userRole) {
    headers["x-user-id"] = userId
    headers["x-session-id"] = sessionId
    headers["x-user-role"] = userRole
  }

  return headers
}

