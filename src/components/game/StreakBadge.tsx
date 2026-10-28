"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { useGameStore } from "@/lib/game-store"

export default function StreakBadge() {
  const { stats } = useGameStore()

  if (stats.dailyStreak === 0) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff9600] to-[#ffc800] px-3 py-1.5 shadow-[0_2px_0_#cc7a00] border-2 border-[#cc7a00]"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <Flame className="h-4 w-4 fill-white text-white" />
      </motion.div>
      <span className="text-xs font-black text-white">
        {stats.dailyStreak}
      </span>
      <span className="text-[10px] font-bold uppercase text-white/90">
        hari
      </span>

      {/* Pulse effect for high streak */}
      {stats.dailyStreak >= 3 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 0 0 rgba(255, 150, 0, 0.5)" }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(255, 150, 0, 0.5)",
              "0 0 0 8px rgba(255, 150, 0, 0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}
