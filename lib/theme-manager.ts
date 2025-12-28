import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Theme interface definitions
export interface ThemeColors {
  primary: Record<string, string>
  secondary: Record<string, string>
  accent: Record<string, string>
  success?: Record<string, string>
  warning?: Record<string, string>
  error?: Record<string, string>
}

export interface ThemeComponents {
  background: {
    primary: string
    secondary: string
    tertiary: string
    gradient: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    accent: string
    muted: string
  }
  border: {
    primary: string
    secondary: string
    accent: string
    focus: string
  }
  button: {
    primary: {
      base: string
      hover: string
      active: string
      disabled: string
    }
    secondary: {
      base: string
      hover: string
      active: string
      disabled: string
    }
    ghost: {
      base: string
      hover: string
      active: string
    }
  }
  card: {
    base: string
    hover: string
    focus: string
  }
  input: {
    base: string
    focus: string
    error: string
  }
  sidebar: {
    background: string
    text: string
    accent: string
    hover: string
  }
  gameBoard: {
    cell: {
      base: string
      hover: string
      winner: string
      disabled: string
    }
    symbol: {
      x: string
      o: string
    }
  }
}

export interface ThemeAnimations {
  transition: string
  hover: string
  pulse: string
  bounce: string
  fade: string
}

export interface Theme {
  name: string
  type: "light" | "dark"
  colors: ThemeColors
  components: ThemeComponents
  animations: ThemeAnimations
}

// Available themes
export const AVAILABLE_THEMES = [
  "light",
  "dark", 
  "ocean",
  "forest",
  "sunset"
] as const

export type ThemeName = typeof AVAILABLE_THEMES[number]

// Theme cache
const themeCache = new Map<ThemeName, Theme>()

// Load theme from JSON file
export async function loadTheme(themeName: ThemeName): Promise<Theme> {
  if (themeCache.has(themeName)) {
    return themeCache.get(themeName)!
  }

  try {
    const response = await fetch(`/themes/${themeName}.json`)

    if (!response.ok) {
      throw new Error(`Failed to load theme: ${themeName} (${response.status})`)
    }

    const theme: Theme = await response.json()
    themeCache.set(themeName, theme)
    return theme
  } catch (error) {
    console.error(`Error loading theme ${themeName}:`, error)
    // Fallback to light theme
    if (themeName !== "light") {
      return loadTheme("light")
    }
    throw error
  }
}

// Get theme classes utility
export function getThemeClasses(theme: Theme, component: string, variant?: string): string {
  const components = theme.components as any
  
  if (!components[component]) {
    return ""
  }

  if (variant && components[component][variant]) {
    if (typeof components[component][variant] === "object") {
      return Object.values(components[component][variant]).join(" ")
    }
    return components[component][variant]
  }

  if (typeof components[component] === "object" && !variant) {
    return Object.values(components[component]).join(" ")
  }

  return components[component] || ""
}

// Theme-aware className utility
export function themeClasses(theme: Theme, ...classes: ClassValue[]): string {
  return twMerge(clsx(classes))
}

// Get component styles from theme
export function getComponentStyles(theme: Theme, componentPath: string): string {
  const paths = componentPath.split(".")
  let current: any = theme.components
  
  for (const path of paths) {
    if (current && typeof current === "object" && path in current) {
      current = current[path]
    } else {
      return ""
    }
  }
  
  if (typeof current === "string") {
    return current
  }
  
  if (typeof current === "object") {
    return Object.values(current).join(" ")
  }
  
  return ""
}

// Apply theme to document
export function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement
  
  // Set theme type class
  root.classList.remove("light", "dark")
  root.classList.add(theme.type)
  
  // Set CSS custom properties for colors
  Object.entries(theme.colors).forEach(([colorName, colorShades]) => {
    Object.entries(colorShades).forEach(([shade, value]) => {
      root.style.setProperty(`--color-${colorName}-${shade}`, value)
    })
  })
  
  // Set theme name attribute
  root.setAttribute("data-theme", theme.name.toLowerCase())
}

// Get theme-aware button classes
export function getButtonClasses(
  theme: Theme, 
  variant: "primary" | "secondary" | "ghost" = "primary",
  size: "sm" | "default" | "lg" = "default",
  className?: string
): string {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none"
  
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-11 px-8"
  }
  
  const variantClasses = getComponentStyles(theme, `button.${variant}`)
  
  return themeClasses(
    theme,
    baseClasses,
    sizeClasses[size],
    variantClasses,
    theme.animations.transition,
    className
  )
}

// Get theme-aware card classes
export function getCardClasses(theme: Theme, className?: string): string {
  const baseClasses = "rounded-lg border shadow-sm"
  const cardClasses = getComponentStyles(theme, "card")
  
  return themeClasses(
    theme,
    baseClasses,
    cardClasses,
    theme.animations.transition,
    className
  )
}

// Get theme-aware input classes
export function getInputClasses(theme: Theme, hasError?: boolean, className?: string): string {
  const baseClasses = "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  
  const inputClasses = hasError 
    ? getComponentStyles(theme, "input.error")
    : getComponentStyles(theme, "input.base") + " " + getComponentStyles(theme, "input.focus")
  
  return themeClasses(
    theme,
    baseClasses,
    inputClasses,
    theme.animations.transition,
    className
  )
}

// Export utility function for merging classes (same as existing cn function)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
