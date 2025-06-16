"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useSoundEffects } from "@/lib/sound-manager"
import { useSettings } from "@/hooks/use-settings"

interface GameBoardProps {
  board: string[][]
  onCellClick: (row: number, col: number) => void
  winnerLine?: number[][]
  disabled?: boolean
}

export function GameBoard({ board, onCellClick, winnerLine = [], disabled = false }: GameBoardProps) {
  const { playMoveSound, playErrorSound } = useSoundEffects()
  const { settings } = useSettings()
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)

  // Trigger win animation when winner line appears
  useEffect(() => {
    if (winnerLine.length > 0) {
      setShowWinAnimation(true)
      // Reset animation after it completes
      const timer = setTimeout(() => setShowWinAnimation(false), 2000)
      return () => clearTimeout(timer)
    } else {
      // Reset win animation when game is reset or no winner
      setShowWinAnimation(false)
    }
  }, [winnerLine])

  const isCellInWinnerLine = useCallback(
    (row: number, col: number) => {
      return winnerLine?.some(([r, c]) => r === row && c === col) || false
    },
    [winnerLine],
  )

  // Handle cell click with sound and vibration
  const handleCellClick = (row: number, col: number) => {
    if (disabled || board[row][col] !== "") {
      playErrorSound()
      return
    }

    // Vibration feedback if enabled
    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50)
    }

    setLastMove([row, col])
    playMoveSound()
    onCellClick(row, col)
  }

  const getCellSymbolColor = (symbol: string) => {
    if (settings.highContrastMode) {
      // High contrast colors
      switch (symbol) {
        case "X":
          return "text-blue-700 dark:text-blue-300"
        case "O":
          return "text-red-700 dark:text-red-300"
        case "Δ":
          return "text-yellow-700 dark:text-yellow-300"
        case "□":
          return "text-green-700 dark:text-green-300"
        default:
          return "text-gray-700 dark:text-gray-300"
      }
    } else {
      // Regular colors
      switch (symbol) {
        case "X":
          return "text-blue-600 dark:text-blue-400"
        case "O":
          return "text-rose-600 dark:text-rose-400"
        case "Δ":
          return "text-amber-600 dark:text-amber-400"
        case "□":
          return "text-emerald-600 dark:text-emerald-400"
        default:
          return "text-gray-600 dark:text-gray-400"
      }
    }
  }

  const getCellGlowColor = (symbol: string) => {
    if (settings.highContrastMode) {
      // High contrast shadow colors
      switch (symbol) {
        case "X":
          return "shadow-blue-700/50"
        case "O":
          return "shadow-red-700/50"
        case "Δ":
          return "shadow-yellow-700/50"
        case "□":
          return "shadow-green-700/50"
        default:
          return "shadow-gray-700/50"
      }
    } else {
      // Regular shadow colors
      switch (symbol) {
        case "X":
          return "shadow-blue-500/50"
        case "O":
          return "shadow-rose-500/50"
        case "Δ":
          return "shadow-amber-500/50"
        case "□":
          return "shadow-emerald-500/50"
        default:
          return "shadow-gray-500/50"
      }
    }
  }

  // Determine text size based on board size and accessibility settings
  const getTextSize = (boardSize: number) => {
    const baseSize = settings.largeText ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"

    if (boardSize > 3) {
      return settings.largeText ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
    }
    if (boardSize > 4) {
      return settings.largeText ? "text-xl md:text-2xl" : "text-lg md:text-xl"
    }

    return baseSize
  }

  return (
    <div className="flex items-center justify-center p-4 md:p-6 relative">
      {/* Win celebration overlay */}
      {showWinAnimation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce">
            <div className="text-4xl md:text-6xl animate-pulse">🎉</div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 animate-pulse rounded-3xl"></div>
          {/* Confetti effect */}
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-200"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-400"></div>
          <div className="absolute bottom-0 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-600"></div>
        </div>
      )}

      <div
        className={cn(
          "grid gap-2 sm:gap-3 w-full max-w-md mx-auto transition-all duration-500",
          showWinAnimation && "scale-105",
        )}
        style={{
          gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`,
          width: "100%",
          maxWidth: board.length > 3 ? "400px" : "350px",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isWinnerCell = isCellInWinnerLine(rowIndex, colIndex)
            const cellKey = `${rowIndex}-${colIndex}`

            return (
              <button
                key={cellKey}
                className={cn(
                  "relative aspect-square flex items-center justify-center font-bold rounded-xl transition-all duration-300 transform group touch-manipulation",
                  getTextSize(board.length),
                  "border-2 border-slate-200/50 dark:border-slate-700/50",
                  "bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90",
                  "backdrop-blur-sm shadow-lg hover:shadow-xl",

                  // High contrast mode
                  settings.highContrastMode && "border-slate-300 dark:border-slate-600",

                  // Winner cell styling
                  isWinnerCell && [
                    settings.highContrastMode
                      ? "bg-gradient-to-br from-green-200 to-green-300 dark:from-green-800/50 dark:to-green-700/50 border-green-500/70 dark:border-green-600/70"
                      : "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 border-emerald-400/70 dark:border-emerald-600/70",
                    settings.highContrastMode
                      ? "shadow-green-500/50 dark:shadow-green-700/50"
                      : "shadow-emerald-300/50 dark:shadow-emerald-700/50",
                    "animate-winner-pulse",
                    showWinAnimation && "animate-winner-celebration",
                  ],

                  // Empty cell hover effects
                  !cell &&
                    !disabled && [
                      "hover:bg-gradient-to-br hover:from-blue-50/90 hover:to-indigo-50/90",
                      "dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30",
                      "hover:border-blue-300/50 dark:hover:border-blue-600/50",
                      "hover:scale-105 hover:shadow-2xl",
                      "active:scale-95",
                      "hover:rotate-1",
                    ],

                  // Disabled state
                  disabled && "cursor-not-allowed opacity-60",

                  // Filled cell effects
                  cell && ["shadow-inner", getCellGlowColor(cell), "hover:shadow-2xl"],
                )}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!!cell || disabled}
                aria-label={
                  cell ? `Cell ${rowIndex}-${colIndex} contains ${cell}` : `Empty cell ${rowIndex}-${colIndex}`
                }
              >
                {/* Background glow effects */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-xl blur-sm"></div>
                </div>

                {/* Winner cell special effects */}
                {isWinnerCell && (
                  <>
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl blur-sm animate-pulse",
                        settings.highContrastMode
                          ? "bg-gradient-to-br from-green-400/30 to-green-600/30"
                          : "bg-gradient-to-br from-emerald-400/30 to-emerald-600/30",
                      )}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-emerald-400/20 to-blue-400/20 rounded-xl animate-gradient-shift"></div>
                  </>
                )}

                {/* Cell content */}
                {cell ? (
                  <span
                    className={cn(
                      "relative z-10 transform transition-all duration-500 ease-out",
                      getCellSymbolColor(cell),
                      "drop-shadow-lg animate-cell-appear",
                      isWinnerCell && ["animate-winner-symbol", "filter drop-shadow-[0_0_8px_currentColor]"],
                    )}
                  >
                    {cell}
                  </span>
                ) : (
                  // Hover preview
                  <span className="opacity-0 group-hover:opacity-30 transition-opacity duration-200 text-blue-500 dark:text-blue-400 select-none pointer-events-none">
                    +
                  </span>
                )}

                {/* Ripple effect on click */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 -translate-x-full group-active:translate-x-full transition-transform duration-500"></div>
                </div>
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
