"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlayerInfoProps {
  name: string
  avatarId: number
  symbol: string
  isCurrentTurn: boolean
  isWinner: boolean
  isYou: boolean
}

export function PlayerInfo({ name, avatarId, symbol, isCurrentTurn, isWinner, isYou }: PlayerInfoProps) {
  return (
    <Card
      className={cn(
        "p-4 transition-all border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950",
        isCurrentTurn && "ring-2 ring-primary/30",
        isWinner && "ring-2 ring-green-500/30 bg-green-500/10",
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
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Playing as{" "}
            <span
              className={cn(
                "font-bold",
                symbol === "X"
                  ? "text-blue-500 dark:text-blue-400"
                  : symbol === "O"
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-amber-500 dark:text-amber-400",
              )}
            >
              {symbol}
            </span>
          </p>
        </div>

        {isCurrentTurn && (
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">Current Turn</Badge>
        )}
      </div>
    </Card>
  )
}
