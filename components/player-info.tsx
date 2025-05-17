"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Trophy, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  return (
    <Card
      className={cn(
        "p-4 transition-all border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900",
        isCurrentTurn &&
          "ring-2 ring-indigo-500/30 bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900 dark:to-blue-800",
        isWinner &&
          "ring-2 ring-green-500/30 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
      )}
    >
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={name} />
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center">
            <p className="font-medium">
              {name}{" "}
              {isYou && (
                <Badge variant="outline" className="ml-1 text-xs border-zinc-200 dark:border-zinc-800">
                  You
                </Badge>
              )}
            </p>
            {isWinner && <Trophy className="h-4 w-4 text-yellow-500 ml-2" />}
          </div>
          <div className="flex items-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Playing as{" "}
              <span
                className={cn(
                  "font-bold",
                  symbol === "X"
                    ? "text-blue-500 dark:text-blue-400"
                    : symbol === "O"
                      ? "text-rose-500 dark:text-rose-400"
                      : symbol === "Δ"
                        ? "text-amber-500 dark:text-amber-400"
                        : "text-green-500 dark:text-green-400",
                )}
              >
                {symbol}
              </span>
            </p>
            {team && (
              <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1">
                <Users className="h-3 w-3" />
                Team {team}
              </Badge>
            )}
          </div>
        </div>

        {isCurrentTurn && (
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">Current Turn</Badge>
        )}
      </div>
    </Card>
  )
}
