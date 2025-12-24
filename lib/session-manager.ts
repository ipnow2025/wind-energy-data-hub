import { createClient } from "@supabase/supabase-js"

export function generateSessionId(): string {
  return crypto.randomUUID()
}

export async function createSession(userId: string, sessionId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  await supabase.from("user_sessions").delete().eq("user_id", userId)

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)

  const { error } = await supabase.from("user_sessions").insert({
    user_id: userId,
    session_id: sessionId,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`)
  }
}

export async function refreshSession(userId: string, sessionId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials not configured")
    return false
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10)

  const { error } = await supabase
    .from("user_sessions")
    .update({ expires_at: expiresAt.toISOString() })
    .eq("user_id", userId)
    .eq("session_id", sessionId)

  if (error) {
    console.error("Failed to refresh session:", error)
    return false
  }

  return true
}

export async function validateSession(
  userId: string,
  sessionId: string,
): Promise<{ valid: boolean; reason?: "not_found" | "expired" | "error" }> {
  console.log("[v0] Session Manager: Validating session for userId:", userId, "sessionId:", sessionId)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] Session Manager: Supabase credentials not configured")
    return { valid: false, reason: "error" }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("[v0] Session Manager: Querying database...")
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .maybeSingle()

    console.log("[v0] Session Manager: Query result - data:", data, "error:", error)

    if (error || !data) {
      console.log("[v0] Session Manager: Session not found")
      return { valid: false, reason: "not_found" }
    }

    const expiresAt = new Date(data.expires_at)
    const now = new Date()
    console.log("[v0] Session Manager: Checking expiration - expiresAt:", expiresAt, "now:", now)

    if (expiresAt < now) {
      console.log("[v0] Session Manager: Session expired")
      await supabase.from("user_sessions").delete().eq("user_id", userId)
      return { valid: false, reason: "expired" }
    }

    console.log("[v0] Session Manager: Session valid")
    return { valid: true }
  } catch (error) {
    console.error("[v0] Session Manager: Validation error:", error)
    return { valid: false, reason: "error" }
  }
}

export async function deleteSession(userId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  await supabase.from("user_sessions").delete().eq("user_id", userId)
}

export async function hasActiveSession(userId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return false
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase.from("user_sessions").select("*").eq("user_id", userId).maybeSingle()

  if (error || !data) {
    return false
  }

  const expiresAt = new Date(data.expires_at)
  if (expiresAt < new Date()) {
    await supabase.from("user_sessions").delete().eq("user_id", userId)
    return false
  }

  return true
}
