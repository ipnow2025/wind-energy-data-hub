"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface NavigationClientProps {
  onJustLoggedIn: (justLoggedIn: boolean) => void
}

export function NavigationClient({ onJustLoggedIn }: NavigationClientProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const justLoggedIn = searchParams.get("justLoggedIn") === "true"
    onJustLoggedIn(justLoggedIn)
  }, [searchParams, onJustLoggedIn])

  return null
}
