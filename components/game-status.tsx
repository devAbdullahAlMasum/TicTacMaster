import { cn } from "@/lib/utils"
import { Trophy, AlertCircle, Loader2, Clock } from "lucide-react"

interface GameStatusProps {
  waitingForOpponent: boolean
  winner: { symbol: string; line: number[][] } | null
  isDraw: boolean
  isPlayerTurn: boolean
  playerSymbol?: string
  currentTurnPlayerName?: string
  winnerName?: string
}

export function GameStatus({
  waitingForOpponent,
  winner,
  isDraw,
  isPlayerTurn,
  playerSymbol = "X",
  currentTurnPlayerName = "Player",
  winnerName = "Player",
}: GameStatusProps) {
  if (waitingForOpponent) {
    return (
      <div className="flex items-center justify-center p-3 rounded-lg bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        <span className="font-medium">Waiting for opponent to join...</span>
      </div>
    )
  }

  if (winner) {
    return (
      <div className="flex items-center justify-center p-3 rounded-lg bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-200">
        <Trophy className="h-4 w-4 mr-2" />
        <span className="font-medium">{winnerName || "Player"} wins!</span>
      </div>
    )
  }

  if (isDraw) {
    return (
      <div className="flex items-center justify-center p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-200">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="font-medium">Game ended in a draw!</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center p-3 rounded-lg border",
        isPlayerTurn
          ? "bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-200"
          : "bg-purple-100 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800/50 text-purple-800 dark:text-purple-200",
      )}
    >
      <Clock className={cn("h-4 w-4 mr-2", isPlayerTurn ? "animate-pulse" : "")} />
      <span className="font-medium">
        {isPlayerTurn ? "Your turn" : `${currentTurnPlayerName || "Opponent"}'s turn`}
      </span>
    </div>
  )
}
