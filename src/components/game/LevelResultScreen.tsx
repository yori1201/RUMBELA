"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Star, Crown, Gift, GraduationCap, RotateCcw, ChevronRight, Sparkles, Heart } from "lucide-react"
import type { LevelNode } from "@/lib/game-data"
import { PETS } from "@/lib/game-data"
import { soundManager } from "@/lib/sound"
import { useEffect, useRef } from "react"

interface LevelResultScreenProps {
  level: LevelNode
  score: number
  stars: number
  isNewBest: boolean
  unlockedPet: string | null
  unlockedNext: boolean
  onContinue: () => void
  onRetry: () => void
  onExit: () => void
}

export default function LevelResultScreen({
  level,
  score,
  stars,
  isNewBest,
  unlockedPet,
  unlockedNext,
  onContinue,
  onRetry,
  onExit,
}: LevelResultScreenProps) {
  const playedSoundRef = useRef(false)

  useEffect(() => {
    if (playedSoundRef.current) return
    playedSoundRef.current = true
    if (stars >= 3) {
      soundManager.play("win")
    } else if (stars > 0) {
      soundManager.play("achievement")
    } else {
      soundManager.play("lose")
    }
    if (unlockedPet) {
      setTimeout(() => soundManager.play("achievement"), 1500)
    }
  }, [stars, unlockedPet])

  const passed = stars > 0
  const isPerfect = stars === 3

  const typeConfig = {
    normal: { color: "#1cb0f6" },
    boss: { color: "#ff9600" },
    bonus: { color: "#ce82ff" },
    "final-exam": { color: "#58cc02" },
  }
  const cfg = typeConfig[level.type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header with stars animation */}
        <div
          className="relative p-6 text-center text-white"
          style={{
            background: passed
              ? `linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)`
              : "linear-gradient(135deg, #777777, #4b4b4b)",
          }}
        >
          {/* Mascot */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto mb-3"
          >
            <img
              src="/rumbela/mascot-bela-animated.webp"
              alt="Bela"
              className={`mx-auto h-24 w-24 object-contain ${passed ? "" : "grayscale opacity-70"}`}
              draggable={false}
            />
          </motion.div>

          {/* Stars */}
          <div className="mb-2 flex justify-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: i < stars ? 1 : 0.5,
                  rotate: 0,
                  opacity: i < stars ? 1 : 0.3,
                }}
                transition={{
                  delay: 0.5 + i * 0.3,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                <Star
                  className={`h-10 w-10 ${i < stars ? "fill-[#ffc800] text-[#ffc800] drop-shadow-lg" : "fill-white/30 text-white/30"}`}
                />
              </motion.div>
            ))}
          </div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black"
          >
            {isPerfect ? "SEMPURNA! 🎉" : passed ? "HEBAT! 👍" : "COBA LAGI 😅"}
          </motion.h2>
          <p className="mt-1 text-xs opacity-90">{level.title}</p>
        </div>

        {/* Body */}
        <div className="space-y-3 p-5">
          {/* Score display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-gradient-to-br from-[#fff5cc] to-[#ffe8cc] p-4 text-center ring-1 ring-[#ffc800]/30"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#998400]">
              Skor
            </p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="text-4xl font-black text-[#ffc800]"
            >
              {score}
            </motion.p>
            {isNewBest && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-1 text-xs font-bold text-[#58cc02]"
              >
                ✨ Skor Terbaik Baru!
              </motion.p>
            )}
          </motion.div>

          {/* Pet unlock celebration */}
          <AnimatePresence>
            {unlockedPet && PETS[unlockedPet as keyof typeof PETS] && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                className="rounded-2xl bg-gradient-to-r from-[#f0e1ff] to-[#ddf4ff] p-4 ring-2 ring-[#ce82ff]"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: 2 }}
                    className="text-5xl"
                  >
                    {PETS[unlockedPet as keyof typeof PETS].emoji}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-[#9b4ddb]">
                      🎁 Hewan Baru Terbuka!
                    </p>
                    <p className="text-base font-black text-[#4b4b4b]">
                      {PETS[unlockedPet as keyof typeof PETS].name}
                    </p>
                    <p className="text-xs text-[#777777]">
                      {PETS[unlockedPet as keyof typeof PETS].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next level unlocked */}
          {unlockedNext && passed && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2 }}
              className="flex items-center gap-3 rounded-2xl bg-[#d7ffb8] p-3 ring-1 ring-[#58cc02]/30"
            >
              <Sparkles className="h-5 w-5 text-[#58cc02]" />
              <p className="text-sm font-bold text-[#58a700]">
                Level berikutnya terbuka!
              </p>
            </motion.div>
          )}

          {/* Mascot message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="rounded-2xl bg-[#f7f7f7] p-3"
          >
            <p className="text-xs italic text-[#777777]">
              {isPerfect
                ? `🌟 ${level.outro}`
                : passed
                ? `👍 ${level.outro}`
                : "Jangan menyerah! Coba lagi yuk, kamu pasti bisa! 💪"}
            </p>
          </motion.div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                soundManager.play("click")
                onExit()
              }}
              className="rounded-xl bg-white py-3 text-sm font-extrabold uppercase tracking-wide text-[#777777] border-2 border-[#e5e5e5] shadow-[0_3px_0_#e5e5e5] active:translate-y-0.5 active:shadow-[0_1px_0_#e5e5e5] transition-all"
            >
              Keluar
            </button>
            <button
              onClick={() => {
                soundManager.play("click")
                onRetry()
              }}
              className="rounded-xl bg-[#1cb0f6] py-3 text-sm font-extrabold uppercase tracking-wide text-white border-2 border-[#1899d6] shadow-[0_3px_0_#1899d6] active:translate-y-0.5 active:shadow-[0_1px_0_#1899d6] transition-all flex items-center justify-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Ulang
            </button>
          </div>

          {/* Continue button (only if passed & next unlocked) */}
          {passed && unlockedNext && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              onClick={() => {
                soundManager.play("select")
                onContinue()
              }}
              className="w-full rounded-xl bg-[#58cc02] py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_#58a700] border-2 border-[#58a700] active:translate-y-0.5 active:shadow-[0_2px_0_#58a700] transition-all flex items-center justify-center gap-2"
            >
              Lanjut ke Level Berikutnya
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}

          {/* Grand finale: rumbela-school completed */}
          {passed && level.id === "rumbela-final" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5 }}
              className="rounded-2xl bg-gradient-to-r from-[#ffc800] via-[#ff9600] to-[#ff4b4b] p-4 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-4xl"
              >
                🏆
              </motion.div>
              <p className="mt-2 text-sm font-black text-white">
                SELAMAT! Kamu Wisuda dari Rumbela!
              </p>
              <p className="text-xs text-white/90">
                Kamu adalah juara sejati Bahasa Inggris!
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
