"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Home, RotateCcw, Star, Flame, Target, Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { soundManager } from "@/lib/sound"
import {
  CATEGORIES,
  DIFFICULTIES,
  getMissionColorClass,
  type Achievement,
  type CategoryId,
  type Difficulty,
  type Mission,
} from "@/lib/game-data"
import Mascot from "./Mascot"
import { useEffect, useRef } from "react"

interface ResultScreenProps {
  result: {
    score: number
    correct: number
    total: number
    maxStreak: number
  }
  category: CategoryId
  difficulty: Difficulty
  mode: string
  playerName: string
  newAchievements: Achievement[]
  rank: number
  completedMissions?: Mission[]
  onPlayAgain: () => void
  onHome: () => void
}

const MODE_LABELS: Record<string, string> = {
  quiz: "Quiz Challenge",
  match: "Word Match",
  "fill-blank": "Fill the Blank",
  spell: "Spell Master",
}

export default function ResultScreen({
  result,
  category,
  difficulty,
  mode,
  playerName,
  newAchievements,
  rank,
  completedMissions = [],
  onPlayAgain,
  onHome,
}: ResultScreenProps) {
  const accuracy = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0
  const isPerfect = accuracy === 100
  const isPassing = accuracy >= 60

  const catInfo = CATEGORIES.find((c) => c.id === category)
  const diffInfo = DIFFICULTIES.find((d) => d.id === difficulty)

  const playWinSound = useRef(false)
  useEffect(() => {
    if (!playWinSound.current) {
      playWinSound.current = true
      if (isPerfect || isPassing) {
        soundManager.play("win")
      } else {
        soundManager.play("lose")
      }
      if (newAchievements.length > 0) {
        setTimeout(() => soundManager.play("achievement"), 1200)
      }
      if (completedMissions.length > 0) {
        setTimeout(() => soundManager.play("achievement"), 1800)
      }
    }
  }, [isPerfect, isPassing, newAchievements.length, completedMissions.length])

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100"
        >
          <div
            className={`bg-gradient-to-br p-6 text-center text-white ${
              isPerfect
                ? "from-amber-400 via-orange-500 to-rose-500"
                : isPassing
                ? "from-emerald-400 via-teal-500 to-cyan-500"
                : "from-slate-400 to-slate-500"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
            >
              {isPerfect ? (
                <Trophy className="h-9 w-9" />
              ) : isPassing ? (
                <Star className="h-9 w-9 fill-white" />
              ) : (
                <Target className="h-9 w-9" />
              )}
            </motion.div>
            <h1 className="text-2xl font-black sm:text-3xl">
              {isPerfect
                ? "🎉 SEMPURNA!"
                : isPassing
                ? "👍 Kerja Bagus!"
                : "😅 Tetap Semangat!"}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {playerName ? `${playerName}, ` : ""}kamu menyelesaikan {MODE_LABELS[mode] || "game"}
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-7">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 text-center ring-1 ring-amber-100">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Total Skor
              </p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-4xl font-black text-amber-700 sm:text-5xl"
              >
                {result.score.toLocaleString()}
              </motion.p>
              {rank > 0 && rank <= 10 && (
                <p className="mt-1 text-xs font-bold text-amber-600">
                  🏆 Peringkat #{rank} di leaderboard!
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-100">
                <Target className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700">Benar</p>
                <p className="text-lg font-black text-emerald-700">
                  {result.correct}/{result.total}
                </p>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 text-center ring-1 ring-orange-100">
                <Flame className="mx-auto mb-1 h-5 w-5 text-orange-600" />
                <p className="text-xs font-semibold text-orange-700">Streak</p>
                <p className="text-lg font-black text-orange-700">{result.maxStreak}x</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3 text-center ring-1 ring-purple-100">
                <Star className="mx-auto mb-1 h-5 w-5 text-purple-600" />
                <p className="text-xs font-semibold text-purple-700">Akurasi</p>
                <p className="text-lg font-black text-purple-700">{accuracy}%</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                {catInfo?.icon} {catInfo?.name}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                {diffInfo?.icon} {diffInfo?.name}
              </span>
            </div>

            <AnimatePresence>
              {newAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 ring-1 ring-purple-200"
                >
                  <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-purple-700">
                    🎖️ Achievement Baru!
                  </p>
                  <div className="space-y-2">
                    {newAchievements.map((ach: Achievement) => (
                      <motion.div
                        key={ach.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.7 }}
                        className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                      >
                        <span className="text-3xl">{ach.icon}</span>
                        <div>
                          <p className="font-bold text-purple-700">{ach.name}</p>
                          <p className="text-xs text-slate-500">{ach.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completed Missions */}
            <AnimatePresence>
              {completedMissions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-2xl bg-gradient-to-br from-[#d7ffb8] to-[#ddf4ff] p-4 ring-1 ring-[#58cc02]/30"
                >
                  <p className="mb-2 text-center text-xs font-extrabold uppercase tracking-wider text-[#58a700]">
                    🎯 Misi Selesai! Klaim di Halaman Utama
                  </p>
                  <div className="space-y-2">
                    {completedMissions.map((mission: Mission, idx) => {
                      const colors = getMissionColorClass(mission.color)
                      return (
                        <motion.div
                          key={mission.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.7 + idx * 0.1 }}
                          className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ${colors.border} border-2`}
                        >
                          <span className="text-3xl">{mission.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className={`font-extrabold ${colors.text}`}>{mission.title}</p>
                            <p className="text-xs text-[#777777]">{mission.description}</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-[#fff5cc] px-2.5 py-1 text-xs font-extrabold text-[#998400]">
                            <Sparkles className="h-3 w-3" />
                            +{mission.reward}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-center text-[10px] font-bold text-[#777777]">
                    💡 Klik tombol "Misi" di halaman utama untuk klaim hadiah
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-center pt-2">
              <Mascot
                mood={isPerfect ? "celebrating" : isPassing ? "happy" : "sad"}
                size={90}
                message={
                  isPerfect
                    ? "Luar biasa! Kamu juara sejati!"
                    : isPassing
                    ? "Kerja bagus! Terus berlatih ya!"
                    : "Jangan menyerah, coba lagi yuk!"
                }
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  soundManager.play("click")
                  onPlayAgain()
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                size="lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Main Lagi
              </Button>
              <Button
                onClick={() => {
                  soundManager.play("click")
                  onHome()
                }}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" /> Halaman Utama
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
