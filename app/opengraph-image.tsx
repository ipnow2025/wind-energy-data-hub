import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "풍력자원데이터허브 - KIER"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <img
          src="/images/design-mode/KIER_logo.jpg.jpeg"
          alt="KIER Logo"
          width="180"
          height="180"
          style={{ objectFit: "contain" }}
        />
        <span
          style={{
            fontSize: "96px",
            fontWeight: "bold",
            color: "#000000",
          }}
        >
          풍력자원데이터허브
        </span>
      </div>
    </div>,
    {
      ...size,
    },
  )
}
