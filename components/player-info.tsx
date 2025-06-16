import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

interface PlayerInfoProps {
  name: string
  avatarId: number
  symbol: string
  isCurrentTurn?: boolean
  isWinner?: boolean
  isYou?: boolean
  isAI?: boolean
}

export function PlayerInfo({
  name,
  avatarId,
  symbol,
  isCurrentTurn = false,
  isWinner = false,
  isYou = false,
  isAI = false,
}: PlayerInfoProps) {
  const { settings } = useSettings()

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-md",
        isCurrentTurn && "ring-2 ring-blue-500 dark:ring-blue-400",
        isWinner && "ring-2 ring-green-500 dark:ring-green-400",
        "mobile-card-padding",
      )}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12 rounded-md border-2 border-slate-200 dark:border-slate-700">
            <AvatarImage src={`/avatars/avatar-${avatarId}.png`} alt={name} />
            <AvatarFallback className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3
                className={cn(
                  "font-medium truncate",
                  settings.largeText ? "text-base" : "text-sm",
                  isWinner && "text-green-600 dark:text-green-400",
                )}
              >
                {name}
              </h3>
              {isYou && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[10px] border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                >
                  <User className="mr-0.5 h-2 w-2" />
                  YOU
                </Badge>
              )}
              {isAI && (
                <Badge
                  variant="outline"
                  className="h-4 px-1 text-[10px] border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
                >
                  <Bot className="mr-0.5 h-2 w-2" />
                  AI
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={cn(
                  "flex items-center justify-center h-5 w-5 rounded",
                  "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
                  isCurrentTurn && "bg-blue-500 text-white",
                  isWinner && "bg-green-500 text-white",
                )}
              >
                <span className={cn("font-bold", settings.largeText ? "text-sm" : "text-xs")}>{symbol}</span>
              </div>
              <span
                className={cn(
                  "text-xs text-slate-500 dark:text-slate-400",
                  isCurrentTurn && "text-blue-600 dark:text-blue-400",
                  isWinner && "text-green-600 dark:text-green-400",
                )}
              >
                {isCurrentTurn && "Current Turn"}
                {isWinner && "Winner!"}
                {!isCurrentTurn && !isWinner && "Waiting"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
