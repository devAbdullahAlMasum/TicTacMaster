"use client"

import { useState, useEffect } from "react"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import Link from "next/link"
import { Bot, Users, Grid3X3, Trophy, Crown, ArrowRight, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { useSettings } from "@/hooks/use-settings"

export default function HomePage() {
  const { playClickSound } = useSoundEffects()
  const { getStyles, currentTheme } = useThemeSystem()
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)



  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !currentTheme) {
    return (
      <EnhancedDashboardShell>
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </EnhancedDashboardShell>
    )
  }



  return (
    <EnhancedDashboardShell>
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <EnhancedCard
          variant="gradient"
          className={cn(
            "mb-8 overflow-hidden border-0 shadow-xl text-white relative",
            getStyles("sidebar.background")
          )}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <EnhancedCardContent className="p-6 md:p-10 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-1 text-center md:text-left">
                <h1
                  className={cn("font-bold mb-4", settings.largeText ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl")}
                >
                  Welcome to TicTacMaster
                </h1>
                <p className={cn("mb-6 max-w-lg", settings.largeText ? "text-lg md:text-xl" : "text-base md:text-lg")}>
                  The ultimate Tic Tac Toe experience with multiple game modes, customizable boards, and online play.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <EnhancedButton
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 touch-manipulation"
                    onClick={playClickSound}
                  >
                    <Link href="/single-player" className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Play vs AI
                    </Link>
                  </EnhancedButton>
                  <EnhancedButton
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-white text-white hover:bg-white/20 touch-manipulation"
                    onClick={playClickSound}
                  >
                    <Link href="/local-multiplayer" className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Local Multiplayer
                    </Link>
                  </EnhancedButton>
                </div>
              </div>
              <div className="hidden md:block w-64 h-64 relative">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-3">
                  {Array(9)
                    .fill(null)
                    .map((_, i) => {
                      const row = Math.floor(i / 3)
                      const col = i % 3
                      const symbol = [
                        ["X", "", "O"],
                        ["O", "X", ""],
                        ["", "O", "X"],
                      ][row][col]
                      const delay = i * 0.1

                      return (
                        <div
                          key={i}
                          className="bg-white/20 rounded-lg flex items-center justify-center text-4xl font-bold animate-bounce-in"
                          style={{ animationDelay: `${delay}s` }}
                        >
                          <span
                            className={
                              symbol === "X" ? "text-blue-300" : symbol === "O" ? "text-rose-300" : "text-transparent"
                            }
                          >
                            {symbol || "."}
                          </span>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EnhancedCard
            variant="elevated"
            interactive={true}
            className={cn(
              "border-0 backdrop-blur-sm",
              getStyles("card.base"),
              getStyles("card.hover")
            )}
          >
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Bot className={cn("h-5 w-5", getStyles("text.accent"))} />
                Single Player
              </EnhancedCardTitle>
              <EnhancedCardDescription>Challenge yourself against the AI</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-4">
              <p className="text-muted-foreground">
                Test your skills against our AI with multiple difficulty levels. Perfect for practice or a quick game.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Three difficulty levels</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Customizable board sizes</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Track your progress</span>
                </li>
              </ul>
              <EnhancedButton
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 touch-manipulation"
                onClick={playClickSound}
              >
                <Link href="/single-player" className="flex items-center justify-center gap-2">
                  Play Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard
            variant="elevated"
            interactive={true}
            className={cn(
              "border-0 backdrop-blur-sm",
              getStyles("card.base"),
              getStyles("card.hover")
            )}
          >
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Users className={cn("h-5 w-5", getStyles("text.accent"))} />
                Local Multiplayer
              </EnhancedCardTitle>
              <EnhancedCardDescription>Play with friends on the same device</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-4">
              <p className="text-muted-foreground">
                Challenge a friend on the same device. Take turns making moves and see who comes out on top.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span>Custom player names and avatars</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span>Multiple board sizes</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  <span>Quick and easy setup</span>
                </li>
              </ul>
              <EnhancedButton
                asChild
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 touch-manipulation"
                onClick={playClickSound}
              >
                <Link href="/local-multiplayer" className="flex items-center justify-center gap-2">
                  Play Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>

        {/* Online & Tournament */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedCard
            variant="elevated"
            interactive={true}
            className={cn(
              "border-0 backdrop-blur-sm",
              getStyles("card.base"),
              getStyles("card.hover")
            )}
          >
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Grid3X3 className={cn("h-5 w-5", getStyles("text.accent"))} />
                Online Multiplayer
              </EnhancedCardTitle>
              <EnhancedCardDescription>Play with anyone, anywhere</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create or join online games and play with friends or random opponents from around the world.
              </p>
              <div className="flex gap-3">
                <EnhancedButton
                  asChild
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 touch-manipulation"
                  onClick={playClickSound}
                >
                  <Link href="/create-room">Create Game</Link>
                </EnhancedButton>
                <EnhancedButton
                  asChild
                  variant="outline"
                  className="flex-1 touch-manipulation"
                  onClick={playClickSound}
                >
                  <Link href="/join-room">Join Game</Link>
                </EnhancedButton>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard
            variant="elevated"
            interactive={true}
            className={cn(
              "border-0 backdrop-blur-sm",
              getStyles("card.base"),
              getStyles("card.hover")
            )}
          >
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Trophy className={cn("h-5 w-5", getStyles("text.accent"))} />
                Tournaments
              </EnhancedCardTitle>
              <EnhancedCardDescription>Compete in organized events</EnhancedCardDescription>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create or join tournaments with multiple players and compete for the top spot on the leaderboard.
              </p>
              <div className="flex gap-3">
                <EnhancedButton
                  asChild
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 touch-manipulation"
                  onClick={playClickSound}
                >
                  <Link href="/create-event">Create Tournament</Link>
                </EnhancedButton>
                <EnhancedButton
                  asChild
                  variant="outline"
                  className="flex-1 touch-manipulation"
                  onClick={playClickSound}
                >
                  <Link href="/leaderboard" className="flex items-center justify-center gap-2">
                    <Crown className="h-4 w-4" />
                    Leaderboard
                  </Link>
                </EnhancedButton>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </EnhancedDashboardShell>
  )
}
