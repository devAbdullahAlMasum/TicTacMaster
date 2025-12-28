"use client"

import { useState } from "react"
import { Check, Palette, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useThemeSelector, useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"
import { ThemeName } from "@/lib/theme-manager"

interface ThemeSelectorProps {
  className?: string
  variant?: "button" | "compact" | "card"
}

export function ThemeSelector({ className, variant = "button" }: ThemeSelectorProps) {
  const { currentTheme, setTheme, availableThemes, isLoading } = useThemeSelector()
  const { getButtonStyles } = useThemeSystem()
  const [isOpen, setIsOpen] = useState(false)

  const themeDisplayNames: Record<ThemeName, string> = {
    light: "Light",
    dark: "Dark",
    ocean: "Ocean",
    forest: "Forest",
    sunset: "Sunset"
  }

  const themeColors: Record<ThemeName, string> = {
    light: "bg-gradient-to-r from-blue-500 to-indigo-600",
    dark: "bg-gradient-to-r from-slate-700 to-slate-900",
    ocean: "bg-gradient-to-r from-cyan-500 to-blue-600",
    forest: "bg-gradient-to-r from-green-500 to-emerald-600",
    sunset: "bg-gradient-to-r from-orange-500 to-red-600"
  }

  const handleThemeChange = (themeName: ThemeName) => {
    setTheme(themeName)
    setIsOpen(false)
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg bg-white/10 text-white hover:bg-white/20 hover:text-white touch-manipulation",
              className
            )}
            disabled={isLoading}
          >
            <Palette className="h-4 w-4" />
            <span className="sr-only">Select theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {availableThemes.map((theme) => (
            <DropdownMenuItem
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className={cn("w-4 h-4 rounded-full", themeColors[theme])} />
              <span className="flex-1">{themeDisplayNames[theme]}</span>
              {currentTheme === theme && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="text-sm font-medium">Theme</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              disabled={isLoading}
              className={cn(
                "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
                currentTheme === theme
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <div className={cn("w-8 h-8 rounded-full", themeColors[theme])} />
              <span className="text-xs font-medium">{themeDisplayNames[theme]}</span>
              {currentTheme === theme && (
                <div className="absolute -top-1 -right-1">
                  <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </Badge>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Default button variant
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2 min-w-[120px]",
            getButtonStyles("secondary", "default"),
            className
          )}
          disabled={isLoading}
        >
          <div className={cn("w-4 h-4 rounded-full", themeColors[currentTheme])} />
          <span>{themeDisplayNames[currentTheme]}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className={cn("w-4 h-4 rounded-full", themeColors[theme])} />
            <span className="flex-1">{themeDisplayNames[theme]}</span>
            {currentTheme === theme && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
