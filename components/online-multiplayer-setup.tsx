"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { generateRoomCode } from "@/lib/utils"
import { Loader2, Grid3X3, ArrowRight, Users, Home } from "lucide-react"
import { resetGameState } from "@/lib/game-store"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { useSoundEffects } from "@/lib/sound-manager"

interface OnlineMultiplayerSetupProps {
  onBack?: () => void
}

export function OnlineMultiplayerSetup({ onBack }: OnlineMultiplayerSetupProps) {
  const router = useRouter()
  const { playClickSound } = useSoundEffects()
  const [playerName, setPlayerName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [boardSize, setBoardSize] = useState("3")
  const [playerCount, setPlayerCount] = useState("2")

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
    playClickSound()

    // Generate a unique room code
    const roomCode = generateRoomCode()

    // Reset any existing game state for this room
    resetGameState(roomCode, boardSize, playerCount, true, true)

    // Redirect to the game room with all settings
    setTimeout(() => {
      const queryParams = new URLSearchParams({
        name: playerName,
        avatar: selectedAvatar.toString(),
        host: "true",
        boardSize: `${boardSize}x${boardSize}`,
        playerCount,
        chatEnabled: "true",
        chatFilter: "true",
      })

      router.push(`/game/${roomCode}?${queryParams.toString()}`)
    }, 1000)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white mb-4 sm:mb-6 shadow-2xl">
          <Grid3X3 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
              Online Multiplayer
            </h2>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
            Create a room and play with friends online
          </p>
        </div>
      </div>

      {/* Setup Card */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 sm:gap-3">
            <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            Create Game Room
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            Set up your online multiplayer game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-8 pb-6 sm:pb-8">
          {/* Player Info */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-semibold">Your Player Info</Label>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="flex-1 h-10 sm:h-12 px-4 text-base sm:text-lg border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-semibold">Select an Avatar</Label>
            <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
          </div>

          {/* Board Size */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-semibold">Board Size</Label>
            <RadioGroup value={boardSize} onValueChange={setBoardSize} className="grid grid-cols-3 gap-4">
              <Label
                htmlFor="online-3"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                  boardSize === "3"
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <RadioGroupItem value="3" id="online-3" className="sr-only" />
                <Grid3X3 className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="block text-center">3×3</span>
              </Label>

              <Label
                htmlFor="online-4"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                  boardSize === "4"
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <RadioGroupItem value="4" id="online-4" className="sr-only" />
                <Grid3X3 className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="block text-center">4×4</span>
              </Label>

              <Label
                htmlFor="online-5"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                  boardSize === "5"
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <RadioGroupItem value="5" id="online-5" className="sr-only" />
                <Grid3X3 className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="block text-center">5×5</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Player Count */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-sm sm:text-base font-semibold">Number of Players</Label>
            <RadioGroup value={playerCount} onValueChange={setPlayerCount} className="grid grid-cols-3 gap-4">
              <Label
                htmlFor="online-2-players"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                  playerCount === "2"
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <RadioGroupItem value="2" id="online-2-players" className="sr-only" />
                <Users className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="block text-center">2 Players</span>
              </Label>

              <Label
                htmlFor="online-3-players"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                  playerCount === "3"
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <RadioGroupItem value="3" id="online-3-players" className="sr-only" />
                <Users className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="block text-center">3 Players</span>
              </Label>

              <Label
                htmlFor="online-4-players"
                className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                  playerCount === "4"
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <RadioGroupItem value="4" id="online-4-players" className="sr-only" />
                <Users className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                <span className="block text-center">4 Players</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-semibold touch-manipulation"
              >
                <Home className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleCreateRoom}
              disabled={!playerName.trim() || isCreating}
              className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 touch-manipulation"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Room
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}