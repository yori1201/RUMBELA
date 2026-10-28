"use client"

import { motion } from "framer-motion"

interface MascotProps {
  mood?: "happy" | "thinking" | "celebrating" | "sad" | "idle"
  size?: number
  message?: string
}

export default function Mascot({ mood = "idle", size = 120, message }: MascotProps) {
  const animations = {
    idle: {
      y: [0, -8, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
    },
    happy: {
      y: [0, -15, 0],
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" as const },
    },
    thinking: {
      y: [0, -3, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
    },
    celebrating: {
      y: [0, -25, 0],
      rotate: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const },
    },
    sad: {
      y: [0, 3, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const },
    },
  }

  // Eye and mouth drawing based on mood
  const isHappy = mood === "happy" || mood === "celebrating"
  const isSad = mood === "sad"

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={animations[mood].y !== undefined ? { y: animations[mood].y } : {}}
        transition={animations[mood].transition}
        style={{ width: size, height: size }}
        className="relative"
      >
        <motion.div
          animate={animations[mood].rotate ? { rotate: animations[mood].rotate } : {}}
          transition={animations[mood].transition}
          className="h-full w-full"
        >
          <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-xl">
            {/* Body - owl shape */}
            <ellipse cx="100" cy="115" rx="65" ry="70" fill="#10b981" />
            <ellipse cx="100" cy="115" rx="55" ry="60" fill="#34d399" />
            {/* Belly */}
            <ellipse cx="100" cy="130" rx="35" ry="42" fill="#a7f3d0" opacity="0.6" />

            {/* Wings */}
            <ellipse cx="50" cy="115" rx="20" ry="40" fill="#059669" transform="rotate(-15 50 115)" />
            <ellipse cx="150" cy="115" rx="20" ry="40" fill="#059669" transform="rotate(15 150 115)" />

            {/* Head tufts */}
            <path d="M 70 50 Q 65 30 75 35 Q 80 40 80 55 Z" fill="#10b981" />
            <path d="M 130 50 Q 135 30 125 35 Q 120 40 120 55 Z" fill="#10b981" />

            {/* Eye circles (white) */}
            <circle cx="80" cy="90" r="22" fill="white" />
            <circle cx="120" cy="90" r="22" fill="white" />

            {/* Pupils - change with mood */}
            {isHappy ? (
              <>
                {/* Happy closed eyes ^_^ */}
                <path d="M 68 90 Q 80 80 92 90" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 108 90 Q 120 80 132 90" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            ) : isSad ? (
              <>
                <circle cx="80" cy="92" r="6" fill="#1f2937" />
                <circle cx="120" cy="92" r="6" fill="#1f2937" />
                {/* Tear */}
                <path d="M 70 110 Q 68 120 70 125 Q 72 120 70 110" fill="#60a5fa" opacity="0.8" />
              </>
            ) : (
              <>
                <circle cx="80" cy="90" r="8" fill="#1f2937" />
                <circle cx="120" cy="90" r="8" fill="#1f2937" />
                <circle cx="82" cy="88" r="3" fill="white" />
                <circle cx="122" cy="88" r="3" fill="white" />
              </>
            )}

            {/* Beak */}
            <path d="M 95 105 L 105 105 L 100 115 Z" fill="#f59e0b" />

            {/* Mouth/expression */}
            {isHappy && (
              <path d="M 85 125 Q 100 140 115 125" stroke="#065f46" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {isSad && (
              <path d="M 88 130 Q 100 120 112 130" stroke="#065f46" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {mood === "thinking" && (
              <path d="M 90 128 L 110 128" stroke="#065f46" strokeWidth="3" strokeLinecap="round" />
            )}

            {/* Feet */}
            <ellipse cx="80" cy="180" rx="12" ry="6" fill="#f59e0b" />
            <ellipse cx="120" cy="180" rx="12" ry="6" fill="#f59e0b" />
          </svg>
        </motion.div>

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
