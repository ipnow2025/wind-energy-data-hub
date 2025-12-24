"use client"

import type React from "react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Send } from "lucide-react"
import { useState } from "react"
import emailjs from "@emailjs/browser"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
    privacyConsent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요"
    }
    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다"
    }
    if (!formData.inquiryType) {
      newErrors.inquiryType = "문의 유형을 선택해주세요"
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "제목을 입력해주세요"
    }
    if (!formData.message.trim()) {
      newErrors.message = "문의 내용을 입력해주세요"
    }
    if (!formData.privacyConsent) {
      newErrors.privacyConsent = "개인정보 수집 및 이용에 동의해주세요"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSubmitStatus("idle")
      return
    }

    setErrors({})
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      emailjs.init("CC_ncjUx42Iz5LEIb")

      const now = new Date()
      const formattedTime = now.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      const result = await emailjs.send("sjpresso3", "template_xam18f7", {
        title: formData.subject,
        name: formData.name,
        email: formData.email,
        company: formData.company || "미입력",
        phone: formData.phone || "미입력",
        type: formData.inquiryType,
        time: formattedTime,
        message: formData.message,
      })

      console.log("[v0] 이메일 전송 성공:", result)
      setSubmitStatus("success")

      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        inquiryType: "",
        subject: "",
        message: "",
        privacyConsent: false,
      })
    } catch (error) {
      console.error("[v0] 이메일 전송 실패:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-balance mb-6 text-foreground">
              <span className="text-primary">문의하기</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">문의 양식</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  아래의 양식을 통해 문의사항을 남겨주시면 담당자가 확인하고 답변드리겠습니다.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        placeholder="이름을 입력하세요"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`bg-white ${errors.name ? "border-red-500" : ""}`}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일 *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`bg-white ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">회사명</Label>
                      <Input
                        id="company"
                        placeholder="회사명을 입력하세요"
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        placeholder="연락처를 입력하세요"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">문의 유형 *</Label>
                    <Select
                      value={formData.inquiryType}
                      onValueChange={(value) => handleInputChange("inquiryType", value)}
                    >
                      <SelectTrigger className={`w-full bg-white ${errors.inquiryType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="문의 유형을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">서비스 문의</SelectItem>
                        <SelectItem value="pricing">가격 문의</SelectItem>
                        <SelectItem value="technical">기술 지원</SelectItem>
                        <SelectItem value="partnership">파트너십</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.inquiryType && <p className="text-sm text-red-500">{errors.inquiryType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">제목 *</Label>
                    <Input
                      id="subject"
                      placeholder="문의 제목을 입력하세요"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className={`bg-white ${errors.subject ? "border-red-500" : ""}`}
                    />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">문의 내용 *</Label>
                    <Textarea
                      id="message"
                      placeholder="문의 내용을 상세히 입력하세요"
                      rows={10}
                      className={`min-h-[120px] bg-white ${errors.message ? "border-red-500" : ""}`}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="privacy-consent"
                        checked={formData.privacyConsent}
                        onCheckedChange={(checked) => handleInputChange("privacyConsent", checked as boolean)}
                        className="bg-white border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="privacy-consent"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          개인정보 수집 및 이용에 동의합니다 *
                        </Label>
                      </div>
                    </div>
                    {errors.privacyConsent && <p className="text-sm text-red-500">{errors.privacyConsent}</p>}
                  </div>

                  {submitStatus === "success" && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.
                    </div>
                  )}
                  {submitStatus === "error" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                      문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full !bg-blue-700 hover:!bg-blue-800 text-white"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "전송 중..." : "문의 보내기"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
