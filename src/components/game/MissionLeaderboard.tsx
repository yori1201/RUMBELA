"use client"

import { motion } from "framer-motion"
import { Trophy, Crown, Medal, Award } from "lucide-react"
import { useGameStore } from "@/lib/game-store"

export default function MissionLeaderboard() {
  const { leaderboard, stats, playerName } = useGameStore()

  // Show top 10
  const topPlayers = leaderboard.slice(0, 10)

  // Find player's rank
  const playerRank = leaderboard.findIndex((e) => e.name === playerName) + 1

  if (topPlayers.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5]">
        <Trophy className="mx-auto mb-2 h-10 w-10 text-[#ffc800]" />
        <p className="text-sm font-bold uppercase tracking-wide text-[#777777]">
          Belum ada skor
        </p>
        <p className="mt-1 text-xs text-[#afafaf]">
          Mainkan game untuk masuk leaderboard!
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#ffc800]" />
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#4b4b4b]">
            Papan Skor Tertinggi
          </h3>
        </div>
        {playerRank > 0 && playerRank <= 50 && (
          <div className="rounded-full bg-[#d7ffb8] px-2.5 py-1 text-xs font-extrabold text-[#58a700]">
            Kamu: #{playerRank}
          </div>
        )}
      </div>

      {/* Top 3 podium (special cards) */}
      {topPlayers.length >= 3 && (
        <div className="mb-3 grid grid-cols-3 gap-1.5">
          {/* 2nd place */}
          <PodiumCard
            entry={topPlayers[1]}
            rank={2}
            color="silver"
          />
          {/* 1st place - center, taller */}
          <PodiumCard
            entry={topPlayers[0]}
            rank={1}
            color="gold"
            isTop
          />
          {/* 3rd place */}
          <PodiumCard
            entry={topPlayers[2]}
            rank={3}
            color="bronze"
          />
        </div>
      )}

      {/* Rest of top 10 (or all if <3) */}
      <div className="space-y-1.5">
        {topPlayers.slice(3).map((entry, idx) => {
          const rank = idx + 4
          const isPlayer = entry.name === playerName
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                isPlayer
                  ? "bg-[#d7ffb8] ring-1 ring-[#58cc02]"
                  : "bg-[#f7f7f7]"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#777777]">
                {rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#4b4b4b]">
                  {entry.name} {isPlayer && "(Kamu)"}
                </p>
                <p className="text-[10px] text-[#afafaf]">
                  {entry.accuracy}% benar · {entry.difficulty}
                </p>
              </div>
              <span className="text-sm font-black text-[#58cc02]">
                {entry.score}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Player's stats summary */}
      <div className="mt-3 rounded-xl bg-gradient-to-r from-[#d7ffb8] to-[#ddf4ff] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#777777]">
              Total Skor Kamu
            </p>
            <p className="text-xl font-black text-[#58cc02]">
              {stats.totalScore.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#777777]">
              Peringkat
            </p>
            <p className="text-xl font-black text-[#1cb0f6]">
              {playerRank > 0 ? `#${playerRank}` : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PodiumCard({
  entry,
  rank,
  color,
  isTop = false,
}: {
  entry: { id: string; name: string; score: number; accuracy: number; difficulty: string }
  rank: number
  color: "gold" | "silver" | "bronze"
  isTop?: boolean
}) {
  const colorMap = {
    gold: { bg: "from-[#ffc800] to-[#ff9600]", text: "#998400", icon: <Crown className="h-4 w-4" /> },
    silver: { bg: "from-[#afafaf] to-[#777777]", text: "#4b4b4b", icon: <Medal className="h-4 w-4" /> },
    bronze: { bg: "from-[#cd7f32] to-[#8b4513]", text: "#ffffff", icon: <Award className="h-4 w-4" /> },
  }
  const c = colorMap[color]

  return (
    <div
      className={`flex flex-col items-center rounded-xl bg-gradient-to-b ${c.bg} p-2 ${
        isTop ? "scale-105 shadow-lg" : ""
      }`}
    >
      <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-white`}>
        {c.icon}
      </div>
      <p className="mt-1 max-w-full truncate text-[10px] font-extrabold uppercase text-white">
        {entry.name}
      </p>
      <p className="text-sm font-black text-white">{entry.score}</p>
      <p className="text-[8px] font-bold uppercase text-white/80">
        {entry.accuracy}%
      </p>
    </div>
  )
}
