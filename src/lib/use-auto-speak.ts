"use client"

import { useEffect, useRef } from "react"

interface UseAutoSpeakOptions {
  /** Text to speak */
  text: string
  /** Trigger - speak when this becomes true */
  when: boolean
  /** Unique key to identify the speak session (so it doesn't re-speak on re-render) */
  key: string | number
  /** Language code, default "en-US" */
  lang?: string
  /** Speech rate, default 0.9 (slightly slower for learners) */
  rate?: number
  /** Delay before speaking (ms), default 500 */
  delay?: number
}

/**
 * useAutoSpeak - hook to automatically speak text using Web Speech API
 * Triggers when `when` becomes true (e.g., when answer is submitted).
 * Use `key` to ensure it only speaks once per unique session.
 *
 * Example:
 *   useAutoSpeak({
 *     text: "apple",
 *     when: showResult,
 *     key: `${currentIdx}`,
 *   })
 */
export function useAutoSpeak({
  text,
  when,
  key,
  lang = "en-US",
  rate = 0.9,
  delay = 500,
}: UseAutoSpeakOptions) {
  const lastSpokenRef = useRef<string>("")

  useEffect(() => {
    if (!when) {
      // Reset tracker when condition becomes false (so next time it's true, it can speak again)
      lastSpokenRef.current = ""
      return
    }
    // Already spoken for this key
    if (lastSpokenRef.current === String(key)) return
    lastSpokenRef.current = String(key)

    const timer = setTimeout(() => {
      if (typeof window === "undefined" || !window.speechSynthesis) return
      if (!text) return

      window.speechSynthesis.cancel()
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang
        utterance.rate = rate
        utterance.pitch = 1
        utterance.volume = 1

        // Pick best English voice available
        const voices = window.speechSynthesis.getVoices()
        const enVoice =
          voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
          voices.find((v) => v.lang === "en-US") ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0]
        if (enVoice) utterance.voice = enVoice

        window.speechSynthesis.speak(utterance)
      } catch {
        // Silent fail - TTS not supported
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [when, key, text, lang, rate, delay])
}
