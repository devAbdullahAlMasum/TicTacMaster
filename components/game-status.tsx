"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Trophy, Target, Clock, Zap } from "lucide-react"

interface GameStatusProps {
  waitingForOpponent: boolean
  winner: { symbol: string; line: number[][] } | null
  isDraw: boolean
  isPlayerTurn: boolean
  playerSymbol: string
  currentTurnPlayerName?: string
  winnerName?: string
}

export function GameStatus({
  waitingForOpponent,
  winner,
  isDraw,
  isPlayerTurn,
  playerSymbol,
  currentTurnPlayerName,
  winnerName,
}: GameStatusProps) {
  const [showWinAnimation, setShowWinAnimation] = useState(false)

  useEffect(() => {
    if (winner || isDraw) {
      setShowWinAnimation(true)
      const timer = setTimeout(() => setShowWinAnimation(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [winner, isDraw])

  let statusMessage = ""
  let statusClass = "text-foreground"
  let icon = null

  if (waitingForOpponent) {
    statusMessage = "Waiting for an opponent to join..."
    statusClass = "text-muted-foreground"
    icon = <Clock className="w-6 h-6 animate-spin" />
  } else if (winner) {
    const isPlayerWinner = winner.symbol === playerSymbol
    statusMessage = isPlayerWinner ? "🎉 Victory! You won the game! 🎉" : `${winnerName || "Opponent"} won the game!`
    statusClass = isPlayerWinner ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
    icon = <Trophy className={cn("w-6 h-6", isPlayerWinner && "animate-bounce text-yellow-500")} />
  } else if (isDraw) {
    statusMessage = "🤝 Game ended in a draw! 🤝"
    statusClass = "text-amber-600 dark:text-amber-400"
    icon = <Target className="w-6 h-6 text-amber-500" />
  } else {
    statusMessage = isPlayerTurn
      ? "⚡ Your turn - Make your move!"
      : `Waiting for ${currentTurnPlayerName || "opponent"} to make a move...`
    statusClass = isPlayerTurn ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
    icon = isPlayerTurn ? (
      <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
    ) : (
      <Clock className="w-6 h-6 animate-slow-pulse" />
    )
  }

  return (
    <div className="text-center relative">
      {/* Win celebration background */}
      {showWinAnimation && (winner || isDraw) && (
        <div className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 animate-pulse"></div>
      )}

      <div
        className={cn(
          "flex items-center justify-center gap-3 transition-all duration-500",
          showWinAnimation && "scale-110",
        )}
      >
        {icon}
        <h2
          className={cn(
            "text-xl font-semibold transition-all duration-300",
            statusClass,
            showWinAnimation && winner && "animate-bounce",
          )}
        >
          {statusMessage}
        </h2>
      </div>

      {/* Subtitle for additional context */}
      {!waitingForOpponent && !winner && !isDraw && (
        <p className="text-sm text-muted-foreground mt-2 animate-fadeIn">
          {isPlayerTurn ? "Click on any empty cell to place your symbol" : "Please wait for your opponent's move"}
        </p>
      )}
    </div>
  )
}
