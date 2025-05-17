"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { Loader2, Users, KeyRound } from "lucide-react"
import { getGameState } from "@/lib/game-store"
import { DashboardShell } from "@/components/dashboard-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function JoinRoomPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError("Please enter your name and room code")
      return
    }

    setIsJoining(true)
    setError("")

    // Check if the room exists
    try {
      const gameState = getGameState(roomCode.toUpperCase())
      const maxPlayers = Number.parseInt(gameState.playerCount || "2")

      // Check if the game already has the maximum number of players and this player isn't already in the game
      if (gameState.players.length >= maxPlayers) {
        const existingPlayer = gameState.players.find((p) => p.name.toLowerCase() === playerName.toLowerCase())

        if (!existingPlayer) {
          setError(`This game room is full (max ${maxPlayers} players)`)
          setIsJoining(false)
          return
        }
      }

      // Redirect to the game room
      setTimeout(() => {
        router.push(`/game/${roomCode.toUpperCase()}?name=${encodeURIComponent(playerName)}&avatar=${selectedAvatar}`)
      }, 1000)
    } catch (err) {
      setError("Invalid room code")
      setIsJoining(false)
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col items-center max-w-md mx-auto">
        <Card className="w-full border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 hover:shadow-md transition-all group overflow-hidden">
          <div className="absolute w-32 h-32 -right-10 -top-10 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-xl group-hover:bg-emerald-300/30 dark:group-hover:bg-emerald-700/20 transition-all"></div>
          <div className="absolute w-24 h-24 right-20 bottom-5 bg-teal-200/20 dark:bg-teal-800/10 rounded-full blur-xl group-hover:bg-teal-300/20 dark:group-hover:bg-teal-700/10 transition-all"></div>

          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-emerald-700 dark:text-emerald-300">
              <Users className="mr-2 h-6 w-6" />
              Join a Game
            </CardTitle>
            <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">
              Enter a room code and set up your profile
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-200">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="roomCode" className="text-emerald-700 dark:text-emerald-300">
                Room Code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                <Input
                  id="roomCode"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="pl-10 bg-emerald-50 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-emerald-700 dark:text-emerald-300">
                Your Name
              </Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-emerald-50 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-emerald-700 dark:text-emerald-300">Select an Avatar</Label>
              <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-none transition-all hover:shadow-md active:scale-95"
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || !roomCode.trim() || isJoining}
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining Room...
                </>
              ) : (
                "Join Room"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}
