"use client"

import { useEffect, useRef } from "react"

interface ConfettiPiece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  vRotation: number
  life: number
}

const COLORS = [
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // purple
  "#0ea5e9", // sky
  "#facc15", // yellow
  "#ec4899", // pink
]

export default function Confetti({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const triggerRef = useRef(trigger)

  useEffect(() => {
    triggerRef.current = trigger
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let pieces: ConfettiPiece[] = []
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    function resize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", resize)

    function burst() {
      const count = 80
      const cx = width / 2
      const cy = height / 3
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        const speed = 4 + Math.random() * 8
        pieces.push({
          x: cx + (Math.random() - 0.5) * 100,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          size: 6 + Math.random() * 10,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          vRotation: (Math.random() - 0.5) * 0.3,
          life: 1,
        })
      }
    }

    function tick() {
      ctx.clearRect(0, 0, width, height)

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i]
        p.vy += 0.2 // gravity
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.vRotation
        p.life -= 0.008

        if (p.life <= 0 || p.y > height + 50) {
          pieces.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }

      raf = requestAnimationFrame(tick)
    }
    tick()

    // Watch for trigger changes
    let lastTrigger = trigger
    const interval = setInterval(() => {
      if (triggerRef.current !== lastTrigger) {
        lastTrigger = triggerRef.current
        burst()
      }
    }, 100)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      clearInterval(interval)
    }
  }, [trigger])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  )
}
