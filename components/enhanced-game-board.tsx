"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useSoundEffects } from "@/lib/sound-manager"
import { useSettings } from "@/hooks/use-settings"
import { useThemeSystem } from "@/hooks/use-theme-system"

interface EnhancedGameBoardProps {
  board: string[][]
  onCellClick: (row: number, col: number) => void
  winnerLine?: number[][]
  disabled?: boolean
}

export function EnhancedGameBoard({ 
  board, 
  onCellClick, 
  winnerLine = [], 
  disabled = false 
}: EnhancedGameBoardProps) {
  const { playMoveSound, playErrorSound } = useSoundEffects()
  const { settings } = useSettings()
  const { getStyles, currentTheme } = useThemeSystem()
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)

  // Trigger win animation when winner line appears
  useEffect(() => {
    if (winnerLine.length > 0) {
      setShowWinAnimation(true)
      const timer = setTimeout(() => setShowWinAnimation(false), 2000)
      return () => clearTimeout(timer)
    } else {
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

  // Get text size based on board size
  const getTextSize = (boardSize: number) => {
    if (boardSize <= 3) return "text-3xl md:text-4xl lg:text-5xl"
    if (boardSize <= 5) return "text-xl md:text-2xl lg:text-3xl"
    return "text-lg md:text-xl lg:text-2xl"
  }

  // Get cell symbol color from theme
  const getCellSymbolColor = (symbol: string) => {
    if (!currentTheme) return ""
    return symbol === "X" 
      ? getStyles("gameBoard.symbol.x")
      : getStyles("gameBoard.symbol.o")
  }

  // Get cell glow effect
  const getCellGlowColor = (symbol: string) => {
    if (symbol === "X") {
      return "shadow-blue-300/50 dark:shadow-blue-700/50"
    }
    return "shadow-red-300/50 dark:shadow-red-700/50"
  }

  if (!currentTheme) {
    return <div>Loading theme...</div>
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
          getStyles("animations.transition")
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
            const isLastMove = lastMove && lastMove[0] === rowIndex && lastMove[1] === colIndex
            const cellKey = `${rowIndex}-${colIndex}`

            return (
              <button
                key={cellKey}
                className={cn(
                  "relative aspect-square flex items-center justify-center font-bold rounded-xl group touch-manipulation",
                  getTextSize(board.length),
                  "border-2 backdrop-blur-sm shadow-lg hover:shadow-xl",
                  getStyles("animations.transition"),

                  // Base cell styling from theme
                  getStyles("gameBoard.cell.base"),

                  // High contrast mode
                  settings.highContrastMode && getStyles("border.secondary"),

                  // Winner cell styling
                  isWinnerCell && [
                    getStyles("gameBoard.cell.winner"),
                    "animate-winner-pulse",
                    showWinAnimation && "animate-winner-celebration",
                  ],

                  // Last move highlight
                  isLastMove && !isWinnerCell && "ring-2 ring-blue-400 ring-opacity-75",

                  // Empty cell hover effects
                  !cell && !disabled && [
                    getStyles("gameBoard.cell.hover"),
                    getStyles("animations.hover"),
                    "active:scale-95",
                    "hover:rotate-1",
                  ],

                  // Disabled state
                  disabled && getStyles("gameBoard.cell.disabled"),

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
                    <div className="absolute inset-0 rounded-xl blur-sm animate-pulse bg-gradient-to-br from-emerald-400/30 to-emerald-600/30"></div>
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
                  <span className={cn(
                    "opacity-0 group-hover:opacity-30 transition-opacity duration-200 select-none pointer-events-none",
                    getStyles("text.accent")
                  )}>
                    +
                  </span>
                )}

                {/* Last move indicator */}
                {isLastMove && !isWinnerCell && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
