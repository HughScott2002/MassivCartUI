"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, ShoppingBasket, Navigation, Camera, X, ChevronRight } from "lucide-react"

const STEPS = [
  {
    icon: Search,
    title: "Find the best price",
    body: 'Type anything into the command bar — "cheapest rice", "cooking oil near me". AI finds it instantly.',
  },
  {
    icon: Camera,
    title: "Scan your receipt",
    body: "Snap a photo of any receipt to add prices to the database and earn 100 Scout Points toward your tier.",
  },
  {
    icon: MapPin,
    title: "Explore the map",
    body: "Tap any store pin to browse its prices. The map flies to the cheapest deal automatically.",
  },
  {
    icon: ShoppingBasket,
    title: "Build your list",
    body: "Hit Add on any price row to save it to My List. Your running total updates as you shop.",
  },
  {
    icon: Navigation,
    title: "Plan your route",
    body: "With 2+ stores in My List, hit Show Route to draw your shopping path on the map.",
  },
]

function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const COLORS = ["#00d26a", "#6366f1", "#f59e0b", "#ec4899", "#38bdf8", "#ffffff"]
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      r: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? "rect" : "circle" as "rect" | "circle",
    }))

    let frame = 0
    let raf: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - frame / 90)
        if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12
        p.angle += p.spin
      }
      frame++
      if (frame < 100) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[10000]"
      style={{ width: "100vw", height: "100vh" }}
    />
  )
}

interface TutorialOverlayProps {
  onDone?: () => void
}

export function TutorialOverlay({ onDone }: TutorialOverlayProps) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<"forward" | "back">("forward")
  const [done, setDone] = useState(false)

  function close(withConfetti: boolean) {
    if (withConfetti) setDone(true)
    onDone?.()
  }

  if (done) return <ConfettiBurst />

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  function goNext() {
    setDir("forward")
    setStep((s) => s + 1)
  }

  function goBack() {
    setDir("back")
    setStep((s) => s - 1)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6 overflow-hidden">

          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-medium text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              type="button"
              onClick={() => close(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Skip tutorial"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Animated step content */}
          <div
            key={`${step}-${dir}`}
            style={{
              animation: `tutorial-${dir} 220ms cubic-bezier(0.22,1,0.36,1) both`,
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
                <Icon className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">{current.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-5 bg-primary"
                    : i < step
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => { if (isLast) { close(true) } else { goNext() } }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {isLast ? "Welcome to MASSIV" : "Next"}
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tutorial-forward {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tutorial-back {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
