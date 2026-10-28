"use client"

import { motion } from "framer-motion"
import { Target, Gift } from "lucide-react"
import {
  MAIN_MISSIONS,
  getDailyMissions,
} from "@/lib/game-data"
import {
  useGameStore,
  isMissionClaimed,
  isMissionComplete,
} from "@/lib/game-store"

interface MissionBadgeProps {
  onClick: () => void
}

export default function MissionBadge({ onClick }: MissionBadgeProps) {
  const { stats, getMissionContext } = useGameStore()
  const ctx = getMissionContext()
  const dailyMissions = getDailyMissions()

  // Count claimable missions (complete but not claimed)
  const allMissions = [...dailyMissions, ...MAIN_MISSIONS]
  let claimableCount = 0
  for (const mission of allMissions) {
    const isComplete = isMissionComplete(mission, ctx, stats)
    const isClaimed = isMissionClaimed(mission, stats.claimedMissionIds)
    if (isComplete && !isClaimed) {
      claimableCount++
    }
  }

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#58a700] shadow-[0_2px_0_#e5e5e5] border-2 border-[#e5e5e5] hover:bg-[#f7f7f7] active:translate-y-0.5 active:shadow-[0_0_0_#e5e5e5] transition-all"
    >
      <Target className="h-4 w-4" />
      <span className="hidden sm:inline">Misi</span>

      {/* Claimable indicator */}
      {claimableCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4b4b] text-[10px] font-black text-white shadow-md ring-2 ring-white"
        >
          {claimableCount}
        </motion.span>
      )}

      {/* Gift icon when claimable */}
      {claimableCount > 0 && (
        <motion.span
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="ml-0.5"
        >
          <Gift className="h-3.5 w-3.5 text-[#ffc800]" />
        </motion.span>
      )}
    </button>
  )
}
