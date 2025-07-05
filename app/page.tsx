"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Bot, Users, Grid3X3, Trophy, Crown, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSoundEffects } from "@/lib/sound-manager"

export default function HomePage() {
  const { playClickSound } = useSoundEffects()
  const [mounted, setMounted] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [settings, setSettings] = useState({
    largeText: false,
  })



  useEffect(() => {
    setMounted(true)

    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem("tictactoe-settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      setSettingsLoaded(true)
    } catch (error) {
      console.error("Error loading settings:", error)
      setSettingsLoaded(true) // Still mark as loaded even if there's an error
    }
  }, [])

  if (!mounted || !settingsLoaded) {
    return (
      <DashboardShell>
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }



  return (
    <DashboardShell>
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          <CardContent className="p-6 md:p-10 relative z-10">
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
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 touch-manipulation"
                  >
                    <Link href="/single-player" onClick={playClickSound}>
                      <Bot className="mr-2 h-5 w-5" />
                      Play vs AI
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-white text-white hover:bg-white/20 touch-manipulation"
                  >
                    <Link href="/local-multiplayer" onClick={playClickSound}>
                      <Users className="mr-2 h-5 w-5" />
                      Local Multiplayer
                    </Link>
                  </Button>
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
          </CardContent>
        </Card>

        {/* Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                Single Player
              </CardTitle>
              <CardDescription>Challenge yourself against the AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 touch-manipulation"
              >
                <Link href="/single-player" onClick={playClickSound}>
                  Play Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Local Multiplayer
              </CardTitle>
              <CardDescription>Play with friends on the same device</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Button
                asChild
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 touch-manipulation"
              >
                <Link href="/local-multiplayer" onClick={playClickSound}>
                  Play Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Online & Tournament */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5 text-purple-500" />
                Online Multiplayer
              </CardTitle>
              <CardDescription>Play with anyone, anywhere</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create or join online games and play with friends or random opponents from around the world.
              </p>
              <div className="flex gap-3">
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 touch-manipulation"
                >
                  <Link href="/create-room" onClick={playClickSound}>Create Game</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="flex-1 touch-manipulation"
                >
                  <Link href="/join-room" onClick={playClickSound}>Join Game</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Tournaments
              </CardTitle>
              <CardDescription>Compete in organized events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create or join tournaments with multiple players and compete for the top spot on the leaderboard.
              </p>
              <div className="flex gap-3">
                <Button
                  asChild
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 touch-manipulation"
                >
                  <Link href="/create-event" onClick={playClickSound}>Create Tournament</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="flex-1 touch-manipulation"
                >
                  <Link href="/leaderboard" onClick={playClickSound}>
                    <Crown className="mr-2 h-4 w-4" />
                    Leaderboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
