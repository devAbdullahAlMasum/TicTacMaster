"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/use-settings"
import { useThemeSystem } from "@/hooks/use-theme-system"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { setThemeName } = useThemeSystem()
  const { updateSettings } = useSettings()

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    setThemeName(newTheme as "light" | "dark")
    updateSettings({ theme: newTheme as "light" | "dark" | "system" })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-lg bg-white/10 text-white hover:bg-white/20 hover:text-white touch-manipulation"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
