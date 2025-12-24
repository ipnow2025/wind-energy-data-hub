"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AdminUser {
  id: string
  username: string
  email?: string
  role: string
  created_at?: string
  updated_at?: string
}

export default function UsersManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ id: "", username: "", email: "", password: "" })
  const [creating, setCreating] = useState(false)

  // Edit user dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ username: "", email: "", password: "" })
  const [editing, setEditing] = useState(false)

  // Delete user dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const sessionId = localStorage.getItem("sessionId")

    if (!sessionId || userRole !== "admin") {
      router.push("/login")
      return
    }

    setIsAuthorized(true)
    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      toast({
        title: "오류",
        description: "사용자 목록을 불러오는데 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.id || !createForm.username || !createForm.password) {
      toast({
        title: "오류",
        description: "모든 필드를 입력해주세요",
        variant: "destructive",
      })
      return
    }

    if (createForm.username.includes(" ")) {
      toast({
        title: "오류",
        description: "사용자명에 공백이 포함될 수 없습니다",
        variant: "destructive",
      })
      return
    }

    try {
      setCreating(true)
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...createForm, role: "guest" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      toast({
        title: "성공",
        description: "사용자가 생성되었습니다",
      })

      setCreateDialogOpen(false)
      setCreateForm({ id: "", username: "", email: "", password: "" })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "사용자 생성에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleEditUser = async () => {
    if (!editingUser || !editForm.username) {
      toast({
        title: "오류",
        description: "사용자명을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    if (editForm.username.includes(" ")) {
      toast({
        title: "오류",
        description: "사용자명에 공백이 포함될 수 없습니다",
        variant: "destructive",
      })
      return
    }

    try {
      setEditing(true)
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      toast({
        title: "성공",
        description: "사용자 정보가 수정되었습니다",
      })

      setEditDialogOpen(false)
      setEditingUser(null)
      setEditForm({ username: "", email: "", password: "" })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "사용자 수정에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setEditing(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user")
      }

      toast({
        title: "성공",
        description: "사용자가 삭제되었습니다",
      })

      setDeleteDialogOpen(false)
      setDeletingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "사용자 삭제에 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setEditForm({ username: user.username, email: user.email || "", password: "" })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (user: AdminUser) => {
    setDeletingUser(user)
    setDeleteDialogOpen(true)
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">계정 관리</h1>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                계정 등록
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 계정 등록</DialogTitle>
                <DialogDescription>새로운 게스트 계정을 생성합니다</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-id">아이디</Label>
                  <Input
                    id="create-id"
                    value={createForm.id}
                    onChange={(e) => setCreateForm({ ...createForm, id: e.target.value })}
                    placeholder="사용자 아이디"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-username">사용자명</Label>
                  <Input
                    id="create-username"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="사용자명"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">이메일 (선택)</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-password">비밀번호</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="비밀번호"
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    강력한 비밀번호를 사용하세요 (8자 이상, 영문/숫자/특수문자 조합)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={creating}>
                  취소
                </Button>
                <Button onClick={handleCreateUser} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "등록"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>현재 등록된 사용자 계정</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>아이디</TableHead>
                    <TableHead>사용자명</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>생성일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === "admin" ? (
                            <>
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="text-primary font-medium">관리자</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">게스트</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("ko-KR") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            disabled={user.id === "admin"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>계정 수정</DialogTitle>
              <DialogDescription>사용자 계정 정보를 수정합니다</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">사용자명</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="사용자명"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">이메일 (선택)</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">비밀번호 (변경 시에만 입력)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="새 비밀번호"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editing}>
                취소
              </Button>
              <Button onClick={handleEditUser} disabled={editing}>
                {editing ? <Loader2 className="h-4 w-4 animate-spin" /> : "수정"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>계정 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 <strong>{deletingUser?.username}</strong> 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
