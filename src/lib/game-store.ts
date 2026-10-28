// ============================================================
// Game Store - Zustand state management
// Handles player progress, leaderboard, achievements, missions
// ============================================================

import { create } from "zustand"
import {
  ACHIEVEMENTS,
  type Achievement,
  type CategoryId,
  type Difficulty,
  type PlayerStats,
  type Mission,
  type MissionContext,
  MAIN_MISSIONS,
  getDailyMissions,
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

// Extended stats for mission tracking
export interface ExtendedStats extends PlayerStats {
  modesPlayed: string[]
  difficultiesPlayed: Difficulty[]
  differentDaysPlayed: string[] // array of YYYY-MM-DD strings
  // Daily tracking (reset each day)
  todayDateKey: string // YYYY-MM-DD
  todayGamesPlayed: number
  todayCorrect: number
  todayScore: number
  todayMaxStreak: number
  todayPerfectGames: number
  todayCategoriesPlayed: CategoryId[]
  // Mission rewards claimed
  claimedMissionIds: string[]
}

interface GameState {
  // Player
  playerName: string
  stats: ExtendedStats
  unlockedAchievements: string[]
  leaderboard: LeaderboardEntry[]
  lastSessionCategory: CategoryId | null
  lastSessionMode: string | null

  // Actions
  setPlayerName: (name: string) => void
  recordGameResult: (
    score: number,
    correct: number,
    total: number,
    category: CategoryId,
    difficulty: Difficulty,
    maxStreak: number,
    mode: string
  ) => {
    newAchievements: Achievement[]
    rank: number
    completedMissions: Mission[]
  }
  claimMissionReward: (missionId: string) => number // returns reward amount
  getMissionContext: () => MissionContext
  resetProgress: () => void
  loadFromStorage: () => void
}

const DEFAULT_STATS: ExtendedStats = {
  totalScore: 0,
  totalCorrect: 0,
  totalGamesPlayed: 0,
  maxStreak: 0,
  perfectGames: 0,
  categoriesPlayed: [],
  modesPlayed: [],
  difficultiesPlayed: [],
  differentDaysPlayed: [],
  todayDateKey: "",
  todayGamesPlayed: 0,
  todayCorrect: 0,
  todayScore: 0,
  todayMaxStreak: 0,
  todayPerfectGames: 0,
  todayCategoriesPlayed: [],
  claimedMissionIds: [],
}

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Reset daily stats if it's a new day
function rolloverDailyIfNeeded(stats: ExtendedStats): ExtendedStats {
  const todayKey = getTodayKey()
  if (stats.todayDateKey !== todayKey) {
    return {
      ...stats,
      todayDateKey: todayKey,
      todayGamesPlayed: 0,
      todayCorrect: 0,
      todayScore: 0,
      todayMaxStreak: 0,
      todayPerfectGames: 0,
      todayCategoriesPlayed: [],
    }
  }
  return stats
}

function loadStats(): ExtendedStats {
  if (typeof window === "undefined") return DEFAULT_STATS
  try {
    const raw = localStorage.getItem("rumbela-stats")
    if (!raw) return DEFAULT_STATS
    const parsed = { ...DEFAULT_STATS, ...JSON.parse(raw) }
    return rolloverDailyIfNeeded(parsed)
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
  lastSessionCategory: null,
  lastSessionMode: null,

  setPlayerName: (name) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rumbela-player-name", name)
    }
    set({ playerName: name })
  },

  recordGameResult: (score, correct, total, category, difficulty, maxStreak, mode) => {
    const state = get()
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
    const isPerfect = correct === total && total > 0
    const todayKey = getTodayKey()

    // Make sure daily stats are rolled over
    const rolledStats = rolloverDailyIfNeeded(state.stats)

    const newStats: ExtendedStats = {
      ...rolledStats,
      totalScore: rolledStats.totalScore + score,
      totalCorrect: rolledStats.totalCorrect + correct,
      totalGamesPlayed: rolledStats.totalGamesPlayed + 1,
      maxStreak: Math.max(rolledStats.maxStreak, maxStreak),
      perfectGames: rolledStats.perfectGames + (isPerfect ? 1 : 0),
      categoriesPlayed: rolledStats.categoriesPlayed.includes(category)
        ? rolledStats.categoriesPlayed
        : [...rolledStats.categoriesPlayed, category],
      modesPlayed: rolledStats.modesPlayed.includes(mode)
        ? rolledStats.modesPlayed
        : [...rolledStats.modesPlayed, mode],
      difficultiesPlayed: rolledStats.difficultiesPlayed.includes(difficulty)
        ? rolledStats.difficultiesPlayed
        : [...rolledStats.difficultiesPlayed, difficulty],
      differentDaysPlayed: rolledStats.differentDaysPlayed.includes(todayKey)
        ? rolledStats.differentDaysPlayed
        : [...rolledStats.differentDaysPlayed, todayKey],
      // Daily
      todayDateKey: todayKey,
      todayGamesPlayed: rolledStats.todayGamesPlayed + 1,
      todayCorrect: rolledStats.todayCorrect + correct,
      todayScore: rolledStats.todayScore + score,
      todayMaxStreak: Math.max(rolledStats.todayMaxStreak, maxStreak),
      todayPerfectGames: rolledStats.todayPerfectGames + (isPerfect ? 1 : 0),
      todayCategoriesPlayed: rolledStats.todayCategoriesPlayed.includes(category)
        ? rolledStats.todayCategoriesPlayed
        : [...rolledStats.todayCategoriesPlayed, category],
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

    const rank = newLeaderboard.findIndex((e) => e.id === entry.id) + 1

    set({
      stats: newStats,
      unlockedAchievements: newUnlocked,
      leaderboard: newLeaderboard,
      lastSessionCategory: category,
      lastSessionMode: mode,
    })

    // Compute which missions just completed (not previously completed)
    const ctx = get().getMissionContext()
    const completedMissions: Mission[] = []

    // Check main missions
    for (const mission of MAIN_MISSIONS) {
      if (newStats.claimedMissionIds.includes(mission.id)) continue
      const progress = computeMissionProgressForMission(mission, ctx, newStats)
      if (progress >= mission.target) {
        // Mission goal reached, mark as completable (will be claimed by user)
        // For now, we just track it as "completed but not yet claimed"
        completedMissions.push(mission)
      }
    }

    // Check daily missions
    const dailyMissions = getDailyMissions()
    for (const mission of dailyMissions) {
      if (newStats.claimedMissionIds.includes(`${mission.id}-${todayKey}`)) continue
      const progress = computeMissionProgressForMission(mission, ctx, newStats)
      if (progress >= mission.target) {
        completedMissions.push(mission)
      }
    }

    return { newAchievements, rank, completedMissions }
  },

  claimMissionReward: (missionId) => {
    const state = get()
    const todayKey = getTodayKey()

    // Find the mission (main or daily)
    let mission: Mission | undefined = MAIN_MISSIONS.find((m) => m.id === missionId)
    if (!mission) {
      const daily = getDailyMissions()
      mission = daily.find((m) => m.id === missionId)
    }
    if (!mission) return 0

    // Build the claimed ID
    const claimedId = mission.type === "daily" ? `${missionId}-${todayKey}` : missionId

    // Check if already claimed
    if (state.stats.claimedMissionIds.includes(claimedId)) return 0

    // Verify mission is actually complete
    const ctx = get().getMissionContext()
    const progress = computeMissionProgressForMission(mission, ctx, state.stats)
    if (progress < mission.target) return 0

    // Add reward to score
    const newStats: ExtendedStats = {
      ...state.stats,
      totalScore: state.stats.totalScore + mission.reward,
      todayScore: state.stats.todayScore + mission.reward,
      claimedMissionIds: [...state.stats.claimedMissionIds, claimedId],
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("rumbela-stats", JSON.stringify(newStats))
    }

    set({ stats: newStats })
    return mission.reward
  },

  getMissionContext: () => {
    const state = get()
    const stats = rolloverDailyIfNeeded(state.stats)
    return {
      totalGamesPlayed: stats.totalGamesPlayed,
      totalCorrect: stats.totalCorrect,
      totalScore: stats.totalScore,
      maxStreak: stats.maxStreak,
      perfectGames: stats.perfectGames,
      unlockedAchievementsCount: state.unlockedAchievements.length,
      categoriesPlayed: stats.categoriesPlayed,
      modesPlayed: stats.modesPlayed,
      difficultiesPlayed: stats.difficultiesPlayed,
      differentDaysPlayed: stats.differentDaysPlayed,
      todayGamesPlayed: stats.todayGamesPlayed,
      todayCorrect: stats.todayCorrect,
      todayScore: stats.todayScore,
      todayMaxStreak: stats.todayMaxStreak,
      todayPerfectGames: stats.todayPerfectGames,
      todayCategoriesPlayed: stats.todayCategoriesPlayed,
      todayDateKey: stats.todayDateKey,
    }
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
      lastSessionCategory: null,
      lastSessionMode: null,
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

// Helper: compute progress for a single mission
function computeMissionProgressForMission(
  mission: Mission,
  ctx: MissionContext,
  stats: ExtendedStats
): number {
  let current = 0
  const todayKey = getTodayKey()

  if (mission.type === "daily") {
    switch (mission.goal) {
      case "play-games": current = ctx.todayGamesPlayed; break
      case "answer-correct": current = ctx.todayCorrect; break
      case "earn-points": current = ctx.todayScore; break
      case "reach-streak": current = ctx.todayMaxStreak; break
      case "play-category":
        if (mission.id === "daily-vocab") current = ctx.todayCategoriesPlayed.includes("vocabulary") ? 1 : 0
        else if (mission.id === "daily-grammar") current = ctx.todayCategoriesPlayed.includes("grammar") ? 1 : 0
        else if (mission.id === "daily-conversation") current = ctx.todayCategoriesPlayed.includes("conversation") ? 1 : 0
        break
      case "perfect-game": current = ctx.todayPerfectGames; break
      default: current = 0
    }
  } else {
    switch (mission.goal) {
      case "play-games": current = ctx.totalGamesPlayed; break
      case "answer-correct": current = ctx.totalCorrect; break
      case "earn-points": current = ctx.totalScore; break
      case "reach-streak": current = ctx.maxStreak; break
      case "play-category": current = ctx.categoriesPlayed.length; break
      case "play-mode": current = ctx.modesPlayed.length; break
      case "play-difficulty": current = ctx.difficultiesPlayed.length; break
      case "perfect-game": current = ctx.perfectGames; break
      case "earn-achievement": current = ctx.unlockedAchievementsCount; break
      case "play-different-days": current = ctx.differentDaysPlayed.length; break
      default: current = 0
    }
  }

  return Math.min(current, mission.target)
}

// Export helper for components
export function isMissionClaimed(mission: Mission, claimedIds: string[]): boolean {
  const todayKey = getTodayKey()
  const claimedId = mission.type === "daily" ? `${mission.id}-${todayKey}` : mission.id
  return claimedIds.includes(claimedId)
}

export function isMissionComplete(mission: Mission, ctx: MissionContext, stats: ExtendedStats): boolean {
  const progress = computeMissionProgressForMission(mission, ctx, stats)
  return progress >= mission.target
}

export function getMissionProgress(mission: Mission, ctx: MissionContext, stats: ExtendedStats): number {
  return computeMissionProgressForMission(mission, ctx, stats)
}
