"use client"

import { useState, useRef, useEffect } from "react"

export function HeroVideo() {
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleError = (e: Event) => {
      console.error("[v0] Video loading error:", e)
      setHasError(true)
    }

    const handleCanPlay = () => {
      video.play().catch((err) => {
        console.error("[v0] Video play error:", err)
      })
    }

    video.addEventListener("error", handleError)
    video.addEventListener("canplay", handleCanPlay)

    return () => {
      video.removeEventListener("error", handleError)
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [])

  return (
    <div className="w-full aspect-video relative bg-black">
      {hasError && <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700" />}

      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        poster="/wind-speed-map-2002-updated.jpg"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ display: hasError ? "none" : "block" }}
      >
        <source
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%ED%92%8D%EB%A0%A5%EB%B0%9C%EC%A0%84%20%EB%8F%99%ED%96%A5_2002_2023_1080p_251027-1neGP7r6MdTYoSph1TwF9LuoZuR1Jl.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  )
}
