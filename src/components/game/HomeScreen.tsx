"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Trophy, Settings, Volume2, VolumeX, Sparkles, BookOpen, Award, RotateCcw } from "lucide-react"
import { CATEGORIES, DIFFICULTIES, ACHIEVEMENTS, type CategoryId, type Difficulty } from "@/lib/game-data"
import { useGameStore } from "@/lib/game-store"
import { soundManager } from "@/lib/sound"
import Mascot from "./Mascot"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HomeScreenProps {
  onStart: (config: {
    category: CategoryId
    difficulty: Difficulty
    mode: GameMode
  }) => void
}

export type GameMode = "quiz" | "match" | "fill-blank" | "spell"

const GAME_MODES: {
  id: GameMode
  name: string
  icon: string
  description: string
  color: string
  gradient: string
}[] = [
  {
    id: "quiz",
    name: "Quiz Challenge",
    icon: "🧠",
    description: "Pilihan ganda dengan timer",
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "match",
    name: "Word Match",
    icon: "🔗",
    description: "Cocokkan kata Inggris & Indonesia",
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: "fill-blank",
    name: "Fill the Blank",
    icon: "✏️",
    description: "Lengkapi kalimat yang kosong",
    color: "rose",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    id: "spell",
    name: "Spell Master",
    icon: "🔤",
    description: "Eja kata dengan benar",
    color: "purple",
    gradient: "from-purple-500 to-fuchsia-500",
  },
]

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const { playerName, setPlayerName, stats, leaderboard, unlockedAchievements, resetProgress } = useGameStore()
  const [name, setName] = useState(playerName)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null)
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [soundOn, setSoundOn] = useState(soundManager.isEnabled())
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)

  const toggleSound = () => {
    const newVal = !soundOn
    setSoundOn(newVal)
    soundManager.setEnabled(newVal)
    if (newVal) soundManager.play("click")
  }

  const handleStart = () => {
    if (!name.trim()) {
      soundManager.play("wrong")
      return
    }
    if (!selectedCategory || !selectedDifficulty || !selectedMode) {
      soundManager.play("wrong")
      return
    }
    setPlayerName(name.trim())
    soundManager.play("select")
    onStart({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      mode: selectedMode,
    })
  }

  const canStart = name.trim() && selectedCategory && selectedDifficulty && selectedMode

  return (
    <div className="min-h-screen w-full px-4 py-6 sm:px-6">
      {/* Header */}
      <header className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Rumbela official logo */}
          <img
            src="/rumbela/logo-full.png"
            alt="Rumbela - Rumah belajar Anak"
            className="h-12 w-auto object-contain drop-shadow-sm sm:h-14"
            draggable={false}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            className="h-9 w-9 rounded-full"
            aria-label={soundOn ? "Matikan suara" : "Nyalakan suara"}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              soundManager.play("click")
              setShowLeaderboard(true)
            }}
            className="h-9 w-9 rounded-full"
            aria-label="Leaderboard"
          >
            <Trophy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              soundManager.play("click")
              setShowAchievements(true)
            }}
            className="h-9 w-9 rounded-full"
            aria-label="Achievements"
          >
            <Award className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero with Mascot */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-6 max-w-5xl"
      >
        <div className="grid grid-cols-1 items-center gap-4 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-5 shadow-xl ring-1 ring-emerald-100/50 sm:grid-cols-[auto_1fr] sm:p-8">
          <div className="flex justify-center">
            <Mascot mood="happy" size={140} message={`Halo ${name || "teman"}! Ayo belajar bareng Bela!`} />
          </div>
          <div className="space-y-3 text-center sm:text-left">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <Sparkles className="mr-1 h-3 w-3" /> Bimbel Rumbela
            </Badge>
            <h2 className="text-2xl font-black leading-tight text-slate-800 sm:text-4xl">
              Petualangan Bahasa Inggris
            </h2>
            <p className="text-sm text-slate-600 sm:text-base">
              Pilih kategori, level, dan mode permainan favoritmu. Kumpulkan poin,
              buka achievement, dan jadi juara Bahasa Inggris bersama Bela!
            </p>
            {stats.totalGamesPlayed > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="secondary" className="bg-white">
                  <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                  {stats.totalScore.toLocaleString()} pts
                </Badge>
                <Badge variant="secondary" className="bg-white">
                  <Flame className="mr-1 h-3 w-3 text-orange-500" />
                  Streak: {stats.maxStreak}
                </Badge>
                <Badge variant="secondary" className="bg-white">
                  <BookOpen className="mr-1 h-3 w-3 text-emerald-600" />
                  {stats.totalGamesPlayed} game
                </Badge>
                <Badge variant="secondary" className="bg-white">
                  <Award className="mr-1 h-3 w-3 text-purple-600" />
                  {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      <div className="mx-auto max-w-5xl space-y-5">
        {/* Step 1: Player Name */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">1</span>
            Siapa namamu?
          </h3>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tulis namamu di sini..."
            maxLength={20}
            className="h-12 rounded-xl bg-white text-base font-semibold shadow-sm"
          />
        </section>

        {/* Step 2: Category */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">2</span>
            Pilih Kategori
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundManager.play("click")
                  setSelectedCategory(cat.id)
                }}
                className={`relative overflow-hidden rounded-2xl p-4 text-left shadow-md ring-2 transition-all ${
                  selectedCategory === cat.id
                    ? "ring-emerald-500"
                    : "ring-transparent hover:ring-emerald-200"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90`} />
                <div className="relative">
                  <div className="text-3xl">{cat.icon}</div>
                  <h4 className="mt-2 font-black text-white">{cat.name}</h4>
                  <p className="text-xs text-white/90">{cat.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Step 3: Difficulty */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">3</span>
            Pilih Level Kesulitan
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {DIFFICULTIES.map((diff) => (
              <motion.button
                key={diff.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  soundManager.play("click")
                  setSelectedDifficulty(diff.id)
                }}
                className={`flex flex-col items-center gap-1 rounded-xl p-3 shadow-md ring-2 transition-all ${
                  selectedDifficulty === diff.id
                    ? "bg-emerald-50 ring-emerald-500"
                    : "bg-white ring-transparent hover:ring-emerald-200"
                }`}
              >
                <span className="text-2xl">{diff.icon}</span>
                <span className="text-xs font-bold text-slate-700">{diff.name}</span>
                <span className="text-[10px] text-slate-500">{diff.multiplier}x poin</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Step 4: Game Mode */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">4</span>
            Pilih Mode Permainan
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GAME_MODES.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundManager.play("click")
                  setSelectedMode(mode.id)
                }}
                className={`relative overflow-hidden rounded-2xl p-4 text-left shadow-md ring-2 transition-all ${
                  selectedMode === mode.id
                    ? "ring-emerald-500"
                    : "ring-transparent hover:ring-emerald-200"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-90`} />
                <div className="relative">
                  <div className="text-3xl">{mode.icon}</div>
                  <h4 className="mt-2 font-black text-white">{mode.name}</h4>
                  <p className="text-xs text-white/90">{mode.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sticky bottom-4 z-20 pt-2"
        >
          <Button
            onClick={handleStart}
            disabled={!canStart}
            size="lg"
            className={`w-full h-14 rounded-2xl text-base font-black shadow-xl transition-all ${
              canStart
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                : "bg-slate-300 text-slate-500"
            }`}
          >
            {!canStart
              ? "Lengkapi pilihanmu dulu ya!"
              : `🚀 Mulai Petualangan, ${name}!`}
          </Button>
        </motion.div>

        {/* Reset progress (only if has progress) */}
        {stats.totalGamesPlayed > 0 && (
          <div className="flex justify-center pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Yakin mau reset semua progres? Skor, achievement, dan leaderboard akan hilang.")) {
                  resetProgress()
                  setName("")
                  soundManager.play("click")
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-500"
            >
              <RotateCcw className="mr-1 h-3 w-3" /> Reset Progres
            </Button>
          </div>
        )}
      </div>

      {/* Footer with branding */}
      <footer className="mx-auto mt-8 max-w-5xl border-t border-slate-200/60 px-4 py-6 text-center">
        <img
          src="/rumbela/logo-full.png"
          alt="Rumbela - Rumah belajar Anak"
          className="mx-auto mb-2 h-10 w-auto object-contain opacity-90 sm:h-12"
          draggable={false}
        />
        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Rumbela · Rumah belajar Anak · English Quest
        </p>
      </footer>

      {/* Leaderboard Dialog */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Papan Skor Tertinggi
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {leaderboard.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Belum ada skor. Yuk mulai bermain dan jadilah yang pertama!
              </p>
            ) : (
              <ol className="space-y-2">
                {leaderboard.slice(0, 20).map((entry, idx) => (
                  <li
                    key={entry.id}
                    className={`flex items-center gap-3 rounded-xl p-3 ${
                      idx === 0
                        ? "bg-amber-50 ring-1 ring-amber-200"
                        : idx === 1
                        ? "bg-slate-100"
                        : idx === 2
                        ? "bg-orange-50"
                        : "bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                        idx === 0
                          ? "bg-amber-400 text-white"
                          : idx === 1
                          ? "bg-slate-400 text-white"
                          : idx === 2
                          ? "bg-orange-400 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{entry.name}</p>
                      <p className="text-xs text-slate-500">
                        {entry.category} · {entry.difficulty} · {entry.accuracy}% benar
                      </p>
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      {entry.score}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" /> Koleksi Achievement
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = unlockedAchievements.includes(ach.id)
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-3 text-center ${
                      unlocked
                        ? "bg-gradient-to-br from-purple-50 to-fuchsia-50 ring-1 ring-purple-200"
                        : "bg-slate-50 opacity-60"
                    }`}
                  >
                    <div className="text-3xl">{unlocked ? ach.icon : "🔒"}</div>
                    <p className="mt-1 text-xs font-bold">{ach.name}</p>
                    <p className="text-[10px] text-slate-500">{ach.description}</p>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Local flame icon to avoid extra import
function Flame({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2C9 6 7 9 7 13a5 5 0 0 0 10 0c0-2-1-4-2-5 0 1-1 2-2 2 1-3-1-6-1-8z" />
    </svg>
  )
}

// Local star icon
function Star({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
