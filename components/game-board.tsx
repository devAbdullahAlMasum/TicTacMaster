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
              "border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950",
              isCellInWinnerLine(rowIndex, colIndex) && "bg-green-500/20 dark:bg-green-500/30 border-green-500/50",
              !cell &&
                !disabled &&
                "hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-95",
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
