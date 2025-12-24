"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, BarChart3, FileText, LogOut, Menu, X, Users, UserCog } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("로그아웃 오류:", error)
    }
  }

  const navigation = [
    { name: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "통계", href: "/admin/statistics", icon: BarChart3 },
    { name: "지식센터 관리", href: "/admin/knowledge", icon: FileText },
    { name: "협업 게시판 관리", href: "/admin/collaboration", icon: Users },
    { name: "계정 관리", href: "/admin/users", icon: UserCog },
  ]

  return (
    <div className="bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden sticky top-16 left-4 z-50 p-4">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`sticky top-16 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out h-[calc(100vh-4rem)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block hidden lg:fixed lg:top-16`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-xl font-bold text-foreground">관리자 페이지</h2>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-3" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
