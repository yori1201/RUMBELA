"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, Lightbulb, Home, Volume2, VolumeX, RotateCw } from "lucide-react"
import {
  generateMathQuestions,
  MATH_LEVELS,
  type MathLevel,
  type MathQuestion,
} from "@/lib/math-data"
import { soundManager } from "@/lib/sound"
import { Button } from "@/components/ui/button"
import HUD from "./HUD"
import Mascot from "./Mascot"

interface MathModeProps {
  level: MathLevel
  onComplete: (result: {
    score: number
    correct: number
    total: number
    maxStreak: number
  }) => void
  onExit: () => void
}

// ===== TTS Hook (Web Speech API) =====
function useTTS() {
  const speakRef = useRef<((text: string, rate?: number) => void) | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("speechSynthesis" in window)) return

    speakRef.current = (text: string, rate = 0.9) => {
      try {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(text)
        u.lang = "id-ID"
        u.rate = rate
        u.pitch = 1.1
        const voices = window.speechSynthesis.getVoices()
        const idVoice = voices.find((v) => v.lang.startsWith("id"))
        if (idVoice) u.voice = idVoice
        window.speechSynthesis.speak(u)
      } catch (e) {
        console.warn("TTS error:", e)
      }
    }
  }, [])

  return speakRef
}

// Bubble colors (rotation untuk variasi visual)
const BUBBLE_COLORS = [
  { bg: "from-pink-400 to-rose-500", ring: "ring-pink-300", glow: "shadow-pink-300/50" },
  { bg: "from-sky-400 to-blue-500", ring: "ring-sky-300", glow: "shadow-sky-300/50" },
  { bg: "from-emerald-400 to-teal-500", ring: "ring-emerald-300", glow: "shadow-emerald-300/50" },
  { bg: "from-amber-400 to-orange-500", ring: "ring-amber-300", glow: "shadow-amber-300/50" },
  { bg: "from-violet-400 to-purple-500", ring: "ring-violet-300", glow: "shadow-violet-300/50" },
  { bg: "from-cyan-400 to-teal-500", ring: "ring-cyan-300", glow: "shadow-cyan-300/50" },
]

export default function MathMode({ level, onComplete, onExit }: MathModeProps) {
  const levelInfo = MATH_LEVELS.find((l) => l.id === level)!
  const maxLives = levelInfo.maxLives
  const questionTime = levelInfo.timePerQuestion

  // Generate soal sekali per mount
  const questions = useMemo(
    () => generateMathQuestions(level, levelInfo.questionCount),
    [level, levelInfo.questionCount]
  )

  // State
  const [currentIdx, setCurrentIdx] = useState(0)
  const [lives, setLives] = useState(maxLives)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [timeLeft, setTimeLeft] = useState(questionTime)
  const [correctCount, setCorrectCount] = useState(0)
  const [soundOn, setSoundOn] = useState(soundManager.isEnabled())
  const [popBubbles, setPopBubbles] = useState<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speakRef = useTTS()
  const hasSpokenRef = useRef(false)

  const currentQuestion = questions[currentIdx]
  const totalQuestions = questions.length

  // ===== TTS: ucapkan soal saat ganti soal =====
  useEffect(() => {
    if (!currentQuestion || hasSpokenRef.current) return
    hasSpokenRef.current = true
    // Delay sedikit supaya audio context ready
    const t = setTimeout(() => {
      if (speakRef.current) speakRef.current(currentQuestion.promptSpeech, 0.9)
    }, 400)
    return () => clearTimeout(t)
  }, [currentQuestion, speakRef])

  // ===== Timer =====
  useEffect(() => {
    if (showResult) return
    if (timeLeft <= 0) {
      handleAnswer(-1) // timeout
      return
    }
    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => t - 1)
      if (timeLeft <= 5 && timeLeft > 0) soundManager.play("tick")
    }, 1000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeLeft, showResult])

  const handleAnswer = useCallback(
    (selectedValue: number) => {
      if (showResult || !currentQuestion) return
      if (timerRef.current) clearTimeout(timerRef.current)

      const isCorrect = selectedValue === currentQuestion.answer
      const isTimeout = selectedValue === -1

      setSelectedAnswer(selectedValue)

      if (isCorrect) {
        soundManager.play("correct")
        const timeBonus = Math.max(0, Math.floor(timeLeft / 2))
        const streakBonus = streak >= 2 ? Math.min(streak * 5, 25) : 0
        const gained = currentQuestion.points + timeBonus + streakBonus
        setScore((s) => s + gained)
        setStreak((s) => {
          const ns = s + 1
          setMaxStreak((m) => Math.max(m, ns))
          return ns
        })
        setCorrectCount((c) => c + 1)
        // Ucapkan jawaban benar
        if (speakRef.current) {
          speakRef.current(`Benar! ${currentQuestion.answer}`, 0.95)
        }
        // Pop bubble yang benar
        if (currentQuestion.type === "number-recognition") {
          setPopBubbles(new Set([currentQuestion.answer]))
        }
      } else {
        soundManager.play("wrong")
        setLives((l) => l - 1)
        setStreak(0)
        if (speakRef.current && !isTimeout) {
          speakRef.current(`Salah. Jawaban yang benar adalah ${currentQuestion.answer}`, 0.95)
        }
      }

      setShowResult(true)

      setTimeout(() => {
        if (lives - (isCorrect ? 0 : 1) <= 0) {
          // Game over
          onComplete({
            score,
            correct: correctCount + (isCorrect ? 1 : 0),
            total: currentIdx + 1,
            maxStreak: Math.max(maxStreak, streak + (isCorrect ? 1 : 0)),
          })
          return
        }
        if (currentIdx + 1 >= totalQuestions) {
          onComplete({
            score: score + (isCorrect ? currentQuestion.points : 0),
            correct: correctCount + (isCorrect ? 1 : 0),
            total: totalQuestions,
            maxStreak: Math.max(maxStreak, streak + (isCorrect ? 1 : 0)),
          })
          return
        }
        // Next question
        setCurrentIdx((i) => i + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        setShowHint(false)
        setTimeLeft(questionTime)
        setPopBubbles(new Set())
        hasSpokenRef.current = false
      }, 1800)
    },
    [showResult, currentQuestion, timeLeft, streak, lives, currentIdx, totalQuestions, score, correctCount, maxStreak, questionTime, onComplete, speakRef]
  )

  const handleReplaySound = () => {
    if (speakRef.current && currentQuestion) {
      soundManager.play("click")
      speakRef.current(currentQuestion.promptSpeech, 0.9)
    }
  }

  const toggleSound = () => {
    const newVal = !soundOn
    setSoundOn(newVal)
    soundManager.setEnabled(newVal)
    if (newVal) soundManager.play("click")
  }

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen w-full px-4 py-4">
      {/* Top bar */}
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            soundManager.play("click")
            onExit()
          }}
          className="rounded-full"
        >
          <Home className="h-4 w-4" /> Keluar
        </Button>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
            {levelInfo.icon} {levelInfo.name}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSound}
            className="h-8 w-8 rounded-full"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4">
        {/* HUD */}
        <HUD
          score={score}
          lives={lives}
          maxLives={maxLives}
          streak={streak}
          questionNumber={currentIdx + 1}
          totalQuestions={totalQuestions}
          timeLeft={timeLeft}
          maxTime={questionTime}
        />

        {/* Mascot */}
        <div className="flex justify-center">
          <Mascot
            mood={
              showResult
                ? selectedAnswer === currentQuestion.answer
                  ? "happy"
                  : "sad"
                : "thinking"
            }
            size={80}
          />
        </div>

        {/* Question Card */}
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-100"
        >
          {/* Prompt */}
          <div className="mb-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                {levelInfo.emoji} {typeLabel(currentQuestion.type)}
              </span>
            </div>
            <h2 className="text-xl font-black leading-tight text-slate-800 sm:text-2xl">
              {currentQuestion.prompt}
            </h2>
            <button
              onClick={handleReplaySound}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
              <Volume2 className="h-3 w-3" /> Putar suara lagi
            </button>
          </div>

          {/* Count-objects visual */}
          {currentQuestion.type === "count-objects" && currentQuestion.objects && (
            <div className="mb-4 flex flex-wrap justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
              {currentQuestion.objects.map((obj, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="text-4xl"
                >
                  {obj}
                </motion.span>
              ))}
            </div>
          )}

          {/* Hint (if shown) */}
          <AnimatePresence>
            {showHint && currentQuestion.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800"
              >
                <Lightbulb className="mr-1 inline h-4 w-4" />
                {currentQuestion.hint}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== Bubble Answer Area ===== */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt
              const isCorrect = opt === currentQuestion.answer
              const isPopped = popBubbles.has(opt)
              const color = BUBBLE_COLORS[idx % BUBBLE_COLORS.length]

              return (
                <motion.button
                  key={`${currentIdx}-${idx}`}
                  initial={{ scale: 0, y: -20 }}
                  animate={{
                    scale: isPopped ? 0 : 1,
                    y: 0,
                    opacity: isPopped ? 0 : 1,
                  }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 200 }}
                  whileHover={!showResult ? { scale: 1.08, y: -4 } : {}}
                  whileTap={!showResult ? { scale: 0.92 } : {}}
                  onClick={() => handleAnswer(opt)}
                  disabled={showResult}
                  className={`relative aspect-square rounded-full bg-gradient-to-br ${color.bg} p-0 shadow-xl ring-4 ${color.ring} ${color.glow} transition-all`}
                  style={{
                    boxShadow: showResult && isCorrect
                      ? "0 0 30px rgba(88, 204, 2, 0.8)"
                      : showResult && isSelected && !isCorrect
                      ? "0 0 30px rgba(239, 68, 68, 0.6)"
                      : undefined,
                  }}
                >
                  {/* Bubble shine effect */}
                  <div className="absolute left-1/4 top-1/5 h-6 w-6 rounded-full bg-white/40 blur-sm" />

                  {/* Number */}
                  <span className="relative z-10 flex h-full items-center justify-center text-2xl font-black text-white drop-shadow-lg sm:text-3xl">
                    {opt}
                  </span>

                  {/* Result overlay */}
                  {showResult && isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-500/80"
                    >
                      <Check className="h-10 w-10 text-white" strokeWidth={4} />
                    </motion.div>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-rose-500/80"
                    >
                      <X className="h-10 w-10 text-white" strokeWidth={4} />
                    </motion.div>
                  )}

                  {/* Pop animation overlay */}
                  {isPopped && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 rounded-full border-4 border-white"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Hint button */}
        {!showResult && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                soundManager.play("click")
                setShowHint((s) => !s)
              }}
              className="text-xs text-amber-600 hover:text-amber-700"
            >
              <Lightbulb className="mr-1 h-4 w-4" />
              {showHint ? "Sembunyikan petunjuk" : "Butuh petunjuk?"}
            </Button>
          </div>
        )}

        {/* Result overlay */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`rounded-2xl p-4 text-center shadow-lg ${
                selectedAnswer === currentQuestion.answer
                  ? "bg-gradient-to-br from-emerald-50 to-teal-50 ring-2 ring-emerald-200"
                  : "bg-gradient-to-br from-rose-50 to-pink-50 ring-2 ring-rose-200"
              }`}
            >
              <p className="text-lg font-black">
                {selectedAnswer === currentQuestion.answer
                  ? `🎉 Benar! +${currentQuestion.points} poin`
                  : selectedAnswer === -1
                  ? `⏰ Waktu habis! Jawaban: ${currentQuestion.answer}`
                  : `❌ Jawaban benar: ${currentQuestion.answer}`}
              </p>
              {streak >= 2 && selectedAnswer === currentQuestion.answer && (
                <p className="mt-1 text-sm font-bold text-orange-600">
                  🔥 Streak {streak}x!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative floating bubbles */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function typeLabel(type: string): string {
  switch (type) {
    case "number-recognition":
      return "Pecah Balon"
    case "count-objects":
      return "Hitung Benda"
    case "arithmetic":
      return "Hitung Cepat"
    case "comparison":
      return "Bandingkan"
    case "sequence":
      return "Lanjut Pola"
    default:
      return "Soal"
  }
}
