"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useTheme as useNextTheme } from "next-themes"
import { 
  Theme, 
  ThemeName, 
  AVAILABLE_THEMES, 
  loadTheme, 
  applyThemeToDocument,
  getComponentStyles,
  getButtonClasses,
  getCardClasses,
  getInputClasses
} from "@/lib/theme-manager"

interface ThemeSystemContextType {
  // Current theme data
  currentTheme: Theme | null
  themeName: ThemeName
  isLoading: boolean
  
  // Theme switching
  setThemeName: (name: ThemeName) => void
  availableThemes: readonly ThemeName[]
  
  // Utility functions
  getStyles: (componentPath: string) => string
  getButtonStyles: (variant?: "primary" | "secondary" | "ghost", size?: "sm" | "default" | "lg", className?: string) => string
  getCardStyles: (className?: string) => string
  getInputStyles: (hasError?: boolean, className?: string) => string
  
  // Next-themes integration
  systemTheme: string | undefined
  resolvedTheme: string | undefined
  setSystemTheme: (theme: string) => void
}

const ThemeSystemContext = createContext<ThemeSystemContextType | undefined>(undefined)

interface ThemeSystemProviderProps {
  children: ReactNode
  defaultTheme?: ThemeName
}

export function ThemeSystemProvider({ 
  children, 
  defaultTheme = "light" 
}: ThemeSystemProviderProps) {
  const { theme: systemTheme, setTheme: setSystemTheme, resolvedTheme } = useNextTheme()
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)
  const [themeName, setThemeNameState] = useState<ThemeName>(defaultTheme)
  const [isLoading, setIsLoading] = useState(true)

  // Load theme when theme name changes
  useEffect(() => {
    let isCancelled = false
    
    async function loadAndApplyTheme() {
      setIsLoading(true)
      try {
        const theme = await loadTheme(themeName)
        if (!isCancelled) {
          setCurrentTheme(theme)
          applyThemeToDocument(theme)
        }
      } catch (error) {
        console.error("Failed to load theme:", error)
        if (!isCancelled && themeName !== "light") {
          // Fallback to light theme
          setThemeNameState("light")
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadAndApplyTheme()
    
    return () => {
      isCancelled = true
    }
  }, [themeName])

  // Handle system theme changes
  useEffect(() => {
    if (resolvedTheme && (resolvedTheme === "light" || resolvedTheme === "dark")) {
      const newThemeName = resolvedTheme as ThemeName
      if (AVAILABLE_THEMES.includes(newThemeName) && newThemeName !== themeName) {
        setThemeNameState(newThemeName)
      }
    }
  }, [resolvedTheme, themeName])

  // Force theme reload when theme name changes
  useEffect(() => {
    if (currentTheme && typeof window !== "undefined") {
      // Apply theme immediately to document
      const root = document.documentElement
      root.setAttribute("data-theme", themeName)
      root.className = root.className.replace(/theme-\w+/g, '') + ` theme-${themeName}`
    }
  }, [currentTheme, themeName])

  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-name", themeName)
    }
  }, [themeName])

  // Load theme preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme-name") as ThemeName
      if (savedTheme && AVAILABLE_THEMES.includes(savedTheme)) {
        setThemeNameState(savedTheme)
      }
    }
  }, [])

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name)
    // Also update next-themes if it's a basic theme
    if (name === "light" || name === "dark") {
      setSystemTheme(name)
    }
  }

  const getStyles = (componentPath: string): string => {
    if (!currentTheme) return ""
    return getComponentStyles(currentTheme, componentPath)
  }

  const getButtonStyles = (
    variant: "primary" | "secondary" | "ghost" = "primary",
    size: "sm" | "default" | "lg" = "default",
    className?: string
  ): string => {
    if (!currentTheme) return ""
    return getButtonClasses(currentTheme, variant, size, className)
  }

  const getCardStyles = (className?: string): string => {
    if (!currentTheme) return ""
    return getCardClasses(currentTheme, className)
  }

  const getInputStyles = (hasError?: boolean, className?: string): string => {
    if (!currentTheme) return ""
    return getInputClasses(currentTheme, hasError, className)
  }

  const value: ThemeSystemContextType = {
    currentTheme,
    themeName,
    isLoading,
    setThemeName,
    availableThemes: AVAILABLE_THEMES,
    getStyles,
    getButtonStyles,
    getCardStyles,
    getInputStyles,
    systemTheme,
    resolvedTheme,
    setSystemTheme
  }

  return (
    <ThemeSystemContext.Provider value={value}>
      {children}
    </ThemeSystemContext.Provider>
  )
}

export function useThemeSystem() {
  const context = useContext(ThemeSystemContext)
  if (context === undefined) {
    throw new Error("useThemeSystem must be used within a ThemeSystemProvider")
  }
  return context
}

// Convenience hooks for specific use cases
export function useThemeStyles() {
  const { getStyles, currentTheme } = useThemeSystem()
  return { getStyles, theme: currentTheme }
}

export function useThemeComponents() {
  const { getButtonStyles, getCardStyles, getInputStyles, currentTheme } = useThemeSystem()
  return { 
    getButtonStyles, 
    getCardStyles, 
    getInputStyles, 
    theme: currentTheme 
  }
}

export function useThemeSelector() {
  const { themeName, setThemeName, availableThemes, isLoading } = useThemeSystem()
  return { 
    currentTheme: themeName, 
    setTheme: setThemeName, 
    availableThemes, 
    isLoading 
  }
}
