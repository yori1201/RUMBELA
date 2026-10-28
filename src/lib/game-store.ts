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

// Extended stats for mission tracking + streak + check-in + history
export interface DayHistoryEntry {
  date: string // YYYY-MM-DD
  gamesPlayed: number
  correct: number
  score: number
  maxStreak: number
  perfectGames: number
  categoriesPlayed: CategoryId[]
}

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
  // Daily streak system
  dailyStreak: number // current consecutive days played
  longestStreak: number
  lastPlayedDate: string // YYYY-MM-DD of last game played
  // Daily check-in
  lastCheckInDate: string // YYYY-MM-DD of last claimed check-in
  totalCheckIns: number
  // 7-day history for charts
  history7Days: DayHistoryEntry[]
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
    streakIncreased: boolean
  }
  claimMissionReward: (missionId: string) => number // returns reward amount
  claimDailyCheckIn: () => { reward: number; isFirstCheckIn: boolean; streakBroken: boolean }
  canCheckInToday: () => boolean
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
  dailyStreak: 0,
  longestStreak: 0,
  lastPlayedDate: "",
  lastCheckInDate: "",
  totalCheckIns: 0,
  history7Days: [],
}

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getYesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Calculate days between two YYYY-MM-DD strings
function daysBetween(date1: string, date2: string): number {
  if (!date1 || !date2) return 0
  const d1 = new Date(date1 + "T00:00:00")
  const d2 = new Date(date2 + "T00:00:00")
  const diff = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Get last 7 days keys (oldest first, ending today)
function getLast7DaysKeys(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)
  }
  return days
}

// Build/update 7-day history entry for today
function updateHistory7Days(
  history: DayHistoryEntry[],
  todayKey: string,
  todayStats: { gamesPlayed: number; correct: number; score: number; maxStreak: number; perfectGames: number; categoriesPlayed: CategoryId[] }
): DayHistoryEntry[] {
  const last7 = getLast7DaysKeys()
  // Filter history to only include last 7 days
  const filtered = history.filter((h) => last7.includes(h.date))
  // Find or create today's entry
  const todayEntry = filtered.find((h) => h.date === todayKey)
  if (todayEntry) {
    // Update existing
    return filtered.map((h) =>
      h.date === todayKey
        ? {
            ...h,
            gamesPlayed: todayStats.gamesPlayed,
            correct: todayStats.correct,
            score: todayStats.score,
            maxStreak: todayStats.maxStreak,
            perfectGames: todayStats.perfectGames,
            categoriesPlayed: todayStats.categoriesPlayed,
          }
        : h
    )
  } else {
    // Add new entry for today
    return [
      ...filtered,
      {
        date: todayKey,
        ...todayStats,
      },
    ]
  }
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

    // Daily streak calculation:
    // - If first ever game: streak = 1
    // - If played yesterday (consecutive): streak += 1
    // - If already played today: streak unchanged (don't increment)
    // - If gap > 1 day: streak resets to 1
    const yesterdayKey = getYesterdayKey()
    let newDailyStreak = rolledStats.dailyStreak
    let streakIncreased = false
    if (rolledStats.lastPlayedDate !== todayKey) {
      // First game today
      if (rolledStats.lastPlayedDate === yesterdayKey) {
        // Consecutive day
        newDailyStreak = rolledStats.dailyStreak + 1
        streakIncreased = true
      } else if (rolledStats.lastPlayedDate === "") {
        // First ever game
        newDailyStreak = 1
        streakIncreased = true
      } else {
        // Streak broken
        newDailyStreak = 1
        streakIncreased = false
      }
    }

    const newTodayGamesPlayed = rolledStats.todayGamesPlayed + 1
    const newTodayCorrect = rolledStats.todayCorrect + correct
    const newTodayScore = rolledStats.todayScore + score
    const newTodayMaxStreak = Math.max(rolledStats.todayMaxStreak, maxStreak)
    const newTodayPerfectGames = rolledStats.todayPerfectGames + (isPerfect ? 1 : 0)
    const newTodayCategoriesPlayed = rolledStats.todayCategoriesPlayed.includes(category)
      ? rolledStats.todayCategoriesPlayed
      : [...rolledStats.todayCategoriesPlayed, category]

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
      todayGamesPlayed: newTodayGamesPlayed,
      todayCorrect: newTodayCorrect,
      todayScore: newTodayScore,
      todayMaxStreak: newTodayMaxStreak,
      todayPerfectGames: newTodayPerfectGames,
      todayCategoriesPlayed: newTodayCategoriesPlayed,
      // Streak
      dailyStreak: newDailyStreak,
      longestStreak: Math.max(rolledStats.longestStreak, newDailyStreak),
      lastPlayedDate: todayKey,
      // Update 7-day history
      history7Days: updateHistory7Days(rolledStats.history7Days, todayKey, {
        gamesPlayed: newTodayGamesPlayed,
        correct: newTodayCorrect,
        score: newTodayScore,
        maxStreak: newTodayMaxStreak,
        perfectGames: newTodayPerfectGames,
        categoriesPlayed: newTodayCategoriesPlayed,
      }),
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

    return { newAchievements, rank, completedMissions, streakIncreased }
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

  canCheckInToday: () => {
    const state = get()
    const todayKey = getTodayKey()
    return state.stats.lastCheckInDate !== todayKey
  },

  claimDailyCheckIn: () => {
    const state = get()
    const todayKey = getTodayKey()

    // Already checked in today
    if (state.stats.lastCheckInDate === todayKey) {
      return { reward: 0, isFirstCheckIn: false, streakBroken: false }
    }

    // Determine reward based on consecutive check-in streak
    const yesterdayKey = getYesterdayKey()
    let newCheckInStreak = 1
    let streakBroken = false

    if (state.stats.lastCheckInDate === "") {
      // First ever check-in
      newCheckInStreak = 1
    } else if (state.stats.lastCheckInDate === yesterdayKey) {
      // Consecutive day
      newCheckInStreak = state.stats.dailyStreak + 1
    } else {
      // Streak broken
      streakBroken = true
      newCheckInStreak = 1
    }

    // Reward scales with check-in streak (capped)
    const baseReward = 20
    const streakBonus = Math.min(newCheckInStreak * 5, 50)
    const reward = baseReward + streakBonus

    const newStats: ExtendedStats = {
      ...state.stats,
      totalScore: state.stats.totalScore + reward,
      todayScore: state.stats.todayScore + reward,
      lastCheckInDate: todayKey,
      totalCheckIns: state.stats.totalCheckIns + 1,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("rumbela-stats", JSON.stringify(newStats))
    }

    set({ stats: newStats })

    return {
      reward,
      isFirstCheckIn: state.stats.totalCheckIns === 0,
      streakBroken,
    }
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
