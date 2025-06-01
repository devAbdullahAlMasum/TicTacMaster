"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState, useCallback } from "react"

interface GameBoardProps {
  board: string[][]
  onCellClick: (row: number, col: number) => void
  winnerLine?: number[][]
  disabled?: boolean
}

export function GameBoard({ board, onCellClick, winnerLine = [], disabled = false }: GameBoardProps) {
  const [showWinAnimation, setShowWinAnimation] = useState(false)

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

  const getCellSymbolColor = (symbol: string) => {
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

  const getCellGlowColor = (symbol: string) => {
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

  return (
    <div className="flex items-center justify-center p-6 relative">
      {/* Win celebration overlay */}
      {showWinAnimation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce">
            <div className="text-6xl animate-pulse">🎉</div>
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
          "grid gap-3 w-full max-w-md mx-auto transition-all duration-500",
          showWinAnimation && "scale-105",
        )}
        style={{ gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))` }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isWinnerCell = isCellInWinnerLine(rowIndex, colIndex)
            const cellKey = `${rowIndex}-${colIndex}`

            return (
              <button
                key={cellKey}
                className={cn(
                  "relative aspect-square flex items-center justify-center text-4xl font-bold rounded-2xl transition-all duration-300 transform group",
                  "border-2 border-slate-200/50 dark:border-slate-700/50",
                  "bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90",
                  "backdrop-blur-sm shadow-lg hover:shadow-xl",

                  // Winner cell styling
                  isWinnerCell && [
                    "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50",
                    "border-emerald-400/70 dark:border-emerald-600/70",
                    "shadow-emerald-300/50 dark:shadow-emerald-700/50",
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
                      "active:scale-95 cursor-pointer",
                      "hover:rotate-1",
                    ],

                  // Disabled state
                  disabled && "cursor-not-allowed opacity-60",

                  // Board size adjustments
                  board.length > 3 && "text-3xl",
                  board.length > 4 && "text-2xl",

                  // Filled cell effects
                  cell && ["shadow-inner", getCellGlowColor(cell), "hover:shadow-2xl"],
                )}
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={!!cell || disabled}
              >
                {/* Background glow effects */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl blur-sm"></div>
                </div>

                {/* Winner cell special effects */}
                {isWinnerCell && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 rounded-2xl blur-sm animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-emerald-400/20 to-blue-400/20 rounded-2xl animate-gradient-shift"></div>
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
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
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
