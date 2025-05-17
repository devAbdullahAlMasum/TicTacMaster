"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { generateRoomCode } from "@/lib/utils"
import { Loader2, Grid3X3, Calendar, Trophy, ArrowRight, Users } from "lucide-react"
import { resetGameState } from "@/lib/game-store"
import { DashboardShell } from "@/components/dashboard-shell"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function CreateRoomPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  // Game settings
  const [boardSize, setBoardSize] = useState("3")
  const [playerCount, setPlayerCount] = useState("2")
  const [chatEnabled, setChatEnabled] = useState(true)
  const [chatFilterEnabled, setChatFilterEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    // Generate a unique room code
    const roomCode = generateRoomCode()

    // Reset any existing game state for this room
    resetGameState(roomCode, boardSize, playerCount, chatEnabled, chatFilterEnabled)

    // Redirect to the game room with all settings
    setTimeout(() => {
      const queryParams = new URLSearchParams({
        name: playerName,
        avatar: selectedAvatar.toString(),
        host: "true",
        boardSize: `${boardSize}x${boardSize}`,
        playerCount,
        chatEnabled: chatEnabled.toString(),
        chatFilter: chatFilterEnabled.toString(),
      })

      router.push(`/game/${roomCode}?${queryParams.toString()}`)
    }, 1000)
  }

  return (
    <DashboardShell>
      <div className="flex flex-col items-center max-w-5xl mx-auto">
        <div className="w-full mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-6 rounded-xl border border-blue-100 dark:border-blue-900 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl"></div>

          <div className="flex items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white mr-4 shadow-lg">
              <Grid3X3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                  Create Game
                </h1>
                <Badge className="ml-3 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30">
                  BETA
                </Badge>
              </div>
              <p className="text-blue-600 dark:text-blue-400">
                Set up a new game with custom settings and invite your friends to play
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Create Game Room Card */}
          <Card className="w-full border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute w-32 h-32 -right-10 -top-10 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl group-hover:bg-blue-300/30 dark:group-hover:bg-blue-700/20 transition-all"></div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center text-blue-700 dark:text-blue-300">
                <Grid3X3 className="mr-2 h-6 w-6" />
                Create Game Room
              </CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                Start a quick game with customizable settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quickPlayerName" className="text-blue-700 dark:text-blue-300">
                  Your Name
                </Label>
                <Input
                  id="quickPlayerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Select an Avatar</Label>
                <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Board Size</Label>
                <RadioGroup value={boardSize} onValueChange={setBoardSize} className="grid grid-cols-3 gap-4">
                  <Label
                    htmlFor="3"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                      boardSize === "3"
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <RadioGroupItem value="3" id="3" className="sr-only" />
                    <Grid3X3 className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="block text-center text-blue-700 dark:text-blue-300">3×3</span>
                  </Label>

                  <Label
                    htmlFor="4"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                      boardSize === "4"
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <RadioGroupItem value="4" id="4" className="sr-only" />
                    <Grid3X3 className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="block text-center text-blue-700 dark:text-blue-300">4×4</span>
                  </Label>

                  <Label
                    htmlFor="5"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                      boardSize === "5"
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <RadioGroupItem value="5" id="5" className="sr-only" />
                    <Grid3X3 className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="block text-center text-blue-700 dark:text-blue-300">5×5</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-blue-700 dark:text-blue-300">Player Count</Label>
                <RadioGroup value={playerCount} onValueChange={setPlayerCount} className="grid grid-cols-3 gap-4">
                  <Label
                    htmlFor="2-players"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                      playerCount === "2"
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <RadioGroupItem value="2" id="2-players" className="sr-only" />
                    <Users className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="block text-center text-blue-700 dark:text-blue-300">2 Players</span>
                  </Label>

                  <Label
                    htmlFor="3-players"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                      playerCount === "3"
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <RadioGroupItem value="3" id="3-players" className="sr-only" />
                    <Users className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div className="flex flex-col items-center">
                      <span className="block text-center text-blue-700 dark:text-blue-300">3 Players</span>
                      <Badge className="mt-1 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">BETA</Badge>
                    </div>
                  </Label>

                  <Label
                    htmlFor="4-players"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                      playerCount === "4"
                        ? "border-blue-500 dark:border-blue-400"
                        : "border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <RadioGroupItem value="4" id="4-players" className="sr-only" />
                    <Users className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div className="flex flex-col items-center">
                      <span className="block text-center text-blue-700 dark:text-blue-300">4 Players</span>
                      <span className="text-xs text-blue-600/80 dark:text-blue-400/80">(Teams)</span>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim() || isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-all hover:shadow-md active:scale-95"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    <>
                      Create Game
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create Event Card */}
          <Card className="w-full border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute w-32 h-32 -right-10 -top-10 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-xl group-hover:bg-purple-300/30 dark:group-hover:bg-purple-700/20 transition-all"></div>
            <div className="absolute top-4 right-4">
              <Badge className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">BETA</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center text-purple-700 dark:text-purple-300">
                <Trophy className="mr-2 h-6 w-6" />
                Create Tournament
              </CardTitle>
              <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
                Host a multi-round event with advanced settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">Tournament Features</h3>
                <ul className="space-y-2 text-purple-600/80 dark:text-purple-400/80">
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    Multiple rounds with score tracking
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    Support for teams and multiple players
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    Customizable win conditions
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                    Tournament statistics and history
                  </li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Link href="/create-event">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none transition-all hover:shadow-md active:scale-95">
                    Create Tournament
                    <Calendar className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
