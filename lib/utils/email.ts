/**
 * Email utility functions
 */

import emailjs from "@emailjs/browser"
import { EMAILJS_CONFIG, DEFAULT_ADMIN_EMAIL } from "@/lib/constants"

export interface EmailNotificationParams {
  boardId: string
  title: string
  content: string
  toEmail?: string
}

/**
 * Send email notification for new collaboration post
 */
export async function sendCollaborationPostNotification(
  params: EmailNotificationParams
): Promise<void> {
  try {
    const templateParams = {
      board_id: params.boardId,
      title: params.title,
      content: params.content,
      time: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      toemail: params.toEmail || DEFAULT_ADMIN_EMAIL,
    }

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    )

    console.log("[v0] Email notification sent successfully")
  } catch (error) {
    console.error("[v0] Email notification failed:", error)
    // Don't throw - email failure shouldn't block the main operation
  }
}

/**
 * Get recipient email for a board
 */
export async function getBoardEmail(board: string): Promise<string> {
  if (board === "ALL") {
    return DEFAULT_ADMIN_EMAIL
  }

  try {
    const res = await fetch(`/api/admin/users/email?board=${board}`)
    if (res.ok) {
      const { email } = await res.json()
      if (email) {
        return `${DEFAULT_ADMIN_EMAIL}, ${email}`
      }
    }
  } catch (error) {
    console.error("Failed to fetch board email:", error)
  }

  return DEFAULT_ADMIN_EMAIL
}

