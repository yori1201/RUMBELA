"use client"

import { motion } from "framer-motion"

interface MascotProps {
  mood?: "happy" | "thinking" | "celebrating" | "sad" | "idle"
  size?: number
  message?: string
}

export default function Mascot({ mood = "idle", size = 120, message }: MascotProps) {
  // Framer Motion ambient animation - subtle motion overlay on top of the GIF/WebP
  // The mascot itself is already animated (WebP with 6 frames breathing/blink/wave/bounce)
  // These Framer Motion effects add mood-specific ambient motion
  const animations = {
    idle: {
      y: [0, -6, 0],
      rotate: 0,
      scale: 1,
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
    },
    happy: {
      y: [0, -10, 0],
      rotate: [0, -3, 3, -3, 0],
      scale: [1, 1.03, 1],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" as const },
    },
    thinking: {
      y: [0, -3, 0],
      rotate: [-2, 2, -2],
      scale: 1,
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
    },
    celebrating: {
      y: [0, -20, 0],
      rotate: [0, -8, 8, -8, 8, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const },
    },
    sad: {
      y: [0, 3, 0],
      rotate: 0,
      scale: [1, 0.98, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
    },
  }

  const anim = animations[mood]

  // Mood-based filter for subtle expression shift
  const moodFilter =
    mood === "sad"
      ? "saturate(0.7) brightness(0.95)"
      : mood === "celebrating" || mood === "happy"
      ? "saturate(1.15) brightness(1.05)"
      : "none"

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ y: anim.y, rotate: anim.rotate, scale: anim.scale }}
        transition={anim.transition}
        style={{ width: size, height: size }}
        className="relative"
      >
        {/* Animated Rumbela mascot - Bela the green sprout */}
        {/* WebP with 6-frame breathing/blink/wave/bounce loop */}
        <motion.img
          src="/rumbela/mascot-bela-animated.webp"
          alt="Bela - Rumbela mascot (animated)"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: moodFilter,
          }}
          draggable={false}
        />

        {/* Floating sparkles when celebrating */}
        {mood === "celebrating" &&
          [0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: Math.cos((i * Math.PI * 2) / 5) * 60,
                y: Math.sin((i * Math.PI * 2) / 5) * 60 - 30,
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              style={{
                left: "50%",
                top: "30%",
              }}
            >
              {["✨", "⭐", "💫", "🌟", "✨"][i]}
            </motion.div>
          ))}

        {/* Sad tear */}
        {mood === "sad" && (
          <motion.div
            className="absolute text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 0], y: [20, 50, 80] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeIn" }}
            style={{ left: "40%", top: "45%" }}
          >
            💧
          </motion.div>
        )}

        {/* Thinking thought bubble */}
        {mood === "thinking" && (
          <motion.div
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ right: "-8%", top: "-5%", fontSize: size * 0.25 }}
          >
            💭
          </motion.div>
        )}
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 max-w-xs rounded-2xl bg-white/90 px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-lg backdrop-blur-sm dark:bg-slate-800/90 dark:text-slate-100"
        >
          <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Bela
          </span>
          {message}
        </motion.div>
      )}
    </div>
  )
}
