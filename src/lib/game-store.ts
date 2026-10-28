// ============================================================
// Game Store - Zustand state management
// Handles player progress, leaderboard, achievements
// ============================================================

import { create } from "zustand"
import {
  ACHIEVEMENTS,
  type Achievement,
  type CategoryId,
  type Difficulty,
  type PlayerStats,
} from "./game-data"

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  category: CategoryId
  difficulty: Difficulty
  accuracy: number
  date: string
}

interface GameState {
  // Player
  playerName: string
  stats: PlayerStats
  unlockedAchievements: string[]
  leaderboard: LeaderboardEntry[]

  // Actions
  setPlayerName: (name: string) => void
  recordGameResult: (
    score: number,
    correct: number,
    total: number,
    category: CategoryId,
    difficulty: Difficulty,
    maxStreak: number
  ) => { newAchievements: Achievement[]; rank: number }
  resetProgress: () => void
  loadFromStorage: () => void
}

const DEFAULT_STATS: PlayerStats = {
  totalScore: 0,
  totalCorrect: 0,
  totalGamesPlayed: 0,
  maxStreak: 0,
  perfectGames: 0,
  categoriesPlayed: [],
}

function loadStats(): PlayerStats {
  if (typeof window === "undefined") return DEFAULT_STATS
  try {
    const raw = localStorage.getItem("rumbela-stats")
    if (!raw) return DEFAULT_STATS
    return { ...DEFAULT_STATS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATS
  }
}

function loadAchievements(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("rumbela-achievements")
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("rumbela-leaderboard")
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function loadPlayerName(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("rumbela-player-name") || ""
}

export const useGameStore = create<GameState>((set, get) => ({
  playerName: loadPlayerName(),
  stats: loadStats(),
  unlockedAchievements: loadAchievements(),
  leaderboard: loadLeaderboard(),

  setPlayerName: (name) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rumbela-player-name", name)
    }
    set({ playerName: name })
  },

  recordGameResult: (score, correct, total, category, difficulty, maxStreak) => {
    const state = get()
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
    const isPerfect = correct === total && total > 0

    const newStats: PlayerStats = {
      totalScore: state.stats.totalScore + score,
      totalCorrect: state.stats.totalCorrect + correct,
      totalGamesPlayed: state.stats.totalGamesPlayed + 1,
      maxStreak: Math.max(state.stats.maxStreak, maxStreak),
      perfectGames: state.stats.perfectGames + (isPerfect ? 1 : 0),
      categoriesPlayed: state.stats.categoriesPlayed.includes(category)
        ? state.stats.categoriesPlayed
        : [...state.stats.categoriesPlayed, category],
    }

    // Check for new achievements
    const previousUnlocked = new Set(state.unlockedAchievements)
    const newAchievements: Achievement[] = []
    for (const ach of ACHIEVEMENTS) {
      if (!previousUnlocked.has(ach.id) && ach.condition(newStats)) {
        newAchievements.push(ach)
      }
    }

    const newUnlocked = [
      ...state.unlockedAchievements,
      ...newAchievements.map((a) => a.id),
    ]

    // Add to leaderboard
    const entry: LeaderboardEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: state.playerName || "Anonymous",
      score,
      category,
      difficulty,
      accuracy,
      date: new Date().toISOString(),
    }
    const newLeaderboard = [...state.leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)

    // Persist
    if (typeof window !== "undefined") {
      localStorage.setItem("rumbela-stats", JSON.stringify(newStats))
      localStorage.setItem("rumbela-achievements", JSON.stringify(newUnlocked))
      localStorage.setItem("rumbela-leaderboard", JSON.stringify(newLeaderboard))
    }

    // Compute rank (1-indexed) of this new entry
    const rank = newLeaderboard.findIndex((e) => e.id === entry.id) + 1

    set({
      stats: newStats,
      unlockedAchievements: newUnlocked,
      leaderboard: newLeaderboard,
    })

    return { newAchievements, rank }
  },

  resetProgress: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rumbela-stats")
      localStorage.removeItem("rumbela-achievements")
      localStorage.removeItem("rumbela-leaderboard")
      localStorage.removeItem("rumbela-player-name")
    }
    set({
      playerName: "",
      stats: DEFAULT_STATS,
      unlockedAchievements: [],
      leaderboard: [],
    })
  },

  loadFromStorage: () => {
    set({
      playerName: loadPlayerName(),
      stats: loadStats(),
      unlockedAchievements: loadAchievements(),
      leaderboard: loadLeaderboard(),
    })
  },
}))
