// ============================================================
// Sound Manager - Web Audio API
// Generate sound effects without external files
// ============================================================

type SoundType = "correct" | "wrong" | "click" | "win" | "lose" | "tick" | "select" | "achievement"

class SoundManager {
  private ctx: AudioContext | null = null
  private enabled = true

  constructor() {
    if (typeof window !== "undefined") {
      // Load preference
      const saved = localStorage.getItem("rumbela-sound-enabled")
      if (saved !== null) {
        this.enabled = saved === "true"
      }
    }
  }

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch {
        return null
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume()
    }
    return this.ctx
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== "undefined") {
      localStorage.setItem("rumbela-sound-enabled", String(enabled))
    }
  }

  isEnabled() {
    return this.enabled
  }

  play(type: SoundType) {
    if (!this.enabled) return
    const ctx = this.getCtx()
    if (!ctx) return

    const now = ctx.currentTime

    const playTone = (
      freq: number,
      start: number,
      duration: number,
      type: OscillatorType = "sine",
      volume = 0.15
    ) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, now + start)
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(volume, now + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration)
    }

    switch (type) {
      case "correct":
        // Happy ascending notes
        playTone(523.25, 0, 0.15, "sine", 0.18) // C5
        playTone(659.25, 0.08, 0.15, "sine", 0.18) // E5
        playTone(783.99, 0.16, 0.2, "sine", 0.18) // G5
        break
      case "wrong":
        // Descending sad notes
        playTone(311.13, 0, 0.2, "sawtooth", 0.12) // Eb4
        playTone(233.08, 0.12, 0.3, "sawtooth", 0.12) // Bb3
        break
      case "click":
        playTone(800, 0, 0.05, "square", 0.06)
        break
      case "select":
        playTone(440, 0, 0.08, "sine", 0.1)
        playTone(660, 0.05, 0.08, "sine", 0.1)
        break
      case "tick":
        playTone(1200, 0, 0.03, "square", 0.04)
        break
      case "win":
        // Victory fanfare
        playTone(523.25, 0, 0.12, "sine", 0.18)
        playTone(659.25, 0.1, 0.12, "sine", 0.18)
        playTone(783.99, 0.2, 0.12, "sine", 0.18)
        playTone(1046.5, 0.3, 0.3, "sine", 0.2)
        playTone(783.99, 0.4, 0.12, "sine", 0.15)
        playTone(1046.5, 0.5, 0.4, "sine", 0.2)
        break
      case "lose":
        playTone(392, 0, 0.25, "sine", 0.15)
        playTone(311.13, 0.2, 0.25, "sine", 0.15)
        playTone(261.63, 0.4, 0.5, "sine", 0.15)
        break
      case "achievement":
        // Sparkle sound
        playTone(880, 0, 0.1, "sine", 0.12)
        playTone(1108.73, 0.08, 0.1, "sine", 0.12)
        playTone(1318.51, 0.16, 0.15, "sine", 0.14)
        playTone(1760, 0.24, 0.2, "sine", 0.16)
        break
    }
  }
}

export const soundManager = new SoundManager()
