"use client"

import { useState, useCallback } from "react"
import AnimatedBackground from "@/components/game/AnimatedBackground"
import Confetti from "@/components/game/Confetti"
import HomeScreen, { type GameMode } from "@/components/game/HomeScreen"
import WorldMap from "@/components/game/WorldMap"
import LevelIntroScreen from "@/components/game/LevelIntroScreen"
import LevelResultScreen from "@/components/game/LevelResultScreen"
import QuizMode from "@/components/game/QuizMode"
import WordMatchMode from "@/components/game/WordMatchMode"
import FillBlankMode from "@/components/game/FillBlankMode"
import SpellMode from "@/components/game/SpellMode"
import MathMode from "@/components/game/MathMode"
import ResultScreen from "@/components/game/ResultScreen"
import type { Achievement, CategoryId, Difficulty, Mission, LevelNode } from "@/lib/game-data"
import type { MathLevel } from "@/lib/math-data"
import { useGameStore } from "@/lib/game-store"

type Screen =
  | "home"
  | "world-map"
  | "level-intro"
  | "playing"
  | "playing-math"
  | "result"
  | "level-result"

interface GameConfig {
  category: CategoryId
  difficulty: Difficulty
  mode: GameMode
}

interface MathConfig {
  level: MathLevel
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
  streakIncreased: boolean
}

interface LevelResultMeta {
  stars: number
  isNewBest: boolean
  unlockedPet: string | null
  unlockedNext: boolean
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home")
  const [config, setConfig] = useState<GameConfig | null>(null)
  const [mathConfig, setMathConfig] = useState<MathConfig | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [resultMeta, setResultMeta] = useState<ResultMeta | null>(null)
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const { recordGameResult, playerName, recordLevelResult } = useGameStore()

  // Arcade mode state
  const [selectedLevel, setSelectedLevel] = useState<LevelNode | null>(null)
  const [levelResultMeta, setLevelResultMeta] = useState<LevelResultMeta | null>(null)
  const [isArcadeMode, setIsArcadeMode] = useState(false)

  const handleStart = (cfg: GameConfig) => {
    setConfig(cfg)
    setScreen("playing")
  }

  const handleStartMath = (level: MathLevel) => {
    setMathConfig({ level })
    setScreen("playing-math")
  }

  const handleStartArcade = () => {
    setIsArcadeMode(true)
    setScreen("world-map")
  }

  const handleBackToClassic = () => {
    setIsArcadeMode(false)
    setScreen("home")
  }

  const handleLevelSelect = (level: LevelNode) => {
    setSelectedLevel(level)
    setScreen("level-intro")
  }

  const handleStartLevel = () => {
    if (!selectedLevel) return
    // Convert level to game config
    const gameMode: GameMode =
      selectedLevel.type === "bonus" ? "spell" :
      selectedLevel.type === "boss" ? "quiz" :
      selectedLevel.type === "final-exam" ? "quiz" :
      "quiz"  // default to quiz for normal levels too (could vary)

    setConfig({
      category: selectedLevel.category === "mixed" ? "vocabulary" : selectedLevel.category,
      difficulty: selectedLevel.difficulty,
      mode: gameMode,
    })
    setScreen("playing")
  }

  const handleComplete = useCallback(
    (res: GameResult) => {
      if (!config) return

      // Record result for stats/leaderboard
      const { newAchievements, rank, completedMissions, streakIncreased } = recordGameResult(
        res.score,
        res.correct,
        res.total,
        config.category,
        config.difficulty,
        res.maxStreak,
        config.mode
      )

      setResult(res)

      if (isArcadeMode && selectedLevel) {
        // Record level progress
        const levelResult = recordLevelResult(selectedLevel.id, res.score)
        setLevelResultMeta(levelResult)
        setScreen("level-result")
        if (levelResult.stars >= 3) {
          setConfettiTrigger((t) => t + 1)
        }
        if (levelResult.unlockedPet) {
          setTimeout(() => setConfettiTrigger((t) => t + 1), 1200)
        }
      } else {
        setResultMeta({ newAchievements, rank, completedMissions, streakIncreased })
        setScreen("result")
        if (res.total > 0 && res.correct / res.total >= 0.7) {
          setConfettiTrigger((t) => t + 1)
        }
        if (completedMissions.length > 0) {
          setTimeout(() => setConfettiTrigger((t) => t + 1), 800)
        }
      }
    },
    [config, recordGameResult, recordLevelResult, isArcadeMode, selectedLevel]
  )

  const handleMathComplete = useCallback(
    (res: GameResult) => {
      if (!mathConfig) return
      // Catat dengan kategori vocabulary dan difficulty beginner supaya tetap masuk leaderboard
      // Tapi pakai mode "math" sebagai identifier
      const { newAchievements, rank, completedMissions, streakIncreased } = recordGameResult(
        res.score,
        res.correct,
        res.total,
        "vocabulary", // kategori placeholder
        "beginner",   // difficulty placeholder
        res.maxStreak,
        "math"        // mode identifier
      )

      setResult(res)
      setResultMeta({ newAchievements, rank, completedMissions, streakIncreased })
      setScreen("result")
      if (res.total > 0 && res.correct / res.total >= 0.7) {
        setConfettiTrigger((t) => t + 1)
      }
      if (completedMissions.length > 0) {
        setTimeout(() => setConfettiTrigger((t) => t + 1), 800)
      }
    },
    [mathConfig, recordGameResult]
  )

  const handlePlayAgain = () => {
    if (mathConfig) {
      setScreen("playing-math")
      setResult(null)
      setResultMeta(null)
      return
    }
    if (config) {
      setScreen("playing")
      setResult(null)
      setResultMeta(null)
    }
  }

  const handleRetryLevel = () => {
    if (config) {
      setScreen("playing")
      setResult(null)
      setLevelResultMeta(null)
    }
  }

  const handleContinueLevel = () => {
    // Go back to world map to select next level
    setSelectedLevel(null)
    setLevelResultMeta(null)
    setResult(null)
    setScreen("world-map")
  }

  const handleHome = () => {
    setScreen("home")
    setConfig(null)
    setMathConfig(null)
    setResult(null)
    setResultMeta(null)
    setSelectedLevel(null)
    setLevelResultMeta(null)
  }

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

      {screen === "home" && (
        <HomeScreen onStart={handleStart} onStartArcade={handleStartArcade} onStartMath={handleStartMath} />
      )}

      {screen === "world-map" && (
        <WorldMap onLevelSelect={handleLevelSelect} />
      )}

      {screen === "level-intro" && selectedLevel && (
        <>
          <WorldMap onLevelSelect={handleLevelSelect} />
          <LevelIntroScreen
            level={selectedLevel}
            onStart={handleStartLevel}
            onCancel={handleBackToClassic}
          />
        </>
      )}

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

      {screen === "playing-math" && mathConfig && (
        <MathMode
          level={mathConfig.level}
          onComplete={handleMathComplete}
          onExit={handleHome}
        />
      )}

      {screen === "result" && result && resultMeta && (
        <ResultScreen
          result={result}
          category={config?.category || "vocabulary"}
          difficulty={config?.difficulty || "beginner"}
          mode={mathConfig ? "math" : (config?.mode || "quiz")}
          playerName={playerName}
          newAchievements={resultMeta.newAchievements}
          rank={resultMeta.rank}
          completedMissions={resultMeta.completedMissions}
          onPlayAgain={handlePlayAgain}
          onHome={handleHome}
        />
      )}

      {screen === "level-result" && selectedLevel && result && levelResultMeta && (
        <>
          <WorldMap onLevelSelect={handleLevelSelect} />
          <LevelResultScreen
            level={selectedLevel}
            score={result.score}
            stars={levelResultMeta.stars}
            isNewBest={levelResultMeta.isNewBest}
            unlockedPet={levelResultMeta.unlockedPet}
            unlockedNext={levelResultMeta.unlockedNext}
            onContinue={handleContinueLevel}
            onRetry={handleRetryLevel}
            onExit={handleBackToClassic}
          />
        </>
      )}
    </main>
  )
}
