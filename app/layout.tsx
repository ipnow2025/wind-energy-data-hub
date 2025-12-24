import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ConditionalFooter } from "@/components/conditional-footer"
import { Navigation } from "@/components/navigation"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { ActivityTracker } from "@/components/activity-tracker"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "풍력자원 데이터 허브 - KIER",
  description: "풍력에너지의 미래를 선도합니다.",
  generator: "v0.app",
  openGraph: {
    title: "풍력자원 데이터 허브 - KIER",
    description: "풍력에너지의 미래를 선도합니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "풍력자원데이터허브",
  },
  twitter: {
    card: "summary_large_image",
    title: "풍력자원 데이터 허브 - KIER",
    description: "풍력에너지의 미래를 선도합니다.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <AnalyticsTracker />
        <ActivityTracker />
        <Navigation />
        <main className="flex-1">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  )
}
