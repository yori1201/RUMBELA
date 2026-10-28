"use client"

import { useState, useCallback } from "react"
import AnimatedBackground from "@/components/game/AnimatedBackground"
import Confetti from "@/components/game/Confetti"
import HomeScreen, { type GameMode } from "@/components/game/HomeScreen"
import QuizMode from "@/components/game/QuizMode"
import WordMatchMode from "@/components/game/WordMatchMode"
import FillBlankMode from "@/components/game/FillBlankMode"
import SpellMode from "@/components/game/SpellMode"
import ResultScreen from "@/components/game/ResultScreen"
import type { Achievement, CategoryId, Difficulty, Mission } from "@/lib/game-data"
import { useGameStore } from "@/lib/game-store"

type Screen = "home" | "playing" | "result"

interface GameConfig {
  category: CategoryId
  difficulty: Difficulty
  mode: GameMode
}

interface GameResult {
  score: number
  correct: number
  total: number
  maxStreak: number
}

interface ResultMeta {
  newAchievements: Achievement[]
  rank: number
  completedMissions: Mission[]
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home")
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [resultMeta, setResultMeta] = useState<ResultMeta | null>(null)
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const { recordGameResult, playerName } = useGameStore()

  const handleStart = (cfg: GameConfig) => {
    setConfig(cfg)
    setScreen("playing")
  }

  const handleComplete = useCallback(
    (res: GameResult) => {
      if (!config) return
      // Record result BEFORE switching to result screen (avoid setState-in-render)
      const { newAchievements, rank, completedMissions } = recordGameResult(
        res.score,
        res.correct,
        res.total,
        config.category,
        config.difficulty,
        res.maxStreak,
        config.mode
      )
      setResult(res)
      setResultMeta({ newAchievements, rank, completedMissions })
      setScreen("result")
      // Trigger confetti if perfect or high accuracy
      if (res.total > 0 && res.correct / res.total >= 0.7) {
        setConfettiTrigger((t) => t + 1)
      }
      // Also trigger confetti if a mission was completed
      if (completedMissions.length > 0) {
        setTimeout(() => setConfettiTrigger((t) => t + 1), 800)
      }
    },
    [config, recordGameResult]
  )

  const handlePlayAgain = () => {
    if (config) {
      setScreen("playing")
      setResult(null)
      setResultMeta(null)
    }
  }

  const handleHome = () => {
    setScreen("home")
    setConfig(null)
    setResult(null)
    setResultMeta(null)
  }

  // Difficulty-based lives & timer
  const getLives = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "beginner":
        return 5
      case "intermediate":
        return 4
      case "advanced":
        return 3
    }
  }

  const getQuestionTime = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "beginner":
        return 30
      case "intermediate":
        return 25
      case "advanced":
        return 20
    }
  }

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <AnimatedBackground />
      <Confetti trigger={confettiTrigger} />

      {screen === "home" && <HomeScreen onStart={handleStart} />}

      {screen === "playing" && config && (
        <>
          {config.mode === "quiz" && (
            <QuizMode
              category={config.category}
              difficulty={config.difficulty}
              maxLives={getLives(config.difficulty)}
              questionTime={getQuestionTime(config.difficulty)}
              onComplete={handleComplete}
              onExit={handleHome}
            />
          )}
          {config.mode === "match" && (
            <WordMatchMode
              category={config.category}
              difficulty={config.difficulty}
              maxLives={getLives(config.difficulty)}
              onComplete={handleComplete}
              onExit={handleHome}
            />
          )}
          {config.mode === "fill-blank" && (
            <FillBlankMode
              category={config.category}
              difficulty={config.difficulty}
              maxLives={getLives(config.difficulty)}
              onComplete={handleComplete}
              onExit={handleHome}
            />
          )}
          {config.mode === "spell" && (
            <SpellMode
              category={config.category}
              difficulty={config.difficulty}
              maxLives={getLives(config.difficulty)}
              onComplete={handleComplete}
              onExit={handleHome}
            />
          )}
        </>
      )}

      {screen === "result" && config && result && resultMeta && (
        <ResultScreen
          result={result}
          category={config.category}
          difficulty={config.difficulty}
          mode={config.mode}
          playerName={playerName}
          newAchievements={resultMeta.newAchievements}
          rank={resultMeta.rank}
          completedMissions={resultMeta.completedMissions}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      )}
    </main>
  )
}
