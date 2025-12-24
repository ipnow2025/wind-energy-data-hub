"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Generate or get session ID
    let sessionId = localStorage.getItem("analyticsSessionId")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("analyticsSessionId", sessionId)
    }

    // Track page visit
    const trackVisit = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pagePath: pathname,
            sessionId,
          }),
        })
      } catch (error) {
        console.error("[v0] Failed to track visit:", error)
      }
    }

    trackVisit()
  }, [pathname])

  return null
}
