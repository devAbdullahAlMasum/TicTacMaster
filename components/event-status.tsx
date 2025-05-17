"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Trophy, AlertTriangle } from "lucide-react"

interface EventStatusProps {
  currentRound: number
  totalRounds: number
  scores: Record<string, number>
  playerSymbols: string[]
  playerNames: Record<string, string>
  scoreToWin: number
  isDraw?: boolean
}

export function EventStatus({
  currentRound,
  totalRounds,
  scores,
  playerSymbols,
  playerNames,
  scoreToWin,
  isDraw = false,
}: EventStatusProps) {
  // Calculate progress percentage
  const progressPercentage = (currentRound / totalRounds) * 100

  // Get symbol color class
  const getSymbolColor = (symbol: string) => {
    switch (symbol) {
      case "X":
        return "text-blue-500 dark:text-blue-400"
      case "O":
        return "text-rose-500 dark:text-rose-400"
      case "Δ":
        return "text-amber-500 dark:text-amber-400"
      case "□":
        return "text-green-500 dark:text-green-400"
      default:
        return "text-foreground"
    }
  }

  // Get background color class for score badge
  const getScoreBadgeClass = (symbol: string) => {
    switch (symbol) {
      case "X":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "O":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300"
      case "Δ":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "□":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
    }
  }

  // Check if any player has reached the winning score
  const hasWinner = Object.values(scores).some((score) => score >= scoreToWin)

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Event Progress</h3>
        <Badge variant="outline">
          Round {currentRound} of {totalRounds}
        </Badge>
      </div>

      <Progress value={progressPercentage} className="h-2 mb-4" />

      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm text-zinc-500 dark:text-zinc-400">Score to win: {scoreToWin}</h4>

          {isDraw && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
            >
              <AlertTriangle className="h-3 w-3" />
              Draw
            </Badge>
          )}

          {hasWinner && !isDraw && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            >
              <Trophy className="h-3 w-3" />
              Winner
            </Badge>
          )}
        </div>

        <div className={`grid gap-2 ${playerSymbols.length > 2 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-2"}`}>
          {playerSymbols.map((symbol) => (
            <div key={symbol} className="flex items-center justify-between p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md">
              <div className="flex items-center">
                <span className={`font-bold text-lg mr-2 ${getSymbolColor(symbol)}`}>{symbol}</span>
                <span className="text-sm truncate max-w-[100px]">{playerNames[symbol] || "Player"}</span>
              </div>
              <Badge className={getScoreBadgeClass(symbol)}>
                {scores[symbol] || 0}
                {scores[symbol] >= scoreToWin && !isDraw && <Trophy className="ml-1 h-3 w-3" />}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-2 bg-zinc-200 dark:bg-zinc-800" />

      <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
        First to reach {scoreToWin} points wins the event
      </div>
    </div>
  )
}
