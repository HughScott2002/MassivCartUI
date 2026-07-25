import { ImageResponse } from "next/og"

export const alt =
  "Massiv Cart AI — Cheapest grocery prices in Jamaica"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(1000px 600px at 15% -10%, #0c3b2a 0%, #1a1a2e 55%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "88px",
              height: "88px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #00E676, #00B85C)",
              color: "#ffffff",
              fontSize: "60px",
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ display: "flex", color: "#ffffff", fontSize: "34px", fontWeight: 700 }}>
            Massiv Cart AI
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: "72px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Cheapest groceries in Jamaica
          </div>
          <div style={{ display: "flex", color: "#a9b4c2", fontSize: "34px", lineHeight: 1.3 }}>
            Search in plain English or snap a receipt — AI finds the cheapest stores near you.
          </div>
        </div>

        {/* Footer credit */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", width: "14px", height: "14px", borderRadius: "999px", background: "#00d26a" }} />
          <div style={{ display: "flex", color: "#ffffff", fontSize: "28px", fontWeight: 600 }}>
            Built by Hugh Scott
          </div>
          <div style={{ display: "flex", color: "#6b7688", fontSize: "28px" }}>· hughscott.dev</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
