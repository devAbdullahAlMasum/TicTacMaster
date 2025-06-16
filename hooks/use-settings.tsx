"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type SettingsContextType = {
  settings: {
    theme: "light" | "dark" | "system"
    soundEnabled: boolean
    vibrationEnabled: boolean
    highContrastMode: boolean
    largeText: boolean
    autoSave: boolean
    showTimer: boolean
    defaultBoardSize: number
    difficulty: string
    playerName: string
    avatarId: number
    soundVolume: number
    defaultPlayerName?: string
    defaultAvatarId?: number
  }
  updateSettings: (newSettings: Partial<SettingsContextType["settings"]>) => void
  resetSettings: () => void
  saveSettings: () => void
}

const defaultSettings: SettingsContextType["settings"] = {
  theme: "system",
  soundEnabled: true,
  vibrationEnabled: true,
  highContrastMode: false,
  largeText: false,
  autoSave: true,
  showTimer: true,
  defaultBoardSize: 3,
  difficulty: "medium",
  playerName: "Player",
  avatarId: 1,
  soundVolume: 1,
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsContextType["settings"]>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("tictactoe-settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
    setIsLoaded(true)
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("tictactoe-settings", JSON.stringify(settings))
      } catch (error) {
        console.error("Failed to save settings:", error)
      }
    }
  }, [settings, isLoaded])

  const updateSettings = (newSettings: Partial<SettingsContextType["settings"]>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const saveSettings = () => {
    try {
      localStorage.setItem("tictactoe-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
