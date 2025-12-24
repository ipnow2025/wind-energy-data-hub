import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { validateSession, refreshSession } from "./session-manager.ts"

export async function checkAdminAuth() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")

  if (!session || session.value !== "authenticated") {
    redirect("/admin/login")
  }

  const userId = cookieStore.get("user-id")?.value
  const sessionId = cookieStore.get("session-id")?.value

  if (userId && sessionId) {
    const isValid = await validateSession(userId, sessionId)
    if (!isValid) {
      redirect("/admin/login")
    }
    await refreshSession(userId, sessionId)
  }

  return true
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")

  if (!session || session.value !== "authenticated") {
    return false
  }

  const userId = cookieStore.get("user-id")?.value
  const sessionId = cookieStore.get("session-id")?.value

  if (userId && sessionId) {
    const isValid = await validateSession(userId, sessionId)
    if (isValid) {
      await refreshSession(userId, sessionId)
    }
    return isValid
  }

  return true
}
