"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Crown, Bot, Zap } from "lucide-react"

interface PlayerInfoProps {
  name: string
  avatarId: number
  symbol: string
  isCurrentTurn: boolean
  isWinner: boolean
  isYou: boolean
  team?: number
}

export function PlayerInfo({ name, avatarId, symbol, isCurrentTurn, isWinner, isYou, team }: PlayerInfoProps) {
  const getSymbolColor = (symbol: string) => {
    switch (symbol) {
      case "X":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
      case "O":
        return "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30"
      case "Δ":
        return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
      case "□":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30"
    }
  }

  const getAvatarSrc = (id: number) => {
    if (id === 7) return null // AI avatar - use fallback
    return `/avatars/avatar-${id}.png`
  }

  const isAI = name.includes("AI")

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 group",
        "border-2 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80",
        "hover:shadow-lg hover:-translate-y-1",

        // Current turn styling
        isCurrentTurn && [
          "ring-2 ring-blue-400/50 dark:ring-blue-600/50",
          "shadow-lg shadow-blue-200/50 dark:shadow-blue-800/50",
          "animate-slow-pulse",
          "bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-950/50 dark:to-indigo-950/50",
        ],

        // Winner styling
        isWinner && [
          "ring-2 ring-emerald-400/70 dark:ring-emerald-600/70",
          "shadow-xl shadow-emerald-200/50 dark:shadow-emerald-800/50",
          "bg-gradient-to-br from-emerald-50/90 to-green-50/90 dark:from-emerald-950/50 dark:to-green-950/50",
          "animate-winner-glow",
        ],

        // Team styling
        team === 1 && "border-blue-200 dark:border-blue-800",
        team === 2 && "border-rose-200 dark:border-rose-800",
      )}
    >
      {/* Background effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/5"></div>
      </div>

      {/* Winner celebration overlay */}
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-emerald-400/10 to-blue-400/10 animate-gradient-shift"></div>
      )}

      <CardContent className="p-4 relative z-10">
        <div className="flex items-center space-x-3">
          {/* Avatar with enhanced styling */}
          <div className="relative">
            <Avatar
              className={cn(
                "h-12 w-12 border-2 transition-all duration-300",
                isCurrentTurn && "border-blue-400 dark:border-blue-600 animate-slow-pulse",
                isWinner && "border-emerald-400 dark:border-emerald-600 shadow-lg",
                !isCurrentTurn && !isWinner && "border-slate-200 dark:border-slate-700",
              )}
            >
              <AvatarImage src={getAvatarSrc(avatarId) || "/placeholder.svg"} alt={name} />
              <AvatarFallback
                className={cn(
                  "text-lg font-bold",
                  isAI
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                )}
              >
                {isAI ? <Bot className="h-6 w-6" /> : name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Status indicator */}
            {isCurrentTurn && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-slow-pulse flex items-center justify-center">
                <Zap className="w-2 h-2 text-white" />
              </div>
            )}

            {isWinner && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-bounce flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            )}
          </div>

          {/* Player info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={cn(
                  "font-semibold truncate transition-colors duration-300",
                  isWinner && "text-emerald-700 dark:text-emerald-300",
                  isCurrentTurn && !isWinner && "text-blue-700 dark:text-blue-300",
                )}
              >
                {name}
              </h3>

              {isYou && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  You
                </Badge>
              )}

              {isAI && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Symbol badge */}
              <Badge
                className={cn(
                  "text-sm font-bold px-2 py-1 border-0 transition-all duration-300",
                  getSymbolColor(symbol),
                  isCurrentTurn && "animate-slow-pulse",
                  isWinner && "animate-bounce",
                )}
              >
                {symbol}
              </Badge>

              {/* Team indicator */}
              {team && (
                <Badge variant="outline" className="text-xs">
                  Team {team}
                </Badge>
              )}

              {/* Status badges */}
              {isCurrentTurn && (
                <Badge className="text-xs bg-blue-500 hover:bg-blue-600 animate-slow-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  Your Turn
                </Badge>
              )}

              {isWinner && (
                <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600 animate-bounce">
                  <Crown className="w-3 h-3 mr-1" />
                  Winner!
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
