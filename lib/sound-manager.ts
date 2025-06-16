"use client"

import { useEffect, useState } from "react"
import { useSettings } from "@/hooks/use-settings"

// Helper function to play a sound
const playSound = (soundFile: string, volume: number) => {
  if (typeof window !== "undefined") {
    const audio = new Audio(soundFile)
    audio.volume = volume
    audio.play().catch((e) => {
      // Log errors but don't crash the app
      console.error(`Could not play sound: ${soundFile}`, e)
    })
  }
}

// Hook for using sound effects
export function useSoundEffects() {
  const { settings } = useSettings()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize sounds on first render
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  const playMoveSound = () => {
    if (settings?.soundEnabled) {
      playSound("/sounds/move.mp3", settings.soundVolume ?? 1)
    }
    if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15)
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  const playWinSound = () => {
    if (settings?.soundEnabled) {
      playSound("/sounds/win.mp3", settings.soundVolume ?? 1)
    }
    if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 50, 30])
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  const playDrawSound = () => {
    if (settings?.soundEnabled) {
      playSound("/sounds/draw.mp3", settings.soundVolume ?? 1)
    }
    if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([20, 30, 20])
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  const playErrorSound = () => {
    if (settings?.soundEnabled) {
      playSound("/sounds/error.mp3", settings.soundVolume ?? 1)
    }
    if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(50)
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  const playNotificationSound = () => {
    if (settings?.soundEnabled) {
      playSound("/sounds/notification.mp3", settings.soundVolume ?? 1)
    }
    if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([10, 20, 10])
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  const playClickSound = () => {
    if (settings?.soundEnabled) {
        // NOTE: click.mp3 is missing from /public/sounds
        playSound("/sounds/click.mp3", settings.soundVolume ?? 1)
    }
    if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(5)
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  return {
    playMoveSound,
    playWinSound,
    playDrawSound,
    playErrorSound,
    playNotificationSound,
    playClickSound,
  }
}
