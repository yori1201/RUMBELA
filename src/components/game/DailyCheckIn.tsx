"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Flame, Gift, Calendar, Check, Sparkles } from "lucide-react"
import { useGameStore } from "@/lib/game-store"
import { soundManager } from "@/lib/sound"

interface DailyCheckInProps {
  onClaim?: (reward: number) => void
}

export default function DailyCheckIn({ onClaim }: DailyCheckInProps) {
  const { stats, canCheckInToday, claimDailyCheckIn } = useGameStore()
  const [claiming, setClaiming] = useState(false)
  const [claimedReward, setClaimedReward] = useState<number | null>(null)

  const canCheckIn = canCheckInToday()
  const today = new Date()
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  // Calculate last 7 days for visualization
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const dayName = dayNames[d.getDay()]
    const isToday = i === 6
    const isYesterday = i === 5
    // Check if check-in happened that day (we only have lastCheckInDate which is single value)
    // So we'll show: claimed if that date was before today, or today's status
    return {
      dayName,
      dateKey,
      isToday,
      isYesterday,
      isFuture: false,
    }
  })

  const handleClaim = () => {
    if (!canCheckIn || claiming) return
    setClaiming(true)
    soundManager.play("achievement")
    const result = claimDailyCheckIn()
    if (result.reward > 0) {
      setClaimedReward(result.reward)
      onClaim?.(result.reward)
      setTimeout(() => {
        soundManager.play("win")
      }, 300)
    }
    setTimeout(() => setClaiming(false), 1200)
  }

  // Calculate next reward preview
  const nextRewardStreak = stats.dailyStreak + 1
  const nextReward = 20 + Math.min(nextRewardStreak * 5, 50)

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#fff5cc] via-[#ffe8cc] to-[#ddf4ff] p-4 ring-1 ring-[#ffc800]/30">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffc800] text-white shadow-[0_2px_0_#998400]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#998400]">
              Daily Check-In
            </h3>
            <p className="text-[10px] font-semibold text-[#777777]">
              Klaim bonus harian setiap hari!
            </p>
          </div>
        </div>
        {/* Current streak */}
        <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-sm">
          <Flame className="h-3.5 w-3.5 fill-[#ff9600] text-[#ff9600]" />
          <span className="text-xs font-black text-[#cc7a00]">{stats.dailyStreak}</span>
          <span className="text-[10px] font-bold text-[#777777]">hari</span>
        </div>
      </div>

      {/* 7-day visualization */}
      <div className="mb-3 grid grid-cols-7 gap-1">
        {last7Days.map((day, idx) => {
          // Simplified: mark days based on streak
          // Days within streak range are "claimed"
          const daysAgo = 6 - idx
          const isInStreak = daysAgo < stats.dailyStreak
          return (
            <div
              key={idx}
              className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${
                day.isToday
                  ? "bg-white ring-2 ring-[#58cc02]"
                  : isInStreak
                  ? "bg-white/70"
                  : "bg-white/30"
              }`}
            >
              <span className="text-[9px] font-bold uppercase text-[#777777]">
                {day.dayName}
              </span>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  day.isToday
                    ? canCheckIn
                      ? "bg-[#ffc800] text-white animate-pulse"
                      : "bg-[#58cc02] text-white"
                    : isInStreak
                    ? "bg-[#58cc02] text-white"
                    : "bg-[#e5e5e5] text-[#afafaf]"
                }`}
              >
                {day.isToday && canCheckIn ? (
                  <Sparkles className="h-3 w-3" />
                ) : day.isToday || isInStreak ? (
                  <Check className="h-3 w-3" />
                ) : (
                  "·"
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Claim button or status */}
      <AnimatePresence mode="wait">
        {canCheckIn ? (
          <motion.button
            key="claim"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClaim}
            disabled={claiming}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffc800] py-2.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_#998400] border-2 border-[#998400] active:translate-y-0.5 active:shadow-[0_2px_0_#998400] disabled:opacity-50 transition-all"
          >
            {claiming ? (
              <>
                <Check className="h-4 w-4" /> Diklaim!
              </>
            ) : (
              <>
                <Gift className="h-4 w-4" />
                Klaim Bonus Hari Ini (+{nextReward})
              </>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="claimed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d7ffb8] py-2.5 text-sm font-extrabold uppercase tracking-wide text-[#58a700] border-2 border-[#58cc02]"
          >
            <Check className="h-4 w-4" /> Sudah Check-in Hari Ini
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward info */}
      <p className="mt-2 text-center text-[10px] font-semibold text-[#777777]">
        {canCheckIn
          ? `Bonus besok: +${20 + Math.min((stats.dailyStreak + 2) * 5, 50)} (kalau konsisten)`
          : `Streak terpanjang: ${stats.longestStreak} hari 🔥`}
      </p>

      {/* Success animation */}
      <AnimatePresence>
        {claimedReward !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="rounded-2xl bg-white px-6 py-4 shadow-2xl ring-4 ring-[#ffc800]/40">
              <div className="text-center">
                <div className="text-4xl">🎉</div>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#998400]">
                  Bonus Diterima!
                </p>
                <p className="text-2xl font-black text-[#58cc02]">+{claimedReward}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
