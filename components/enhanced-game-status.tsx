"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Trophy, Users, Zap, Crown, Timer, Target } from "lucide-react"

interface EnhancedGameStatusProps {
  isWaiting?: boolean
  winner?: { symbol: string; line: number[][] } | null
  isDraw?: boolean
  isPlayerTurn?: boolean
  playerSymbol?: string
  currentTurnPlayerName?: string
  winnerName?: string
  gameMode?: "single" | "local" | "online"
  timeLeft?: number
  moveCount?: number
  className?: string
}

export function EnhancedGameStatus({
  isWaiting = false,
  winner,
  isDraw,
  isPlayerTurn = true,
  playerSymbol = "X",
  currentTurnPlayerName = "Player",
  winnerName = "Player",
  gameMode = "local",
  timeLeft,
  moveCount,
  className
}: EnhancedGameStatusProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  // Trigger celebrations
  useEffect(() => {
    if (winner) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [winner])

  // Pulse animation for turn indicator
  useEffect(() => {
    if (!winner && !isDraw && !isWaiting) {
      setPulseAnimation(true)
      const timer = setTimeout(() => setPulseAnimation(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentTurnPlayerName, winner, isDraw, isWaiting])

  const getStatusColor = () => {
    if (winner) return "from-green-500 to-emerald-500"
    if (isDraw) return "from-yellow-500 to-orange-500"
    if (isWaiting) return "from-blue-500 to-indigo-500"
    return "from-purple-500 to-pink-500"
  }

  const getStatusIcon = () => {
    if (winner) return <Trophy className="h-5 w-5" />
    if (isDraw) return <Users className="h-5 w-5" />
    if (isWaiting) return <Timer className="h-5 w-5" />
    return <Zap className="h-5 w-5" />
  }

  const getStatusMessage = () => {
    if (winner) {
      return (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500 animate-bounce" />
            <span className="font-bold text-lg">
              {winnerName} Wins!
            </span>
            <Crown className="h-6 w-6 text-yellow-500 animate-bounce" />
          </div>
          <p className="text-sm text-muted-foreground">
            Playing as {winner.symbol}
          </p>
        </div>
      )
    }

    if (isDraw) {
      return (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            <span className="font-bold text-lg">It's a Draw!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Great game, both players!
          </p>
        </div>
      )
    }

    if (isWaiting) {
      return (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Timer className="h-5 w-5 text-blue-500 animate-pulse" />
            <span className="font-bold text-lg">Waiting...</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {gameMode === "online" ? "Waiting for opponent" : "Preparing game"}
          </p>
        </div>
      )
    }

    return (
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className={cn(
            "flex items-center justify-center h-6 w-6 rounded-full font-bold text-sm text-white",
            "bg-gradient-to-r from-blue-500 to-purple-500",
            pulseAnimation && "animate-pulse"
          )}>
            {playerSymbol}
          </div>
          <span className="font-bold text-lg">
            {currentTurnPlayerName}'s Turn
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isPlayerTurn ? "Your move!" : "Opponent's turn"}
        </p>
      </div>
    )
  }

  return (
    <Card className={cn(
      "border-0 shadow-lg transition-all duration-500",
      "bg-gradient-to-r", 
      getStatusColor(),
      "text-white relative overflow-hidden",
      showCelebration && "animate-bounce scale-105",
      className
    )}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse animation-delay-200"></div>
      </div>

      {/* Celebration effects */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute top-4 right-4 w-1 h-1 bg-pink-300 rounded-full animate-ping animation-delay-200"></div>
          <div className="absolute bottom-2 left-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping animation-delay-400"></div>
          <div className="absolute bottom-4 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-ping animation-delay-600"></div>
        </div>
      )}

      <CardContent className="p-4 relative z-10">
        <div className="flex flex-col items-center space-y-3">
          {/* Status icon */}
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "bg-white/20 backdrop-blur-sm",
            winner && "animate-bounce",
            isDraw && "animate-pulse",
            !winner && !isDraw && !isWaiting && "animate-pulse"
          )}>
            {getStatusIcon()}
          </div>

          {/* Status message */}
          {getStatusMessage()}

          {/* Game info */}
          <div className="flex items-center gap-4 text-sm opacity-90">
            {timeLeft !== undefined && (
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>{timeLeft}s</span>
              </div>
            )}
            
            {moveCount !== undefined && (
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{moveCount} moves</span>
              </div>
            )}
            
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {gameMode === "single" && "VS AI"}
              {gameMode === "local" && "Local Game"}
              {gameMode === "online" && "Online Game"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}