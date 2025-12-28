"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"

interface PageLoaderProps {
  children: React.ReactNode
}

export function PageLoader({ children }: PageLoaderProps) {
  const pathname = usePathname()
  const { currentTheme, getStyles } = useThemeSystem()
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsLoading(true)
    
    // Simulate page load time for smooth transitions
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!mounted || !currentTheme) {
    return <LoadingScreen />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className={cn("min-h-screen", getStyles("animations.fade"))}>
      {children}
    </div>
  )
}

function LoadingScreen() {
  const { getStyles, currentTheme } = useThemeSystem()

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center",
      currentTheme ? getStyles("background.gradient") : "bg-gradient-to-br from-slate-50 to-blue-50"
    )}>
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className={cn(
          "mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
          currentTheme ? getStyles("sidebar.background") : "bg-gradient-to-br from-blue-600 to-indigo-600"
        )}>
          <div className="text-2xl font-bold text-white">T</div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className={cn(
            "text-xl font-semibold",
            currentTheme ? getStyles("text.primary") : "text-gray-900"
          )}>
            Loading TicTacMaster...
          </div>
          
          {/* Progress Bar */}
          <div className={cn(
            "w-64 h-2 rounded-full overflow-hidden mx-auto",
            currentTheme ? getStyles("background.secondary") : "bg-gray-200"
          )}>
            <div className={cn(
              "h-full rounded-full animate-pulse",
              currentTheme ? getStyles("sidebar.background") : "bg-gradient-to-r from-blue-600 to-indigo-600"
            )} style={{ width: "100%", animation: "loading 1.5s ease-in-out infinite" }} />
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full animate-bounce",
                currentTheme ? getStyles("text.accent") : "bg-blue-600"
              )}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
