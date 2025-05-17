"use client"

import { cn } from "@/lib/utils"

interface GameBoardProps {
  board: string[][]
  onCellClick: (row: number, col: number) => void
  winnerLine?: number[][]
  disabled?: boolean
}

export function GameBoard({ board, onCellClick, winnerLine = [], disabled = false }: GameBoardProps) {
  const isCellInWinnerLine = (row: number, col: number) => {
    return winnerLine?.some(([r, c]) => r === row && c === col) || false
  }

  return (
    <div
      className={`grid gap-2 max-w-xs mx-auto`}
      style={{ gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))` }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              "h-20 w-full flex items-center justify-center text-3xl font-bold rounded-lg transition-all",
              "border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900",
              isCellInWinnerLine(rowIndex, colIndex) &&
                "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 border-green-500/50",
              !cell &&
                !disabled &&
                "hover:bg-gradient-to-br hover:from-indigo-100 hover:to-blue-200 dark:hover:from-indigo-900 dark:hover:to-blue-800 hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-95",
              disabled && "cursor-not-allowed opacity-80",
              board.length > 3 && "h-16 text-2xl",
              board.length > 4 && "h-12 text-xl",
            )}
            onClick={() => onCellClick(rowIndex, colIndex)}
            disabled={!!cell || disabled}
          >
            {cell ? (
              <span
                className={cn(
                  "transform transition-all duration-200 scale-100",
                  cell === "X" && "text-blue-500 dark:text-blue-400",
                  cell === "O" && "text-rose-500 dark:text-rose-400",
                  cell === "Δ" && "text-amber-500 dark:text-amber-400",
                  "animate-appear",
                )}
              >
                {cell}
              </span>
            ) : (
              <span className="opacity-0">{cell}</span>
            )}
          </button>
        )),
      )}
    </div>
  )
}
