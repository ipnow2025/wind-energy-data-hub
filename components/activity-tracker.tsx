"use client"

import { useEffect, useRef } from "react"

export function ActivityTracker() {
  const lastActivityRef = useRef<number>(Date.now())
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const updateActivity = async () => {
      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")

      if (!sessionId || !userId) return

      try {
        await fetch("/api/auth/activity", {
          method: "POST",
          headers: {
            "X-User-Id": userId,
            "X-Session-Id": sessionId,
          },
        })
      } catch (error) {
        console.error("[v0] Activity update failed:", error)
      }
    }

    const handleActivity = () => {
      const now = Date.now()
      const timeSinceLastUpdate = now - lastActivityRef.current

      // Only update if more than 30 seconds have passed since last update
      if (timeSinceLastUpdate > 30000) {
        lastActivityRef.current = now

        // Clear existing timeout
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }

        // Debounce the update to avoid too many requests
        updateTimeoutRef.current = setTimeout(() => {
          updateActivity()
        }, 1000)
      }
    }

    // Listen to various user activity events
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"]

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Update activity on mount (page load)
    updateActivity()

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  return null
}
