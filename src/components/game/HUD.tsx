"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Heart, Star, Flame, Clock, Trophy } from "lucide-react"

interface HUDProps {
  score: number
  lives: number
  maxLives: number
  streak: number
  questionNumber: number
  totalQuestions: number
  timeLeft?: number
  maxTime?: number
}

export default function HUD({
  score,
  lives,
  maxLives,
  streak,
  questionNumber,
  totalQuestions,
  timeLeft,
  maxTime,
}: HUDProps) {
  const progress = (questionNumber / totalQuestions) * 100
  const timeProgress =
    timeLeft !== undefined && maxTime ? (timeLeft / maxTime) * 100 : 100
  const timeUrgent = timeLeft !== undefined && timeLeft <= 5

  return (
    <div className="w-full space-y-3">
      {/* Top row: lives, score, streak */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Lives */}
        <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          {Array.from({ length: maxLives }).map((_, i) => (
            <motion.div
              key={i}
              animate={
                i < lives
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.8, opacity: 0.3 }
              }
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Heart
                className={`h-4 w-4 ${
                  i < lives ? "fill-rose-500 text-rose-500" : "text-slate-300"
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Score */}
        <motion.div
          key={score}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700 shadow-sm"
        >
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
          {score.toLocaleString()}
        </motion.div>

        {/* Streak */}
        <AnimatePresence>
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-700 shadow-sm"
            >
              <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
              {streak}x
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>
            Soal {questionNumber} / {totalQuestions}
          </span>
          {timeLeft !== undefined && (
            <span
              className={`flex items-center gap-1 ${
                timeUrgent ? "text-rose-600" : ""
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {timeLeft}s
            </span>
          )}
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/60 shadow-inner">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
        {timeLeft !== undefined && maxTime && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/40">
            <motion.div
              className={`h-full rounded-full ${
                timeUrgent
                  ? "bg-gradient-to-r from-rose-500 to-red-600"
                  : "bg-gradient-to-r from-amber-400 to-orange-500"
              }`}
              animate={{ width: `${timeProgress}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
