"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { generateRoomCode } from "@/lib/utils"
import { Loader2, Bot, Zap, Brain, Cpu, Grid3X3 } from "lucide-react"
import { resetGameState, getSettings } from "@/lib/game-store"
import { DashboardShell } from "@/components/dashboard-shell"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { Difficulty } from "@/lib/ai-player"

export default function SinglePlayerPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  // Game settings
  const [boardSize, setBoardSize] = useState("3")
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")

  // Load default settings
  useEffect(() => {
    const settings = getSettings()
    if (settings.defaultPlayerName) {
      setPlayerName(settings.defaultPlayerName)
    }
    if (settings.defaultAvatarId) {
      setSelectedAvatar(Number(settings.defaultAvatarId))
    }
  }, [])

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    // Generate a unique room code for single player
    const roomCode = `SP-${generateRoomCode()}`

    // Reset any existing game state for this room
    resetGameState(roomCode, boardSize, "2", false, false, false, 1)

    // Store single player settings
    localStorage.setItem(
      `single-player-${roomCode}`,
      JSON.stringify({
        difficulty,
        playerName,
        avatarId: selectedAvatar,
        boardSize,
        createdAt: Date.now(),
      }),
    )

    // Redirect to the game room with single player settings
    setTimeout(() => {
      const queryParams = new URLSearchParams({
        name: playerName,
        avatar: selectedAvatar.toString(),
        host: "true",
        boardSize: `${boardSize}x${boardSize}`,
        playerCount: "2",
        chatEnabled: "false",
        chatFilter: "false",
        singlePlayer: "true",
        difficulty,
      })

      router.push(`/game/${roomCode}?${queryParams.toString()}`)
    }, 1000)
  }

  const getDifficultyInfo = (diff: Difficulty) => {
    switch (diff) {
      case "easy":
        return {
          icon: Zap,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/50",
          borderColor: "border-green-300 dark:border-green-700",
          description: "Perfect for beginners",
          details: "AI makes random moves with occasional smart plays",
        }
      case "medium":
        return {
          icon: Brain,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-900/50",
          borderColor: "border-amber-300 dark:border-amber-700",
          description: "Balanced challenge",
          details: "AI uses strategic thinking with some unpredictability",
        }
      case "hard":
        return {
          icon: Cpu,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/50",
          borderColor: "border-red-300 dark:border-red-700",
          description: "Maximum challenge",
          details: "AI uses advanced algorithms for optimal play",
        }
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col items-center max-w-4xl mx-auto">
        {/* Header */}
        <div className="w-full mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-6 rounded-xl border border-purple-100 dark:border-purple-900 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-pink-500/10 blur-2xl"></div>

          <div className="flex items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white mr-4 shadow-lg">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
                  Single Player
                </h1>
                <Badge className="ml-3 bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/30">
                  VS AI
                </Badge>
              </div>
              <p className="text-purple-600 dark:text-purple-400">
                Challenge our AI opponents at different difficulty levels
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Game Setup */}
          <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute w-32 h-32 -right-10 -top-10 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-xl group-hover:bg-purple-300/30 dark:group-hover:bg-purple-700/20 transition-all"></div>

            <CardHeader>
              <CardTitle className="text-xl flex items-center text-purple-700 dark:text-purple-300">
                <Grid3X3 className="mr-2 h-5 w-5" />
                Game Setup
              </CardTitle>
              <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
                Configure your single player game
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-purple-700 dark:text-purple-300">
                  Your Name
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Select an Avatar</Label>
                <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
              </div>

              <div className="space-y-2">
                <Label className="text-purple-700 dark:text-purple-300">Board Size</Label>
                <RadioGroup value={boardSize} onValueChange={setBoardSize} className="grid grid-cols-3 gap-4">
                  <Label
                    htmlFor="sp-3"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                      boardSize === "3"
                        ? "border-purple-500 dark:border-purple-400"
                        : "border-purple-200 dark:border-purple-800"
                    }`}
                  >
                    <RadioGroupItem value="3" id="sp-3" className="sr-only" />
                    <Grid3X3 className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <span className="block text-center text-purple-700 dark:text-purple-300">3×3</span>
                    <span className="text-xs text-purple-600/70 dark:text-purple-400/70">Classic</span>
                  </Label>

                  <Label
                    htmlFor="sp-4"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                      boardSize === "4"
                        ? "border-purple-500 dark:border-purple-400"
                        : "border-purple-200 dark:border-purple-800"
                    }`}
                  >
                    <RadioGroupItem value="4" id="sp-4" className="sr-only" />
                    <Grid3X3 className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <span className="block text-center text-purple-700 dark:text-purple-300">4×4</span>
                    <span className="text-xs text-purple-600/70 dark:text-purple-400/70">Extended</span>
                  </Label>

                  <Label
                    htmlFor="sp-5"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                      boardSize === "5"
                        ? "border-purple-500 dark:border-purple-400"
                        : "border-purple-200 dark:border-purple-800"
                    }`}
                  >
                    <RadioGroupItem value="5" id="sp-5" className="sr-only" />
                    <Grid3X3 className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <span className="block text-center text-purple-700 dark:text-purple-300">5×5</span>
                    <span className="text-xs text-purple-600/70 dark:text-purple-400/70">Challenge</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleCreateGame}
                  disabled={!playerName.trim() || isCreating}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none transition-all hover:shadow-md active:scale-95"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Game...
                    </>
                  ) : (
                    <>
                      Start Game
                      <Bot className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Difficulty Selection */}
          <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute w-32 h-32 -right-10 -top-10 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-xl group-hover:bg-purple-300/30 dark:group-hover:bg-purple-700/20 transition-all"></div>

            <CardHeader>
              <CardTitle className="text-xl flex items-center text-purple-700 dark:text-purple-300">
                <Brain className="mr-2 h-5 w-5" />
                AI Difficulty
              </CardTitle>
              <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
                Choose your opponent's intelligence level
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <RadioGroup value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty)}>
                {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => {
                  const info = getDifficultyInfo(diff)
                  const Icon = info.icon

                  return (
                    <Label
                      key={diff}
                      htmlFor={`diff-${diff}`}
                      className={`flex items-start gap-4 rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                        difficulty === diff
                          ? `${info.borderColor} ${info.bgColor}`
                          : "border-purple-200 dark:border-purple-800 hover:bg-purple-100/50 dark:hover:bg-purple-800/50"
                      }`}
                    >
                      <RadioGroupItem value={diff} id={`diff-${diff}`} className="mt-1" />
                      <div className={`p-2 rounded-lg ${info.bgColor}`}>
                        <Icon className={`h-6 w-6 ${info.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-purple-700 dark:text-purple-300 capitalize">{diff}</span>
                          <Badge variant="outline" className="text-xs">
                            {info.description}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-600/80 dark:text-purple-400/80">{info.details}</p>
                      </div>
                    </Label>
                  )
                })}
              </RadioGroup>

              <div className="mt-6 p-4 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">AI Features:</h4>
                <ul className="space-y-1 text-sm text-purple-600/80 dark:text-purple-400/80">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                    Adaptive strategy based on board size
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                    Advanced minimax algorithm for hard mode
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                    Instant response with thinking animation
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
