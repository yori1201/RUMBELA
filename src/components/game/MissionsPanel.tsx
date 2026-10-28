"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Target, Gift, Sparkles, Check, ChevronRight } from "lucide-react"
import {
  MAIN_MISSIONS,
  getDailyMissions,
  getMissionColorClass,
  type Mission,
} from "@/lib/game-data"
import {
  useGameStore,
  isMissionClaimed,
  isMissionComplete,
  getMissionProgress,
} from "@/lib/game-store"
import { soundManager } from "@/lib/sound"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MissionsPanelProps {
  onClose?: () => void
  onMissionClaimed?: (mission: Mission, reward: number) => void
}

export default function MissionsPanel({ onClose, onMissionClaimed }: MissionsPanelProps) {
  const { stats, claimMissionReward, getMissionContext } = useGameStore()
  const [tab, setTab] = useState<"daily" | "main">("daily")
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const ctx = getMissionContext()
  const dailyMissions = getDailyMissions()

  const missions = tab === "daily" ? dailyMissions : MAIN_MISSIONS

  const handleClaim = (mission: Mission) => {
    setClaimingId(mission.id)
    soundManager.play("achievement")
    const reward = claimMissionReward(mission.id)
    if (reward > 0) {
      onMissionClaimed?.(mission, reward)
    }
    setTimeout(() => setClaimingId(null), 1000)
  }

  return (
    <div className="space-y-4">
      {/* Header with tabs */}
      <div className="flex items-center gap-2">
        <div className="flex-1 grid grid-cols-2 gap-1 rounded-2xl bg-[#f7f7f7] p-1">
          <button
            onClick={() => {
              soundManager.play("click")
              setTab("daily")
            }}
            className={`py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-all ${
              tab === "daily"
                ? "bg-white text-[#58a700] shadow-sm"
                : "text-[#afafaf] hover:text-[#777777]"
            }`}
          >
            ☀️ Harian
          </button>
          <button
            onClick={() => {
              soundManager.play("click")
              setTab("main")
            }}
            className={`py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wide transition-all ${
              tab === "main"
                ? "bg-white text-[#58a700] shadow-sm"
                : "text-[#afafaf] hover:text-[#777777]"
            }`}
          >
            ⭐ Utama
          </button>
        </div>
      </div>

      {/* Missions list */}
      <ScrollArea className="max-h-[60vh] pr-2">
        <div className="space-y-3">
          {missions.map((mission) => {
            const progress = getMissionProgress(mission, ctx, stats)
            const isComplete = isMissionComplete(mission, ctx, stats)
            const isClaimed = isMissionClaimed(mission, stats.claimedMissionIds)
            const colors = getMissionColorClass(mission.color)
            const progressPct = Math.min(100, (progress / mission.target) * 100)

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-2xl border-2 p-4 ${
                  isClaimed
                    ? "border-[#e5e5e5] bg-[#f7f7f7] opacity-70"
                    : isComplete
                    ? `${colors.border} ${colors.bg} animate-bounce-in`
                    : "border-[#e5e5e5] bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${colors.bg} ${colors.border} border-2`}>
                    {isClaimed ? "✅" : mission.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`font-extrabold leading-tight ${isClaimed ? "text-[#afafaf]" : colors.text}`}>
                          {mission.title}
                        </h3>
                        <p className="text-xs text-[#777777] leading-snug">
                          {mission.description}
                        </p>
                      </div>
                      {/* Reward badge */}
                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff5cc] px-2 py-1 text-[10px] font-extrabold text-[#998400]">
                        <Sparkles className="h-3 w-3" />
                        +{mission.reward}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#777777]">
                        <span>
                          {progress} / {mission.target}
                        </span>
                        {isComplete && !isClaimed && (
                          <span className={`${colors.text} animate-pop`}>SIAP DIKLAIM! 🎉</span>
                        )}
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
                        <motion.div
                          className={`h-full rounded-full ${
                            isComplete ? "bg-[#58cc02]" : "bg-[#1cb0f6]"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        />
                      </div>
                    </div>

                    {/* Claim button */}
                    {isComplete && !isClaimed && (
                      <Button
                        onClick={() => handleClaim(mission)}
                        disabled={claimingId === mission.id}
                        className="mt-2 w-full bg-[#58cc02] text-white shadow-[0_4px_0_#58a700] border-2 border-[#58a700] hover:bg-[#58cc02] hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_#58a700] uppercase tracking-wide font-extrabold text-xs h-9 rounded-xl"
                      >
                        {claimingId === mission.id ? (
                          <>✓ Diklaim!</>
                        ) : (
                          <>
                            <Gift className="mr-1 h-3.5 w-3.5" /> Klaim Hadiah (+{mission.reward})
                          </>
                        )}
                      </Button>
                    )}

                    {isClaimed && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs font-bold text-[#afafaf]">
                        <Check className="h-3.5 w-3.5" /> Selesai & Sudah Diklaim
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
