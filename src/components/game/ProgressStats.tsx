"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { TrendingUp, Target, Star, Flame, Award, BookOpen } from "lucide-react"
import { useGameStore, type DayHistoryEntry } from "@/lib/game-store"
import { CATEGORIES } from "@/lib/game-data"

type ChartMetric = "score" | "gamesPlayed" | "correct" | "maxStreak"

const METRICS: { id: ChartMetric; label: string; icon: string; color: string }[] = [
  { id: "score", label: "Skor", icon: "⭐", color: "#ffc800" },
  { id: "gamesPlayed", label: "Game", icon: "🎮", color: "#1cb0f6" },
  { id: "correct", label: "Benar", icon: "✅", color: "#58cc02" },
  { id: "maxStreak", label: "Streak", icon: "🔥", color: "#ff9600" },
]

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export default function ProgressStats() {
  const { stats, unlockedAchievements } = useGameStore()
  const [activeMetric, setActiveMetric] = useState<ChartMetric>("score")

  // Build last 7 days data (fill missing days with zero)
  const last7Days: DayHistoryEntry[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const existing = stats.history7Days.find((h) => h.date === dateKey)
    return (
      existing || {
        date: dateKey,
        gamesPlayed: 0,
        correct: 0,
        score: 0,
        maxStreak: 0,
        perfectGames: 0,
        categoriesPlayed: [],
      }
    )
  })

  // Calculate max value for active metric (for bar height scaling)
  const maxValue = Math.max(...last7Days.map((d) => d[activeMetric] as number), 1)

  // Today's stats
  const today = last7Days[6]
  const todayMetric = today[activeMetric] as number

  // Week totals
  const weekTotal = last7Days.reduce((sum, d) => sum + (d[activeMetric] as number), 0)

  // Accuracy calculation (overall)
  const accuracy = stats.totalGamesPlayed > 0
    ? Math.round((stats.totalCorrect / (stats.totalGamesPlayed * 8)) * 100) // approximate avg 8 questions per game
    : 0

  // Today's accuracy
  const todayAccuracy = today.gamesPlayed > 0
    ? Math.round((today.correct / (today.gamesPlayed * 8)) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Top stats cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard
          icon={<Star className="h-4 w-4" />}
          label="Total Skor"
          value={stats.totalScore.toLocaleString()}
          color="bee"
        />
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Game Main"
          value={stats.totalGamesPlayed.toString()}
          color="macaw"
        />
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Streak Harian"
          value={`${stats.dailyStreak} hari`}
          color="fox"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Achievement"
          value={`${unlockedAchievements.length}/8`}
          color="beetle"
        />
      </div>

      {/* Chart card */}
      <div className="rounded-2xl bg-white p-4 shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5]">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#58cc02]" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#4b4b4b]">
              Progres 7 Hari
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-[#afafaf] uppercase">Total Minggu Ini</p>
            <p className="text-sm font-black text-[#58cc02]">{weekTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Metric tabs */}
        <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-[#f7f7f7] p-1">
          {METRICS.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-bold uppercase transition-all ${
                activeMetric === m.id
                  ? "bg-white shadow-sm"
                  : "text-[#afafaf] hover:text-[#777777]"
              }`}
              style={activeMetric === m.id ? { color: m.color } : {}}
            >
              <span className="text-base">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Bar chart */}
        <div className="flex h-32 items-end justify-between gap-2">
          {last7Days.map((day, idx) => {
            const value = day[activeMetric] as number
            const heightPct = (value / maxValue) * 100
            const isToday = idx === 6
            const d = new Date(day.date + "T00:00:00")
            const dayLabel = DAY_LABELS[d.getDay()]

            return (
              <div
                key={idx}
                className="flex flex-1 flex-col items-center gap-1"
              >
                {/* Value label */}
                <div className="h-4 text-[10px] font-bold text-[#777777]">
                  {value > 0 ? value : ""}
                </div>
                {/* Bar */}
                <div className="flex h-24 w-full items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, value > 0 ? 5 : 0)}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: idx * 0.05 }}
                    className={`w-full max-w-[28px] rounded-t-md ${
                      isToday
                        ? "bg-[#58cc02]"
                        : value > 0
                        ? "bg-[#1cb0f6]"
                        : "bg-[#e5e5e5]"
                    }`}
                    style={{ minHeight: value > 0 ? "4px" : "0" }}
                  />
                </div>
                {/* Day label */}
                <span
                  className={`text-[9px] font-bold uppercase ${
                    isToday ? "text-[#58cc02]" : "text-[#afafaf]"
                  }`}
                >
                  {dayLabel}
                </span>
              </div>
            )
          })}
        </div>

        {/* Today's stat highlight */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#d7ffb8] px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wide text-[#58a700]">
            Hari Ini
          </span>
          <span className="text-sm font-black text-[#58cc02]">
            {todayMetric} {METRICS.find((m) => m.id === activeMetric)?.label}
          </span>
        </div>
      </div>

      {/* Accuracy & categories */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* Accuracy card */}
        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5]">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#ff4b4b]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#4b4b4b]">
              Akurasi
            </h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#afafaf] uppercase">Hari Ini</p>
              <p className="text-2xl font-black text-[#58cc02]">{todayAccuracy}%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-[#afafaf] uppercase">Total</p>
              <p className="text-2xl font-black text-[#1cb0f6]">{accuracy}%</p>
            </div>
          </div>
        </div>

        {/* Categories card */}
        <div className="rounded-2xl bg-white p-4 shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5]">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#ce82ff]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#4b4b4b]">
              Kategori Dimainkan
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const played = stats.categoriesPlayed.includes(cat.id)
              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                    played
                      ? "bg-[#d7ffb8] text-[#58a700]"
                      : "bg-[#f7f7f7] text-[#afafaf]"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                  {played && <Check className="h-2.5 w-2.5" />}
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[10px] font-semibold text-[#777777]">
            {stats.categoriesPlayed.length}/3 kategori
          </p>
        </div>
      </div>

      {/* Longest streak */}
      <div className="rounded-2xl bg-gradient-to-r from-[#ffe8cc] to-[#fff5cc] p-4 ring-1 ring-[#ff9600]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 fill-[#ff9600] text-[#ff9600]" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#cc7a00]">
                Streak Terpanjang
              </p>
              <p className="text-[10px] font-semibold text-[#777777]">
                Rekor bermain berturut-turut
              </p>
            </div>
          </div>
          <p className="text-2xl font-black text-[#ff9600]">
            {stats.longestStreak}
            <span className="text-xs font-bold text-[#cc7a00]"> hari</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: "owl" | "macaw" | "fox" | "bee" | "beetle" | "cardinal"
}) {
  const colorMap = {
    owl: { bg: "#d7ffb8", text: "#58a700", border: "#58cc02" },
    macaw: { bg: "#ddf4ff", text: "#1899d6", border: "#1cb0f6" },
    fox: { bg: "#ffe8cc", text: "#cc7a00", border: "#ff9600" },
    bee: { bg: "#fff5cc", text: "#998400", border: "#ffc800" },
    beetle: { bg: "#f0e1ff", text: "#9b4ddb", border: "#ce82ff" },
    cardinal: { bg: "#ffdfe0", text: "#ea2b2b", border: "#ff4b4b" },
  }
  const c = colorMap[color]

  return (
    <div
      className="rounded-xl border-2 p-2.5"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <div className="flex items-center gap-1" style={{ color: c.text }}>
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-base font-black" style={{ color: c.text }}>
        {value}
      </p>
    </div>
  )
}
