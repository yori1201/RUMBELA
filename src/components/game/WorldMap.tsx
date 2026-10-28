"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo } from "react"
import { Lock, Star, Check, Zap, Crown, Gift, Sparkles, MapPin, ChevronRight } from "lucide-react"
import {
  WORLDS,
  LEVELS,
  getLevelsByWorld,
  PETS,
  type LevelNode,
  type WorldInfo,
} from "@/lib/game-data"
import { useGameStore } from "@/lib/game-store"
import { soundManager } from "@/lib/sound"
import { Button } from "@/components/ui/button"

interface WorldMapProps {
  onLevelSelect: (level: LevelNode) => void
}

export default function WorldMap({ onLevelSelect }: WorldMapProps) {
  const { stats, isLevelUnlocked, activePet } = useGameStore()
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null)
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null)

  // Find current level (first unlocked & not completed)
  const allLevels = useMemo(() => LEVELS, [])
  const currentLevel = allLevels.find(
    (l) => isLevelUnlocked(l.id) && !stats.levelProgress[l.id]?.completed
  )

  // Determine Bela's position (at current level, or last completed)
  const belaLevel = currentLevel || allLevels[allLevels.length - 1]

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/rumbela/logo-full.png"
              alt="Rumbela"
              className="h-12 w-auto object-contain drop-shadow-sm sm:h-14"
              draggable={false}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {stats.dailyStreak > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff9600] to-[#ffc800] px-3 py-1.5 border-2 border-[#cc7a00] shadow-[0_2px_0_#cc7a00]">
                <span className="text-xs font-black text-white">🔥 {stats.dailyStreak}</span>
              </div>
            )}
            {/* Active pet badge */}
            {activePet && PETS[activePet as keyof typeof PETS] && (
              <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 border-2 border-[#e5e5e5] shadow-[0_2px_0_#e5e5e5]">
                <span className="text-base">{PETS[activePet as keyof typeof PETS].emoji}</span>
              </div>
            )}
          </div>
        </header>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#4b4b4b] sm:text-3xl">
            Petualangan Bela
          </h1>
          <p className="mt-1 text-sm text-[#777777]">
            Terbang dari Jakarta menuju Sekolah Rumbela! 🚀
          </p>
        </motion.div>

        {/* World Map SVG */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#ddf4ff] via-[#d7ffb8] to-[#fff5cc] p-4 shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5] sm:p-6">
          {/* Decorative clouds */}
          <DecorativeClouds />

          {/* SVG paths connecting levels */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Draw path between consecutive levels */}
            {allLevels.slice(0, -1).map((level, idx) => {
              const next = allLevels[idx + 1]
              const isCompleted = stats.levelProgress[level.id]?.completed
              return (
                <line
                  key={`path-${level.id}`}
                  x1={level.x}
                  y1={level.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={isCompleted ? "#58cc02" : "#e5e5e5"}
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  strokeDasharray={isCompleted ? "0" : "1,1"}
                  vectorEffect="non-scaling-stroke"
                  style={{ transform: "scale(1)" }}
                />
              )
            })}
          </svg>

          {/* Level nodes */}
          <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
            {allLevels.map((level) => {
              const unlocked = isLevelUnlocked(level.id)
              const progress = stats.levelProgress[level.id]
              const completed = progress?.completed || false
              const stars = progress?.stars || 0
              const isCurrent = level.id === belaLevel?.id
              const isHovered = hoveredLevel === level.id

              return (
                <LevelNode
                  key={level.id}
                  level={level}
                  unlocked={unlocked}
                  completed={completed}
                  stars={stars}
                  isCurrent={isCurrent}
                  isHovered={isHovered}
                  showBela={isCurrent}
                  activePet={activePet}
                  onHover={(h) => setHoveredLevel(h ? level.id : null)}
                  onClick={() => {
                    if (unlocked) {
                      soundManager.play("select")
                      onLevelSelect(level)
                    } else {
                      soundManager.play("wrong")
                    }
                  }}
                />
              )
            })}

            {/* World labels */}
            {WORLDS.map((world) => (
              <div
                key={world.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: `${world.centerX}%`, top: `${world.centerY - 8}%` }}
              >
                <div className="text-2xl drop-shadow-sm sm:text-3xl">{world.icon}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-[#4b4b4b] sm:text-xs">
                  {world.name}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10px] font-bold uppercase text-[#777777]">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-[#58cc02]"></div>
              <span>Selesai</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-[#1cb0f6] animate-pulse"></div>
              <span>Saat Ini</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-[#e5e5e5]"></div>
              <span>Terkunci</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-[#ffc800]" />
              <span>Boss</span>
            </div>
            <div className="flex items-center gap-1">
              <Gift className="h-3 w-3 text-[#ce82ff]" />
              <span>Bonus</span>
            </div>
          </div>
        </div>

        {/* Level detail card on hover */}
        <AnimatePresence>
          {hoveredLevel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <LevelDetailCard level={allLevels.find((l) => l.id === hoveredLevel)!} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pets collection */}
        {stats.unlockedPets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl bg-white p-4 shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5]"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#4b4b4b]">
              <Sparkles className="h-4 w-4 text-[#ce82ff]" />
              Koleksi Hewan Peliharaan
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(Object.keys(PETS) as Array<keyof typeof PETS>).map((petKey) => {
                const unlocked = stats.unlockedPets.includes(petKey)
                const pet = PETS[petKey]
                const isActive = activePet === petKey
                return (
                  <button
                    key={petKey}
                    onClick={() => {
                      if (unlocked) {
                        soundManager.play("click")
                        useGameStore.getState().setActivePet(isActive ? null : petKey)
                      }
                    }}
                    disabled={!unlocked}
                    className={`rounded-xl p-3 text-center transition-all ${
                      isActive
                        ? "bg-[#d7ffb8] ring-2 ring-[#58cc02]"
                        : unlocked
                        ? "bg-[#f7f7f7] hover:bg-[#ddf4ff]"
                        : "bg-[#f7f7f7] opacity-50"
                    }`}
                  >
                    <div className="text-3xl">{unlocked ? pet.emoji : "🔒"}</div>
                    <p className="mt-1 text-xs font-bold text-[#4b4b4b]">{unlocked ? pet.name : "???"}</p>
                    {isActive && (
                      <p className="text-[10px] font-bold text-[#58cc02]">AKTIF</p>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill label="Level Selesai" value={`${Object.keys(stats.levelProgress).length}/${LEVELS.length}`} color="#58cc02" />
          <StatPill label="Total Bintang" value={`${Object.values(stats.levelProgress).reduce((s, p) => s + p.stars, 0)}⭐`} color="#ffc800" />
          <StatPill label="Hewan" value={`${stats.unlockedPets.length}/5`} color="#ce82ff" />
        </div>

        {/* Back button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => {
              soundManager.play("click")
              window.location.reload()
            }}
            variant="outline"
            className="rounded-xl"
          >
            ← Kembali ke Mode Klasik
          </Button>
        </div>
      </div>
    </div>
  )
}

function LevelNode({
  level,
  unlocked,
  completed,
  stars,
  isCurrent,
  isHovered,
  showBela,
  activePet,
  onHover,
  onClick,
}: {
  level: LevelNode
  unlocked: boolean
  completed: boolean
  stars: number
  isCurrent: boolean
  isHovered: boolean
  showBela: boolean
  activePet: string | null
  onHover: (h: boolean) => void
  onClick: () => void
}) {
  // Determine node appearance based on type
  const getNodeStyle = () => {
    if (level.type === "boss") {
      return {
        bg: completed ? "#ffc800" : unlocked ? "#ff9600" : "#e5e5e5",
        ring: "#cc7a00",
        size: 56,
      }
    }
    if (level.type === "bonus") {
      return {
        bg: completed ? "#ce82ff" : unlocked ? "#ce82ff" : "#e5e5e5",
        ring: "#9b4ddb",
        size: 52,
      }
    }
    if (level.type === "final-exam") {
      return {
        bg: completed ? "#58cc02" : unlocked ? "#1cb0f6" : "#e5e5e5",
        ring: "#1899d6",
        size: 60,
      }
    }
    // normal
    return {
      bg: completed ? "#58cc02" : unlocked ? "#1cb0f6" : "#e5e5e5",
      ring: completed ? "#58a700" : unlocked ? "#1899d6" : "#afafaf",
      size: 48,
    }
  }

  const style = getNodeStyle()

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${level.x}%`, top: `${level.y}%` }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <motion.button
        onClick={onClick}
        whileHover={unlocked ? { scale: 1.15 } : {}}
        whileTap={unlocked ? { scale: 0.9 } : {}}
        animate={isCurrent ? { y: [0, -3, 0] } : {}}
        transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
        className="relative flex items-center justify-center"
        style={{
          width: style.size,
          height: style.size,
          borderRadius: "50%",
          background: style.bg,
          border: `3px solid ${style.ring}`,
          boxShadow: `0 4px 0 ${style.ring}`,
          cursor: unlocked ? "pointer" : "not-allowed",
        }}
        aria-label={`${level.title} ${unlocked ? "(unlocked)" : "(locked)"}`}
      >
        {/* Inner content based on type */}
        {level.type === "boss" && unlocked && (
          <Crown className="h-5 w-5 text-white" />
        )}
        {level.type === "bonus" && unlocked && (
          <Gift className="h-5 w-5 text-white" />
        )}
        {level.type === "final-exam" && unlocked && (
          <span className="text-xl">{completed ? "🎓" : "⭐"}</span>
        )}
        {level.type === "normal" && unlocked && !completed && (
          <span className="text-base font-black text-white">{level.levelNumber}</span>
        )}
        {completed && level.type !== "final-exam" && (
          <Check className="h-5 w-5 text-white" strokeWidth={4} />
        )}
        {!unlocked && (
          <Lock className="h-4 w-4 text-[#afafaf]" />
        )}

        {/* Stars above (if completed) */}
        {completed && stars > 0 && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring" }}
              >
                <Star
                  className={`h-3 w-3 ${i < stars ? "fill-[#ffc800] text-[#ffc800]" : "fill-[#e5e5e5] text-[#e5e5e5]"}`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Current level pulse */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${style.bg}` }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Bela mascot flying above current level */}
      {showBela && (
        <motion.div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{ top: -45 }}
          animate={{
            y: [0, -6, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            <img
              src="/rumbela/mascot-bela-animated.webp"
              alt="Bela"
              className="h-12 w-12 object-contain"
              draggable={false}
            />
            {/* Sparkle effects around flying Bela */}
            <motion.div
              className="absolute -right-1 -top-1 text-xs"
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -left-1 top-2 text-xs"
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              ⭐
            </motion.div>

            {/* Active pet companion flies with Bela */}
            {activePet && PETS[activePet as keyof typeof PETS] && (
              <motion.div
                className="absolute -bottom-2 -right-2 text-base"
                animate={{ y: [0, -3, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {PETS[activePet as keyof typeof PETS].emoji}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Level number label below */}
      <div className="mt-1 text-center">
        <p className="text-[8px] font-bold uppercase text-[#4b4b4b] sm:text-[10px]">
          {level.title.length > 12 ? level.title.substring(0, 10) + "..." : level.title}
        </p>
      </div>
    </div>
  )
}

function LevelDetailCard({ level }: { level: LevelNode }) {
  const typeLabels = {
    normal: "Normal",
    boss: "Boss",
    bonus: "Bonus",
    "final-exam": "Final Exam",
  }
  const typeColors = {
    normal: "#1cb0f6",
    boss: "#ff9600",
    bonus: "#ce82ff",
    "final-exam": "#58cc02",
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_4px_0_#e5e5e5] border-2 border-[#e5e5e5]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
              style={{ backgroundColor: typeColors[level.type] }}
            >
              {typeLabels[level.type]}
            </span>
            <span className="text-[10px] font-bold text-[#777777] uppercase">
              {level.worldName} · Lv {level.levelNumber}
            </span>
          </div>
          <h3 className="mt-1 text-base font-black text-[#4b4b4b]">{level.title}</h3>
          <p className="text-xs text-[#777777]">{level.description}</p>
        </div>
      </div>
      <p className="mt-2 text-xs italic text-[#777777]">{level.intro}</p>
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-2 text-center"
      style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, borderWidth: 2 }}
    >
      <p className="text-[9px] font-bold uppercase text-[#777777]">{label}</p>
      <p className="text-sm font-black" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function DecorativeClouds() {
  return (
    <>
      <motion.div
        className="absolute left-4 top-8 text-2xl opacity-50"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute right-8 top-16 text-xl opacity-40"
        animate={{ x: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute left-12 top-24 text-lg opacity-30"
        animate={{ x: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        ☁️
      </motion.div>
      <motion.div
        className="absolute right-16 top-4 text-base opacity-50"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🌤️
      </motion.div>
    </>
  )
}
