"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { Loader2 } from "lucide-react"
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

      // If the game already has 2 players and neither is this player, show error
      if (gameState.players.length >= 2) {
        const existingPlayer = gameState.players.find((p) => p.name.toLowerCase() === playerName.toLowerCase())

        if (!existingPlayer) {
          setError("This game room is full")
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
        <Card className="w-full border border-border/40">
          <CardHeader>
            <CardTitle className="text-2xl">Join a Game</CardTitle>
            <CardDescription>Enter a room code and set up your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <Input
                id="roomCode"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playerName">Your Name</Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Select an Avatar</Label>
              <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full transition-all hover:bg-primary/90 active:scale-95"
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
