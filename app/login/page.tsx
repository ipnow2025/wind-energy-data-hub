"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function LoginContent() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const reason = searchParams.get("reason")
    if (reason === "inactivity") {
      setError("10분간 활동이 없어 자동으로 로그아웃되었습니다.")
    } else if (reason === "session_expired") {
      setError("로그인 유지 시간이 만료되어 자동으로 로그아웃 되었습니다.")
    } else if (reason === "other_login") {
      setError("다른 환경에서 로그인하여 자동으로 로그아웃 되었습니다.")
    }
  }, [searchParams])

  const handleLogin = async (forceLogin = false) => {
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Login: Starting login process")
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, forceLogin }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Login: Response received", data)

        if (data.hasActiveSession) {
          console.log("[v0] Login: Active session detected, showing dialog")
          setShowSessionDialog(true)
          setIsLoading(false)
          return
        }

        if (data.sessionData) {
          console.log("[v0] Login: Session data saved, redirecting...")
          localStorage.setItem("sessionId", data.sessionData.sessionId)
          localStorage.setItem("userId", data.sessionData.userId)
          localStorage.setItem("username", data.sessionData.username)
          localStorage.setItem("userRole", data.sessionData.role)
          localStorage.setItem("loginTime", Date.now().toString())

          console.log("[v0] Login: Session data saved, redirecting...")
          
          const redirectPath = searchParams.get("redirect")
          
          if (redirectPath) {
            router.push(redirectPath)
          } else if (data.role === "admin") {
            router.push("/admin/dashboard?justLoggedIn=true")
          } else {
            router.push("/?justLoggedIn=true")
          }
        } else {
          console.error("[v0] Login: No session data in response")
          setError("세션 데이터를 받지 못했습니다.")
          setIsLoading(false)
        }
      } else {
        const data = await response.json()
        console.error("[v0] Login: Login failed", data)
        setError(data.error || "로그인에 실패했습니다.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError(`로그인 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleLogin(false)
  }

  const handleForceLogin = async () => {
    setShowSessionDialog(false)
    await handleLogin(true)
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white"
              />
            </div>
            <div className="min-h-[20px]">
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>다른 환경에서 로그인 중</DialogTitle>
            <DialogDescription>
              이 계정은 현재 다른 환경에서 로그인되어 있습니다. 계속 진행하면 다른 환경에서 자동으로 로그아웃됩니다.
              계속하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
              취소
            </Button>
            <Button onClick={handleForceLogin}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center px-4 py-8 min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">로그인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>아이디</Label>
                  <Input disabled className="bg-white" />
                </div>
                <div className="space-y-2">
                  <Label>비밀번호</Label>
                  <Input type="password" disabled className="bg-white" />
                </div>
                <div className="min-h-[20px]" />
                <Button className="w-full" disabled>
                  로그인
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
