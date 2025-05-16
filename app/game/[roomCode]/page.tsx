"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { GameBoard } from "@/components/game-board"
import { PlayerInfo } from "@/components/player-info"
import { GameStatus } from "@/components/game-status"
import { EnhancedChat } from "@/components/enhanced-chat"
import { Button } from "@/components/ui/button"
import { Copy, Home, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  getGameState,
  addPlayer,
  makeMove,
  resetGameState,
  getChatMessages,
  addChatMessage,
  type ChatMessage,
} from "@/lib/game-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function GamePage({ params }: { params: { roomCode: string } }) {
  const searchParams = useSearchParams()
  const playerName = searchParams.get("name") || "Guest"
  const avatarId = Number.parseInt(searchParams.get("avatar") || "1")
  const isHost = searchParams.get("host") === "true"
  const roomCode = params.roomCode

  // Game settings from URL
  const boardSize = searchParams.get("boardSize") || "3x3"
  const playerCount = searchParams.get("playerCount") || "2"
  const chatEnabled = searchParams.get("chatEnabled") !== "false"
  const chatFilterEnabled = searchParams.get("chatFilter") !== "false"

  // Chat filter state
  const [filterEnabled, setFilterEnabled] = useState(chatFilterEnabled)

  // Generate a unique ID for this player that persists across refreshes
  const [playerId] = useState(() => {
    const storedId = localStorage.getItem(`player-id-${roomCode}-${playerName}`)
    if (storedId) return storedId
    const newId = `player-${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(`player-id-${roomCode}-${playerName}`, newId)
    return newId
  })

  // Game state
  const [gameState, setGameState] = useState(() => getGameState(roomCode))
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatMessages(roomCode))
  const [waitingForOpponent, setWaitingForOpponent] = useState(true)
  const [activeTab, setActiveTab] = useState("game")

  // Initialize player
  useEffect(() => {
    // Add this player to the game
    const player = {
      id: playerId,
      name: playerName,
      avatarId,
      symbol: isHost ? "X" : "O",
    }

    const updatedState = addPlayer(roomCode, player)
    setGameState(updatedState)

    // If we're not the host and there's only one player, create a simulated opponent
    if (!isHost && updatedState.players.length === 1) {
      setTimeout(() => {
        const hostPlayer = {
          id: `host-${roomCode}`,
          name: "Host Player",
          avatarId: Math.floor(Math.random() * 6) + 1,
          symbol: "X",
        }

        const stateWithHost = addPlayer(roomCode, hostPlayer)
        setGameState(stateWithHost)

        toast({
          title: "Connected to game!",
          description: "You've joined the game successfully.",
          duration: 3000,
        })
      }, 1000)
    }

    // Listen for game state updates from other tabs/windows
    const handleGameStateUpdate = (e: CustomEvent) => {
      const { roomCode: updatedRoom, state } = e.detail
      if (updatedRoom === roomCode && state.lastUpdated > gameState.lastUpdated) {
        setGameState(state)
      }
    }

    // Listen for chat messages from other tabs/windows
    const handleChatMessage = (e: CustomEvent) => {
      const { roomCode: msgRoom, messages: updatedMessages } = e.detail
      if (msgRoom === roomCode && updatedMessages) {
        setMessages(updatedMessages)
      }
    }

    window.addEventListener("game-state-update", handleGameStateUpdate as EventListener)
    window.addEventListener("chat-message", handleChatMessage as EventListener)

    // Check for game state updates every 2 seconds
    const intervalId = setInterval(() => {
      const latestState = getGameState(roomCode)
      if (latestState.lastUpdated > gameState.lastUpdated) {
        setGameState(latestState)
      }

      // Also check for new messages
      const latestMessages = getChatMessages(roomCode)
      if (latestMessages.length !== messages.length) {
        setMessages(latestMessages)
      }
    }, 2000)

    return () => {
      window.removeEventListener("game-state-update", handleGameStateUpdate as EventListener)
      window.removeEventListener("chat-message", handleChatMessage as EventListener)
      clearInterval(intervalId)
    }
  }, [roomCode, playerName, avatarId, isHost, playerId])

  // Update waiting status when players change
  useEffect(() => {
    if (gameState.players.length >= 2) {
      setWaitingForOpponent(false)
    } else {
      setWaitingForOpponent(true)
    }
  }, [gameState.players])

  // Handle making a move
  const handleMakeMove = (row: number, col: number) => {
    const updatedState = makeMove(roomCode, playerId, row, col)
    setGameState(updatedState)
  }

  // Handle game reset
  const handleResetGame = () => {
    const newState = resetGameState(roomCode)
    setGameState(newState)

    toast({
      title: "Game Reset",
      description: "Starting a new game",
      duration: 3000,
    })
  }

  // Handle sending a chat message
  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return
      const updatedMessages = addChatMessage(roomCode, playerName, text)
      setMessages(updatedMessages)
    },
    [roomCode, playerName],
  )

  // Handle copying room code
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)

    toast({
      title: "Room code copied!",
      description: "Share this code with your friend to join the game.",
      duration: 3000,
    })
  }

  // Find current player and opponent
  const currentPlayer = gameState.players.find((p) => p.id === playerId)
  const opponent = gameState.players.find((p) => p.id !== playerId)

  // Determine if it's the current player's turn
  const isPlayerTurn = currentPlayer && currentPlayer.symbol === gameState.currentTurn

  // Determine if the game can be played
  const canPlay = gameState.players.length >= 2 && !gameState.winner && !gameState.isDraw

  // Update game state when filter is toggled
  useEffect(() => {
    if (isHost) {
      const currentState = getGameState(roomCode)
      if (currentState.chatFilter !== filterEnabled) {
        currentState.chatFilter = filterEnabled
        saveGameState(roomCode, currentState)
      }
    }
  }, [filterEnabled, isHost, roomCode])

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="container mx-auto py-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>

            <Badge variant="outline" className="ml-2 border-zinc-200 dark:border-zinc-800">
              Room: {roomCode}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyRoomCode}
                className="ml-1 h-5 w-5 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center border-zinc-200 dark:border-zinc-800">
              <Users className="mr-1 h-3 w-3" />
              {gameState.players.length} / {playerCount} Players
            </Badge>
            <Badge variant="outline" className="flex items-center border-zinc-200 dark:border-zinc-800">
              Board: {boardSize}
            </Badge>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-200 dark:bg-zinc-800">
                <TabsTrigger
                  value="game"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900"
                >
                  Game
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="game" className="mt-4">
                <div className="space-y-6">
                  <Card className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <CardContent className="pt-6">
                      <GameStatus
                        waitingForOpponent={waitingForOpponent}
                        winner={gameState.winner}
                        isDraw={gameState.isDraw}
                        isPlayerTurn={isPlayerTurn}
                        playerName={playerName}
                        opponentName={opponent?.name}
                      />

                      <div className="mt-6">
                        <GameBoard
                          board={gameState.board}
                          onCellClick={handleMakeMove}
                          winnerLine={gameState.winner?.line}
                          disabled={!canPlay || !isPlayerTurn}
                        />
                      </div>

                      {(gameState.winner || gameState.isDraw) && (
                        <div className="mt-6 text-center">
                          <Button
                            onClick={handleResetGame}
                            className="hover:bg-primary/90 active:scale-95 transition-all"
                          >
                            Play Again
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentPlayer && (
                      <PlayerInfo
                        name={currentPlayer.name}
                        avatarId={currentPlayer.avatarId}
                        symbol={currentPlayer.symbol}
                        isCurrentTurn={gameState.currentTurn === currentPlayer.symbol}
                        isWinner={gameState.winner?.symbol === currentPlayer.symbol}
                        isYou={true}
                      />
                    )}

                    {opponent ? (
                      <PlayerInfo
                        name={opponent.name}
                        avatarId={opponent.avatarId}
                        symbol={opponent.symbol}
                        isCurrentTurn={gameState.currentTurn === opponent.symbol}
                        isWinner={gameState.winner?.symbol === opponent.symbol}
                        isYou={false}
                      />
                    ) : (
                      <Card className="flex items-center justify-center p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                        <p className="text-zinc-500 dark:text-zinc-400">Waiting for opponent...</p>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <Card className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle>Game Settings</CardTitle>
                    <CardDescription>Configure your game preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Game Information</h3>
                        <Separator className="my-2 bg-zinc-200 dark:bg-zinc-800" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium">Room Code</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{roomCode}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Board Size</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{boardSize}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Player Count</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{playerCount} Players</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Your Role</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{isHost ? "Host" : "Guest"}</p>
                          </div>
                        </div>
                      </div>

                      {chatEnabled && (
                        <div>
                          <h3 className="text-lg font-medium">Chat Settings</h3>
                          <Separator className="my-2 bg-zinc-200 dark:bg-zinc-800" />
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="chat-filter">Chat Filter</Label>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  Filter inappropriate messages
                                </p>
                              </div>
                              <Switch
                                id="chat-filter"
                                checked={filterEnabled}
                                onCheckedChange={setFilterEnabled}
                                disabled={!isHost}
                              />
                            </div>
                            {!isHost && (
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                                Only the host can change chat filter settings
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            {chatEnabled ? (
              <EnhancedChat
                messages={messages}
                onSendMessage={handleSendMessage}
                playerName={playerName}
                disabled={waitingForOpponent}
                filterEnabled={filterEnabled}
                onToggleFilter={isHost ? setFilterEnabled : undefined}
              />
            ) : (
              <Card className="h-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <CardHeader>
                  <CardTitle>Chat Disabled</CardTitle>
                  <CardDescription>The host has disabled chat for this game</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Chat is currently unavailable for this game session.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to save game state
function saveGameState(roomCode: string, state: any) {
  try {
    // Add timestamp to track updates
    state.lastUpdated = Date.now()

    // Save to localStorage
    localStorage.setItem(`game-${roomCode}`, JSON.stringify(state))

    // Dispatch event for other tabs/windows
    window.dispatchEvent(
      new CustomEvent("game-state-update", {
        detail: { roomCode, state },
      }),
    )
  } catch (error) {
    console.error("Error saving game state:", error)
  }
}
