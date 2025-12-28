"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { EnhancedGameBoard } from "@/components/enhanced-game-board"
import { PageLoader } from "@/components/page-loader"
import {
  Users, Crown, Eye, MessageCircle, Settings, Send,
  Home, Copy, Share2, Trophy, Clock, Zap, Play,
  RotateCcw, Sparkles, Volume2, VolumeX, X
} from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { GameRoom, Player, ChatMessage } from "@/lib/room-manager"

export default function GameRoomPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings } = useSettings()
  const { playMoveSound, playWinSound, playDrawSound, playClickSound } = useSoundEffects()
  const { getStyles, currentTheme } = useThemeSystem()

  const roomId = params?.id as string
  const isSpectator = searchParams?.get("spectate") === "true"

  const [room, setRoom] = useState<GameRoom | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [showChat, setShowChat] = useState(true)
  const [playerId, setPlayerId] = useState<string>("")
  const [playerName, setPlayerName] = useState<string>("")
  const [isHost, setIsHost] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Initialize player info
  useEffect(() => {
    const hostId = localStorage.getItem("tictac_host_id")
    const savedPlayerName = localStorage.getItem("tictac_player_name") || settings.defaultPlayerName || "Player"

    let currentPlayerId = hostId
    if (!currentPlayerId) {
      currentPlayerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("tictac_player_id", currentPlayerId)
    }

    setPlayerId(currentPlayerId)
    setPlayerName(savedPlayerName)
    setIsHost(!!hostId)
  }, [settings.defaultPlayerName])

  // Load room data
  useEffect(() => {
    if (!playerId) return

    const loadRoom = async () => {
      try {
        const { getRoom, joinRoom } = await import("@/lib/room-manager")

        let roomData = getRoom(roomId)

        if (!roomData) {
          toast.error("Room not found")
          router.push("/join-room")
          return
        }

        // Join room if not already in it
        const isPlayerInRoom = roomData.players.some(p => p.id === playerId) ||
                              roomData.spectators.some(p => p.id === playerId)

        if (!isPlayerInRoom && !isSpectator) {
          const joinResult = joinRoom(playerId, playerName, roomId)
          if (!joinResult.success) {
            toast.error(joinResult.error || "Failed to join room")
            router.push("/join-room")
            return
          }
          roomData = joinResult.room!
        }

        // For testing: Add a bot player if only host is present
        if (roomData.players.length === 1 && roomData.hostId === playerId) {
          const botResult = joinRoom("bot_player", "AI Bot", roomId)
          if (botResult.success) {
            roomData = botResult.room!
            console.log("Added bot player, room now has:", roomData.players.length, "players")
          }
        }

        setRoom(roomData)
        setIsConnecting(false)
      } catch (error) {
        console.error("Failed to load room:", error)
        toast.error("Failed to connect to room")
        router.push("/join-room")
      }
    }

    loadRoom()

    // Set up polling to refresh room data every 2 seconds
    const interval = setInterval(() => {
      const { getRoom } = require("@/lib/room-manager")
      const updatedRoom = getRoom(roomId)
      if (updatedRoom) {
        setRoom(updatedRoom)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [roomId, playerId, playerName, isSpectator, router])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [room?.chatMessages])

  // Start game (host only)
  const startGame = async () => {
    if (!room || !isHost) return

    try {
      const { startGame: startRoomGame } = await import("@/lib/room-manager")
      const success = startRoomGame(roomId, playerId)

      if (success) {
        const { getRoom } = await import("@/lib/room-manager")
        const updatedRoom = getRoom(roomId)
        if (updatedRoom) {
          setRoom(updatedRoom)
          playClickSound()
          toast.success("Game started!")
        }
      } else {
        toast.error("Failed to start game")
      }
    } catch (error) {
      toast.error("Failed to start game")
    }
  }

  // Make move
  const makeMove = async (row: number, col: number) => {
    if (!room || isSpectator) {
      console.log("Cannot make move: room =", !!room, "isSpectator =", isSpectator)
      return
    }

    console.log("Making move:", row, col, "for player:", playerId, "current turn:", room.currentTurn)

    try {
      const { makeMove: makeRoomMove } = await import("@/lib/room-manager")
      const result = makeRoomMove(roomId, playerId, row, col)

      console.log("Move result:", result)

      if (result.success && result.room) {
        setRoom(result.room)

        if (result.room.winner) {
          playWinSound()
          console.log("Game won by:", result.room.winner.playerName)
        } else if (result.room.isDraw) {
          playDrawSound()
          console.log("Game is a draw")
        } else {
          playMoveSound()
          console.log("Move successful, next turn:", result.room.currentTurn)
        }
      } else {
        console.error("Move failed:", result.error)
        toast.error(result.error || "Invalid move")
      }
    } catch (error) {
      console.error("Error making move:", error)
      toast.error("Failed to make move")
    }
  }

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim() || !room) return

    try {
      const { addChatMessage } = await import("@/lib/room-manager")
      const success = addChatMessage(roomId, playerId, playerName, newMessage.trim())

      if (success) {
        const { getRoom } = await import("@/lib/room-manager")
        const updatedRoom = getRoom(roomId)
        if (updatedRoom) {
          setRoom(updatedRoom)
          setNewMessage("")
          playClickSound()
        }
      }
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  // Handle chat input
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Play again (host only)
  const playAgain = async () => {
    if (!room || !isHost) return

    try {
      const { resetGame } = await import("@/lib/room-manager")
      const success = resetGame(roomId, playerId)

      if (success) {
        const { getRoom } = await import("@/lib/room-manager")
        const updatedRoom = getRoom(roomId)
        if (updatedRoom) {
          setRoom(updatedRoom)
          playClickSound()
          toast.success("Game reset!")
        }
      }
    } catch (error) {
      toast.error("Failed to reset game")
    }
  }

  // Leave room
  const leaveRoom = async () => {
    try {
      const { leaveRoom: leaveGameRoom } = await import("@/lib/room-manager")
      leaveGameRoom(playerId)

      // Clear localStorage
      if (isHost) {
        localStorage.removeItem("tictac_host_id")
      }
      localStorage.removeItem("tictac_player_id")

      playClickSound()
      router.push("/")
    } catch (error) {
      router.push("/")
    }
  }

  // Copy room link
  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join-room?code=${roomId}`)
    playClickSound()
    toast.success("Room link copied!")
  }

  // Format chat timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isConnecting || !room) {
    return (
      <PageLoader>
        <EnhancedDashboardShell>
          <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="text-center space-y-4">
              <div className={cn("text-xl font-semibold", getStyles("text.primary"))}>
                {isConnecting ? "Connecting to room..." : "Room not found"}
              </div>
              {!isConnecting && (
                <EnhancedButton onClick={() => router.push("/")} icon={<Home className="h-4 w-4" />}>
                  Back to Home
                </EnhancedButton>
              )}
            </div>
          </div>
        </EnhancedDashboardShell>
      </PageLoader>
    )
  }

  const currentPlayer = room.players.find(p => p.symbol === room.currentTurn)
  const myPlayer = room.players.find(p => p.id === playerId)
  const canPlay = myPlayer && myPlayer.symbol === room.currentTurn && room.status === "playing"

  return (
    <PageLoader>
      <EnhancedDashboardShell>
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <div className="space-y-8">
            {/* Room Header */}
            <div className="text-center space-y-4">
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg",
                getStyles("sidebar.background")
              )}>
                <Crown className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">{room.name}</span>
                <Badge className="bg-white/20 text-white border-white/30">
                  Room: {roomId}
                </Badge>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <EnhancedButton
                  onClick={copyRoomLink}
                  variant="outline"
                  size="sm"
                  icon={<Copy className="h-4 w-4" />}
                >
                  Copy Link
                </EnhancedButton>
                <EnhancedButton
                  onClick={leaveRoom}
                  variant="outline"
                  size="sm"
                  icon={<Home className="h-4 w-4" />}
                >
                  Leave Room
                </EnhancedButton>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Players & Chat Panel */}
              <div className="xl:col-span-1 space-y-6">
                {/* Players */}
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader>
                    <EnhancedCardTitle className="flex items-center gap-2">
                      <Users className={cn("h-5 w-5", getStyles("text.accent"))} />
                      Players ({room.players.length}/{room.maxPlayers})
                    </EnhancedCardTitle>
                  </EnhancedCardHeader>

                  <EnhancedCardContent className="space-y-3">
                    {room.players.map((player) => (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg transition-all",
                          player.symbol === room.currentTurn && room.status === "playing"
                            ? cn("ring-2 ring-opacity-50", getStyles("border.accent"), getStyles("background.secondary"))
                            : getStyles("background.secondary")
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback className="text-xs">{player.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className={cn("font-medium text-sm truncate", getStyles("text.primary"))}>
                              {player.name}
                            </span>
                            {player.isHost && <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                            {player.id === playerId && <Badge variant="secondary" className="text-xs">You</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {player.symbol && (
                              <span className={cn(
                                "font-bold",
                                player.symbol === "X" ? getStyles("gameBoard.symbol.x") : getStyles("gameBoard.symbol.o")
                              )}>
                                {player.symbol}
                              </span>
                            )}
                            <span className={getStyles("text.secondary")}>Score: {player.score}</span>
                          </div>
                        </div>

                        {player.symbol === room.currentTurn && room.status === "playing" && (
                          <Zap className={cn("h-3 w-3 animate-pulse", getStyles("text.accent"))} />
                        )}
                      </div>
                    ))}

                    {room.spectators.length > 0 && (
                      <div className="pt-3 border-t">
                        <div className={cn("text-xs font-medium mb-2", getStyles("text.secondary"))}>
                          Spectators ({room.spectators.length})
                        </div>
                        {room.spectators.map((spectator) => (
                          <div key={spectator.id} className="flex items-center gap-2 text-xs">
                            <Eye className="h-3 w-3" />
                            <span className="truncate">{spectator.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </EnhancedCardContent>
                </EnhancedCard>

                {/* Chat */}
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader className="pb-3">
                    <EnhancedCardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className={cn("h-4 w-4", getStyles("text.accent"))} />
                        <span className="text-sm">Chat</span>
                      </div>
                      <EnhancedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowChat(!showChat)}
                        className="h-6 w-6 p-0"
                      >
                        {showChat ? <X className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                      </EnhancedButton>
                    </EnhancedCardTitle>
                  </EnhancedCardHeader>

                  {showChat && (
                    <EnhancedCardContent className="p-0">
                      <div className="h-48 flex flex-col">
                        <ScrollArea className="flex-1 px-4">
                          <div className="space-y-2 py-2">
                            {room.chatMessages.map((msg) => (
                              <div key={msg.id} className="text-xs">
                                {msg.type === "system" ? (
                                  <div className={cn("text-center italic", getStyles("text.secondary"))}>
                                    {msg.message}
                                  </div>
                                ) : (
                                  <div>
                                    <span className={cn("font-medium", getStyles("text.accent"))}>
                                      {msg.playerName}:
                                    </span>
                                    <span className={cn("ml-1", getStyles("text.primary"))}>
                                      {msg.message}
                                    </span>
                                    <span className={cn("ml-2 text-xs", getStyles("text.secondary"))}>
                                      {formatTime(msg.timestamp)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                            <div ref={chatEndRef} />
                          </div>
                        </ScrollArea>

                        <div className="p-3 border-t">
                          <div className="flex gap-2">
                            <Input
                              ref={chatInputRef}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={handleChatKeyPress}
                              placeholder="Type a message..."
                              className="text-xs h-8"
                              maxLength={200}
                            />
                            <EnhancedButton
                              onClick={sendMessage}
                              disabled={!newMessage.trim()}
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Send className="h-3 w-3" />
                            </EnhancedButton>
                          </div>
                        </div>
                      </div>
                    </EnhancedCardContent>
                  )}
                </EnhancedCard>

                {/* Game Stats */}
                <EnhancedCard className={getStyles("card.base")}>
                  <EnhancedCardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm", getStyles("text.secondary"))}>Board Size</span>
                      <Badge variant="secondary">{room.boardSize}×{room.boardSize}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm", getStyles("text.secondary"))}>Status</span>
                      <Badge className={
                        room.status === "playing" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        room.status === "waiting" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }>
                        {room.status}
                      </Badge>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </div>

              {/* Game Area */}
              <div className="xl:col-span-4 space-y-6">
                {/* Game Status */}
                {room.status === "waiting" && (
                  <div className="text-center">
                    <EnhancedCard className="max-w-md mx-auto">
                      <EnhancedCardContent className="p-6 text-center space-y-4">
                        <div className="flex items-center justify-center gap-3">
                          <Clock className={cn("h-6 w-6", getStyles("text.accent"))} />
                          <span className={cn("font-bold text-lg", getStyles("text.primary"))}>
                            Waiting for Players
                          </span>
                        </div>
                        <p className={cn("text-sm", getStyles("text.secondary"))}>
                          Need {room.maxPlayers - room.players.length} more player{room.maxPlayers - room.players.length !== 1 ? 's' : ''} to start
                        </p>
                        {isHost && room.players.length >= 2 && (
                          <div className="space-y-2">
                            <EnhancedButton
                              onClick={startGame}
                              className={cn(
                                "w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
                                getStyles("animations.transition")
                              )}
                              icon={<Play className="h-4 w-4" />}
                            >
                              Start Game
                            </EnhancedButton>
                            <div className="text-xs text-center text-gray-500">
                              Players: {room.players.map(p => `${p.name}(${p.symbol || 'no symbol'})`).join(', ')}
                            </div>
                          </div>
                        )}
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </div>
                )}

                {/* Current Turn Indicator */}
                {room.status === "playing" && !room.winner && !room.isDraw && currentPlayer && (
                  <div className="text-center">
                    <EnhancedCard className="max-w-md mx-auto">
                      <EnhancedCardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Zap className={cn("h-5 w-5 animate-pulse", getStyles("text.accent"))} />
                          <span className={cn("font-bold text-lg", getStyles("text.primary"))}>
                            {currentPlayer.name}'s Turn
                          </span>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                            currentPlayer.symbol === "X" ? getStyles("gameBoard.symbol.x") : getStyles("gameBoard.symbol.o")
                          )}>
                            {currentPlayer.symbol}
                          </div>
                        </div>
                        <p className={cn("text-sm mt-1", getStyles("text.secondary"))}>
                          {canPlay
                            ? "Your turn! Tap any empty cell to make your move"
                            : isSpectator
                              ? "You are spectating this game"
                              : "Waiting for opponent's move..."
                          }
                        </p>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  </div>
                )}

                {/* Game Board */}
                <div className="flex justify-center">
                  <EnhancedGameBoard
                    board={room.board}
                    onCellClick={makeMove}
                    winnerLine={room.winner?.line}
                    disabled={!canPlay || !!room.winner || room.isDraw || room.status !== "playing"}
                  />
                </div>

                {/* Game Result */}
                {room.winner && (
                  <div className="text-center space-y-4">
                    <div className={cn(
                      "inline-flex items-center gap-3 px-6 py-3 rounded-full",
                      "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                    )}>
                      <Trophy className="h-6 w-6" />
                      <span className="font-bold text-lg">{room.winner.playerName} Wins!</span>
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                )}

                {room.isDraw && (
                  <div className="text-center">
                    <div className={cn(
                      "inline-flex items-center gap-3 px-6 py-3 rounded-full",
                      getStyles("card.base"), getStyles("text.primary")
                    )}>
                      <Trophy className="h-6 w-6" />
                      <span className="font-bold text-lg">It's a Draw!</span>
                    </div>
                  </div>
                )}

                {/* Game Controls */}
                {(room.winner || room.isDraw) && isHost && (
                  <div className="flex justify-center gap-4">
                    <EnhancedButton
                      onClick={playAgain}
                      className={cn(
                        "h-12 px-6 font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
                        getStyles("animations.transition")
                      )}
                      icon={<RotateCcw className="h-4 w-4" />}
                    >
                      <span className="flex items-center gap-2">
                        New Game
                        <Sparkles className="h-4 w-4" />
                      </span>
                    </EnhancedButton>
                  </div>
                )}

                {/* Room Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <EnhancedCard className={getStyles("card.base")}>
                    <EnhancedCardContent className="p-4 text-center">
                      <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                        {room.boardSize}×{room.boardSize}
                      </div>
                      <div className={cn("text-sm", getStyles("text.secondary"))}>Board Size</div>
                    </EnhancedCardContent>
                  </EnhancedCard>

                  <EnhancedCard className={getStyles("card.base")}>
                    <EnhancedCardContent className="p-4 text-center">
                      <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                        {room.players.length}
                      </div>
                      <div className={cn("text-sm", getStyles("text.secondary"))}>Players</div>
                    </EnhancedCardContent>
                  </EnhancedCard>

                  <EnhancedCard className={getStyles("card.base")}>
                    <EnhancedCardContent className="p-4 text-center">
                      <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                        {room.status}
                      </div>
                      <div className={cn("text-sm", getStyles("text.secondary"))}>Status</div>
                    </EnhancedCardContent>
                  </EnhancedCard>

                  <EnhancedCard className={getStyles("card.base")}>
                    <EnhancedCardContent className="p-4 text-center">
                      <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                        {room.currentTurn || "None"}
                      </div>
                      <div className={cn("text-sm", getStyles("text.secondary"))}>Turn</div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </div>

                {/* Debug Info */}
                {process.env.NODE_ENV === "development" && (
                  <EnhancedCard className={getStyles("card.base")}>
                    <EnhancedCardHeader>
                      <EnhancedCardTitle className="text-sm">Debug Info</EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent className="text-xs space-y-1">
                      <div>Room ID: {room.id}</div>
                      <div>Player ID: {playerId}</div>
                      <div>Is Host: {isHost ? "Yes" : "No"}</div>
                      <div>Can Play: {canPlay ? "Yes" : "No"}</div>
                      <div>My Player: {myPlayer ? `${myPlayer.name} (${myPlayer.symbol})` : "Not found"}</div>
                      <div>Current Turn: {room.currentTurn}</div>
                      <div>Game Status: {room.status}</div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                )}
              </div>
            </div>
          </div>
        </div>
      </EnhancedDashboardShell>
    </PageLoader>
  )
}
