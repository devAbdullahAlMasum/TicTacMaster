"use client"

import { useState, useEffect } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { PageLoader } from "@/components/page-loader"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function TestRoomPage() {
  const { getStyles } = useThemeSystem()
  const [roomId, setRoomId] = useState("")
  const [playerName, setPlayerName] = useState("Test Player")
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testCreateRoom = async () => {
    try {
      const { createRoom } = await import("@/lib/room-manager")
      
      const hostId = `host_${Date.now()}`
      const room = createRoom(hostId, playerName, {
        name: "Test Room",
        description: "Testing room functionality",
        maxPlayers: 2,
        boardSize: 3,
        isPrivate: false,
        password: "",
        allowSpectators: true,
        timeLimit: 60
      })
      
      setRoomId(room.id)
      addResult(`✅ Room created successfully: ${room.id}`)
      addResult(`Room has ${room.players.length} players`)
      
      // Store host info
      localStorage.setItem("tictac_host_id", hostId)
      localStorage.setItem("tictac_player_name", playerName)
      
    } catch (error) {
      addResult(`❌ Failed to create room: ${error}`)
    }
  }

  const testJoinRoom = async () => {
    if (!roomId) {
      addResult("❌ No room ID to join")
      return
    }

    try {
      const { joinRoom } = await import("@/lib/room-manager")
      
      const playerId = `player_${Date.now()}`
      const result = joinRoom(playerId, "Test Player 2", roomId)
      
      if (result.success) {
        addResult(`✅ Joined room successfully`)
        addResult(`Room now has ${result.room?.players.length} players`)
      } else {
        addResult(`❌ Failed to join room: ${result.error}`)
      }
    } catch (error) {
      addResult(`❌ Error joining room: ${error}`)
    }
  }

  const testStartGame = async () => {
    if (!roomId) {
      addResult("❌ No room ID to start game")
      return
    }

    try {
      const { startGame, getRoom } = await import("@/lib/room-manager")
      
      const hostId = localStorage.getItem("tictac_host_id")
      if (!hostId) {
        addResult("❌ No host ID found")
        return
      }

      const success = startGame(roomId, hostId)
      
      if (success) {
        const room = getRoom(roomId)
        addResult(`✅ Game started successfully`)
        addResult(`Game status: ${room?.status}`)
        addResult(`Current turn: ${room?.currentTurn}`)
      } else {
        addResult(`❌ Failed to start game`)
      }
    } catch (error) {
      addResult(`❌ Error starting game: ${error}`)
    }
  }

  const testMakeMove = async () => {
    if (!roomId) {
      addResult("❌ No room ID to make move")
      return
    }

    try {
      const { makeMove, getRoom } = await import("@/lib/room-manager")
      
      const hostId = localStorage.getItem("tictac_host_id")
      if (!hostId) {
        addResult("❌ No host ID found")
        return
      }

      const result = makeMove(roomId, hostId, 0, 0)
      
      if (result.success) {
        addResult(`✅ Move made successfully`)
        addResult(`Next turn: ${result.room?.currentTurn}`)
      } else {
        addResult(`❌ Failed to make move: ${result.error}`)
      }
    } catch (error) {
      addResult(`❌ Error making move: ${error}`)
    }
  }

  const testGetRoom = async () => {
    if (!roomId) {
      addResult("❌ No room ID to get")
      return
    }

    try {
      const { getRoom } = await import("@/lib/room-manager")
      
      const room = getRoom(roomId)
      
      if (room) {
        addResult(`✅ Room retrieved successfully`)
        addResult(`Room name: ${room.name}`)
        addResult(`Players: ${room.players.length}/${room.maxPlayers}`)
        addResult(`Status: ${room.status}`)
        addResult(`Current turn: ${room.currentTurn}`)
        addResult(`Chat messages: ${room.chatMessages.length}`)
      } else {
        addResult(`❌ Room not found`)
      }
    } catch (error) {
      addResult(`❌ Error getting room: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const clearStorage = () => {
    localStorage.removeItem("tictac_rooms")
    localStorage.removeItem("tictac_player_rooms")
    localStorage.removeItem("tictac_host_id")
    localStorage.removeItem("tictac_player_name")
    addResult("🗑️ Cleared localStorage")
  }

  return (
    <PageLoader>
      <EnhancedDashboardShell>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className={cn("text-2xl font-bold", getStyles("text.primary"))}>
                Room System Test
              </h1>
              <p className={cn("text-sm", getStyles("text.secondary"))}>
                Test the room management functionality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Controls */}
              <EnhancedCard className={getStyles("card.base")}>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Test Controls</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Player Name</Label>
                    <Input
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter player name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Room ID</Label>
                    <Input
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Room ID (auto-filled when created)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <EnhancedButton onClick={testCreateRoom} size="sm">
                      Create Room
                    </EnhancedButton>
                    <EnhancedButton onClick={testJoinRoom} size="sm">
                      Join Room
                    </EnhancedButton>
                    <EnhancedButton onClick={testStartGame} size="sm">
                      Start Game
                    </EnhancedButton>
                    <EnhancedButton onClick={testMakeMove} size="sm">
                      Make Move
                    </EnhancedButton>
                    <EnhancedButton onClick={testGetRoom} size="sm">
                      Get Room
                    </EnhancedButton>
                    <EnhancedButton onClick={clearStorage} size="sm" variant="outline">
                      Clear Storage
                    </EnhancedButton>
                  </div>

                  <EnhancedButton onClick={clearResults} variant="outline" className="w-full">
                    Clear Results
                  </EnhancedButton>
                </EnhancedCardContent>
              </EnhancedCard>

              {/* Results */}
              <EnhancedCard className={getStyles("card.base")}>
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Test Results</EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <div className="h-96 overflow-y-auto space-y-1 text-xs font-mono">
                    {testResults.length === 0 ? (
                      <div className={cn("text-center py-8", getStyles("text.secondary"))}>
                        No test results yet. Run some tests!
                      </div>
                    ) : (
                      testResults.map((result, index) => (
                        <div key={index} className={cn(
                          "p-2 rounded",
                          result.includes("✅") ? "bg-green-100 dark:bg-green-900/20" :
                          result.includes("❌") ? "bg-red-100 dark:bg-red-900/20" :
                          "bg-gray-100 dark:bg-gray-900/20"
                        )}>
                          {result}
                        </div>
                      ))
                    )}
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </div>
        </div>
      </EnhancedDashboardShell>
    </PageLoader>
  )
}
