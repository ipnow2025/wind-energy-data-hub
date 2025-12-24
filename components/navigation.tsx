"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState, useRef, Suspense, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { NavigationClient } from "./navigation-client"

async function validateSession(userId: string, sessionId: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const response = await fetch("/api/auth/status", {
      headers: {
        "X-User-Id": userId,
        "X-Session-Id": sessionId,
      },
    })

    if (!response.ok) {
      try {
        const data = await response.json()
        return { valid: false, reason: data.reason || "expired" }
      } catch (e) {
        return { valid: false, reason: "parse_error" }
      }
    }

    return { valid: true }
  } catch (error) {
    console.error("[v0] Navigation: Session validation network error (ignored):", error)
    return { valid: true }
  }
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null)

  // 클라이언트에서만 마운트 후 초기 상태 설정 (hydration 불일치 방지)
  useEffect(() => {
    setIsMounted(true)
    const sessionId = localStorage.getItem("sessionId")
    const role = localStorage.getItem("userRole")
    
    if (sessionId) {
      setIsLoggedIn(true)
    }
    if (role) {
      setUserRole(role)
    }
  }, [])

  const handleJustLoggedIn = (justLoggedIn: boolean) => {
    if (pathname === "/login") {
      setIsLoggedIn(false)
      setUserRole(null)
      return
    }

    const checkSession = async () => {
      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")

      if (!sessionId || !userId) {
        setIsLoggedIn(false)
        setUserRole(null)
        return
      }

      const validationResult = await validateSession(userId, sessionId)

      if (!validationResult.valid) {
        if (validationResult.reason !== "network_error") {
          localStorage.clear()
          setIsLoggedIn(false)
          setUserRole(null)

          let reason = "session_expired"
          if (validationResult.reason === "not_found") {
            reason = "other_login"
          } else if (validationResult.reason === "inactivity") {
            reason = "inactivity"
          }
          router.push(`/login?reason=${reason}`)
        }
        return
      }

      setIsLoggedIn(true)
      setUserRole(localStorage.getItem("userRole"))
    }

    if (justLoggedIn) {
      setIsLoggedIn(true)
      setUserRole(localStorage.getItem("userRole"))

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete("justLoggedIn")
      window.history.replaceState({}, "", newUrl.toString())

      setTimeout(() => {
        checkSession()
        if (sessionCheckRef.current) {
          clearInterval(sessionCheckRef.current)
        }
        sessionCheckRef.current = setInterval(checkSession, 60000)
      }, 60000)
    } else {
      checkSession()

      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current)
      }
      sessionCheckRef.current = setInterval(checkSession, 60000)
    }

    const handleFocus = () => {
      checkSession()
    }
    window.addEventListener("focus", handleFocus)

    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current)
        sessionCheckRef.current = null
      }
      window.removeEventListener("focus", handleFocus)
    }
  }

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId")
      const userId = localStorage.getItem("userId")

      if (sessionId && userId) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            "X-User-Id": userId,
            "X-Session-Id": sessionId,
          },
        })
      }

      localStorage.clear()
      setIsLoggedIn(false)
      setUserRole(null)

      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <Suspense fallback={null}>
        <NavigationClient onJustLoggedIn={handleJustLoggedIn} />
      </Suspense>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity">
          <Image src="/images/kier-logo.jpg" alt="KIER 로고" width={40} height={40} className="object-contain" />
          <span className="text-lg md:text-2xl font-bold text-foreground">풍력자원데이터허브</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-12">
          <Link
            href="/platform"
            className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            데이터허브 소개
          </Link>
          {(!isMounted || userRole !== "admin") && (
            <Link
              href="/knowledge"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              지식센터
            </Link>
          )}
          <Link
            href="/visualization"
            className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            가시화 서비스
          </Link>
          {(!isMounted || userRole !== "admin") && (
            <Link
              href="/collaboration"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              협업 게시판
            </Link>
          )}
          <Link
            href="/contact"
            className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            문의하기
          </Link>
          {isMounted && isLoggedIn && userRole === "admin" && (
            <Link
              href="/admin/dashboard"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              관리자 페이지
            </Link>
          )}
          {pathname === "/login" ? (
            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/login">로그인</Link>
            </Button>
          ) : !isMounted ? (
            <div className="w-24 h-10" />
          ) : isLoggedIn ? (
            <Button onClick={handleLogout} className="bg-primary hover:bg-primary/90 text-white">
              로그아웃
            </Button>
          ) : (
            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </nav>

        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="메뉴 토글">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container py-4 flex flex-col space-y-4">
            <Link
              href="/platform"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              플랫폼 소개
            </Link>
            {(!isMounted || userRole !== "admin") && (
              <Link
                href="/knowledge"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                지식센터
              </Link>
            )}
            <Link
              href="/visualization"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              가시화 서비스
            </Link>
            {(!isMounted || userRole !== "admin") && (
              <Link
                href="/collaboration"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                협업 게시판
              </Link>
            )}
            <Link
              href="/contact"
              className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              문의하기
            </Link>
            {isMounted && isLoggedIn && userRole === "admin" && (
              <Link
                href="/admin/dashboard"
                className="text-base font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                관리자 페이지
              </Link>
            )}
            {pathname === "/login" ? (
              <Button asChild className="bg-primary hover:bg-primary/90 text-white w-fit">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  로그인
                </Link>
              </Button>
            ) : !isMounted ? null : isLoggedIn ? (
              <Button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="bg-primary hover:bg-primary/90 text-white w-fit"
              >
                로그아웃
              </Button>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90 text-white w-fit">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  로그인
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navigation
