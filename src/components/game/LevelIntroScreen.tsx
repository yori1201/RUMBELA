"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Star, Crown, Gift, GraduationCap, ChevronRight, Zap } from "lucide-react"
import type { LevelNode } from "@/lib/game-data"
import { soundManager } from "@/lib/sound"

interface LevelIntroScreenProps {
  level: LevelNode
  onStart: () => void
  onCancel: () => void
}

export default function LevelIntroScreen({ level, onStart, onCancel }: LevelIntroScreenProps) {
  const typeConfig = {
    normal: { icon: <Star className="h-6 w-6" />, label: "Level Normal", color: "#1cb0f6", bg: "#ddf4ff" },
    boss: { icon: <Crown className="h-6 w-6" />, label: "Boss Level", color: "#ff9600", bg: "#ffe8cc" },
    bonus: { icon: <Gift className="h-6 w-6" />, label: "Bonus Stage", color: "#ce82ff", bg: "#f0e1ff" },
    "final-exam": { icon: <GraduationCap className="h-6 w-6" />, label: "Final Exam", color: "#58cc02", bg: "#d7ffb8" },
  }
  const cfg = typeConfig[level.type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Header banner */}
        <div
          className="relative p-6 text-center text-white"
          style={{ backgroundColor: cfg.color }}
        >
          {/* Mascot flying in */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="mx-auto mb-2"
          >
            <img
              src="/rumbela/mascot-bela-animated.webp"
              alt="Bela"
              className="mx-auto h-20 w-20 object-contain"
              draggable={false}
            />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.4 }}
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20"
          >
            {cfg.icon}
          </motion.div>

          <p className="text-xs font-bold uppercase tracking-widest opacity-90">
            {cfg.label}
          </p>
          <h2 className="mt-1 text-2xl font-black">{level.title}</h2>
          <p className="mt-1 text-xs opacity-90">
            {level.worldName} · Level {level.levelNumber}
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          {/* Description */}
          <div className="rounded-2xl bg-[#f7f7f7] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#777777]">
              Materi
            </p>
            <p className="mt-1 text-sm font-bold text-[#4b4b4b]">
              {level.description}
            </p>
          </div>

          {/* Story intro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: cfg.bg }}
          >
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg.color }}>
              📖 Cerita
            </p>
            <p className="mt-1 text-sm text-[#4b4b4b] leading-relaxed">
              {level.intro}
            </p>
          </motion.div>

          {/* Level stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Soal" value={`${level.questionsCount}`} icon="❓" />
            <StatCard label="Level" value={level.difficulty === "beginner" ? "Mudah" : level.difficulty === "intermediate" ? "Sedang" : "Sulit"} icon="⚡" />
            <StatCard label="Bintang" value="3⭐" icon="⭐" />
          </div>

          {/* Star thresholds */}
          <div className="rounded-2xl border-2 border-[#e5e5e5] p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#777777]">
              Hadiah Bintang
            </p>
            <div className="space-y-1.5">
              <ThresholdRow stars={1} score={level.starThresholds.one} />
              <ThresholdRow stars={2} score={level.starThresholds.two} />
              <ThresholdRow stars={3} score={level.starThresholds.three} />
            </div>
          </div>

          {/* Pet reward notice */}
          {level.petReward && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#f0e1ff] to-[#ddf4ff] p-3 ring-1 ring-[#ce82ff]/30"
            >
              <div className="text-3xl">
                {/* Show pet emoji preview */}
                {level.petReward === "cat" ? "🐱" :
                  level.petReward === "dog" ? "🐶" :
                  level.petReward === "rabbit" ? "🐰" :
                  level.petReward === "bird" ? "🐦" :
                  level.petReward === "hamster" ? "🐹" : "🎁"}
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#9b4ddb]">
                  🎁 Reward Spesial
                </p>
                <p className="text-xs text-[#777777]">
                  Selesaikan level untuk unlock hewan peliharaan baru!
                </p>
              </div>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                soundManager.play("click")
                onCancel()
              }}
              className="flex-1 rounded-xl bg-white py-3 text-sm font-extrabold uppercase tracking-wide text-[#777777] border-2 border-[#e5e5e5] shadow-[0_3px_0_#e5e5e5] active:translate-y-0.5 active:shadow-[0_1px_0_#e5e5e5] transition-all"
            >
              Nanti
            </button>
            <button
              onClick={() => {
                soundManager.play("select")
                onStart()
              }}
              className="flex-[2] rounded-xl py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_#58a700] border-2 border-[#58a700] active:translate-y-0.5 active:shadow-[0_2px_0_#58a700] transition-all flex items-center justify-center gap-1"
              style={{ backgroundColor: cfg.color }}
            >
              <Zap className="h-4 w-4" />
              Mulai Level
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl bg-[#f7f7f7] p-2 text-center">
      <div className="text-base">{icon}</div>
      <p className="text-[9px] font-bold uppercase text-[#777777]">{label}</p>
      <p className="text-sm font-black text-[#4b4b4b]">{value}</p>
    </div>
  )
}

function ThresholdRow({ stars, score }: { stars: number; score: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < stars ? "fill-[#ffc800] text-[#ffc800]" : "fill-[#e5e5e5] text-[#e5e5e5]"}`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-[#777777]">≥ {score} poin</span>
    </div>
  )
}
