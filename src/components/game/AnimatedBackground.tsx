"use client"

import { useEffect, useRef } from "react"

interface FloatingLetter {
  x: number
  y: number
  char: string
  size: number
  vy: number
  vx: number
  rotation: number
  vRotation: number
  opacity: number
  color: string
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const COLORS = [
  "rgba(16, 185, 129, 0.18)", // emerald
  "rgba(20, 184, 166, 0.18)", // teal
  "rgba(245, 158, 11, 0.18)", // amber
  "rgba(244, 63, 94, 0.15)", // rose
  "rgba(168, 85, 247, 0.15)", // purple
  "rgba(14, 165, 233, 0.15)", // sky
]

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const letters: FloatingLetter[] = []
    const count = Math.min(40, Math.floor((width * height) / 28000))

    function spawn(initial = false) {
      const char = LETTERS[Math.floor(Math.random() * LETTERS.length)]
      const size = 24 + Math.random() * 56
      letters.push({
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + size,
        char,
        size,
        vy: -0.2 - Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.01,
        opacity: 0.4 + Math.random() * 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }

    for (let i = 0; i < count; i++) spawn(true)

    function resize() {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", resize)

    function tick() {
      ctx.clearRect(0, 0, width, height)

      for (let i = letters.length - 1; i >= 0; i--) {
        const l = letters[i]
        l.x += l.vx
        l.y += l.vy
        l.rotation += l.vRotation

        if (l.x < -l.size) l.x = width + l.size
        if (l.x > width + l.size) l.x = -l.size

        if (l.y < -l.size * 1.5) {
          letters.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.translate(l.x, l.y)
        ctx.rotate(l.rotation)
        ctx.globalAlpha = l.opacity
        ctx.fillStyle = l.color
        ctx.font = `900 ${l.size}px "Geist", "Inter", sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(l.char, 0, 0)
        ctx.restore()
      }

      while (letters.length < count) spawn(false)

      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
