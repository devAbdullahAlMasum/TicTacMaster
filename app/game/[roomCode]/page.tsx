"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { GameBoard } from "@/components/game-board"
import { PlayerInfo } from "@/components/player-info"
import { GameStatus } from "@/components/game-status"
import { EventStatus } from "@/components/event-status"
import { EnhancedChat } from "@/components/enhanced-chat"
import { Button } from "@/components/ui/button"
import { Copy, Home, Users, Trophy, RotateCw, AlertTriangle, Grid3X3, Bot, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import {
  getGameState,
  addPlayer,
  makeMove,
  resetGameState,
  getChatMessages,
  addChatMessage,
  advanceToNextRound,
  checkEventWinner,
  type ChatMessage,
} from "@/lib/game-store"
import { AIPlayer, type Difficulty } from "@/lib/ai-player"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function GamePage({ params }: { params: { roomCode: string } }) {
  const searchParams = useSearchParams()
  const playerName = searchParams.get("name") || "Guest"
  const avatarId = Number.parseInt(searchParams.get("avatar") || "1")
  const isHost = searchParams.get("host") === "true"
  const roomCode = params.roomCode
  const isEvent = searchParams.get("event") === "true"
  const eventName = searchParams.get("eventName") || "Custom Game"
  const isSinglePlayer = searchParams.get("singlePlayer") === "true"
  const difficulty = (searchParams.get("difficulty") || "medium") as Difficulty

  // Parse board size from URL (format: "3x3", "4x4", "5x5")
  const boardSizeParam = searchParams.get("boardSize") || "3x3"
  const boardSize = boardSizeParam.split("x")[0] // Extract just the number

  const playerCount = searchParams.get("playerCount") || "2"
  const chatEnabled = searchParams.get("chatEnabled") !== "false" && !isSinglePlayer
  const chatFilterEnabled = searchParams.get("chatFilter") !== "false"

  // Chat filter state
  const [filterEnabled, setFilterEnabled] = useState(chatFilterEnabled)

  // AI state
  const [aiPlayer, setAiPlayer] = useState<AIPlayer | null>(null)
  const [isAiThinking, setIsAiThinking] = useState(false)

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
  const [eventWinner, setEventWinner] = useState<{ winner: string | null; winningScore: number; isDraw: boolean }>({
    winner: null,
    winningScore: 0,
    isDraw: false,
  })

  // Event details (if applicable)
  const [eventDetails, setEventDetails] = useState<any>(null)

  // Load event details if this is an event
  useEffect(() => {
    if (isEvent) {
      try {
        const details = localStorage.getItem(`event-${roomCode}`)
        if (details) {
          setEventDetails(JSON.parse(details))
        }
      } catch (error) {
        console.error("Error loading event details:", error)
      }
    }
  }, [isEvent, roomCode])

  // Initialize AI player for single player mode
  useEffect(() => {
    if (isSinglePlayer) {
      const ai = new AIPlayer(difficulty, "O", "X", Number.parseInt(boardSize), 3)
      setAiPlayer(ai)
    }
  }, [isSinglePlayer, difficulty, boardSize])

  // Initialize player and game state
  useEffect(() => {
    // Initialize game state with event settings if needed
    if (isEvent && !gameState.isEvent) {
      const totalRounds = eventDetails?.rounds || 3
      resetGameState(roomCode, boardSize, playerCount, chatEnabled, chatFilterEnabled, true, totalRounds)
    }

    // Add this player to the game
    const player = {
      id: playerId,
      name: playerName,
      avatarId,
      symbol: isHost ? "X" : "", // Let the addPlayer function assign the symbol
      isReady: true,
    }

    const updatedState = addPlayer(roomCode, player)
    setGameState(updatedState)

    // For single player mode, add AI opponent
    if (isSinglePlayer && updatedState.players.length === 1) {
      setTimeout(() => {
        const aiOpponent = {
          id: `ai-${roomCode}`,
          name: `AI (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
          avatarId: 7, // Special AI avatar
          symbol: "O",
          isReady: true,
        }

        const stateWithAI = addPlayer(roomCode, aiOpponent)
        setGameState(stateWithAI)

        toast({
          title: "AI Opponent Ready!",
          description: `You're playing against ${difficulty} difficulty AI.`,
          duration: 3000,
        })
      }, 1000)
    }
    // For multiplayer, create a simulated opponent if needed
    else if (!isHost && !isSinglePlayer && updatedState.players.length === 1) {
      setTimeout(() => {
        const hostPlayer = {
          id: `host-${roomCode}`,
          name: "Host Player",
          avatarId: Math.floor(Math.random() * 6) + 1,
          symbol: "X",
          isReady: true,
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
      if (chatEnabled) {
        const latestMessages = getChatMessages(roomCode)
        if (latestMessages.length !== messages.length) {
          setMessages(latestMessages)
        }
      }

      // Check for event winner
      if (isEvent) {
        const result = checkEventWinner(roomCode)
        if (result.winner || result.isDraw) {
          setEventWinner(result)
        }
      }
    }, 2000)

    return () => {
      window.removeEventListener("game-state-update", handleGameStateUpdate as EventListener)
      window.removeEventListener("chat-message", handleChatMessage as EventListener)
      clearInterval(intervalId)
    }
  }, [
    roomCode,
    playerName,
    avatarId,
    isHost,
    playerId,
    isEvent,
    boardSize,
    playerCount,
    chatEnabled,
    chatFilterEnabled,
    eventDetails,
    isSinglePlayer,
    difficulty,
  ])

  // Handle AI moves
  useEffect(() => {
    if (
      isSinglePlayer &&
      aiPlayer &&
      gameState.currentTurn === "O" &&
      !gameState.winner &&
      !gameState.isDraw &&
      gameState.players.length >= 2
    ) {
      setIsAiThinking(true)

      // Add a delay to make AI moves feel more natural
      const aiDelay = difficulty === "easy" ? 1000 : difficulty === "medium" ? 1500 : 2000

      setTimeout(() => {
        try {
          const aiMove = aiPlayer.getMove(gameState.board)
          const updatedState = makeMove(roomCode, `ai-${roomCode}`, aiMove.row, aiMove.col)
          setGameState(updatedState)
        } catch (error) {
          console.error("AI move error:", error)
        } finally {
          setIsAiThinking(false)
        }
      }, aiDelay)
    }
  }, [
    gameState.currentTurn,
    gameState.board,
    gameState.winner,
    gameState.isDraw,
    isSinglePlayer,
    aiPlayer,
    roomCode,
    difficulty,
  ])

  // Update waiting status when players change
  useEffect(() => {
    const requiredPlayers = Number.parseInt(playerCount)
    if (gameState.players.length >= requiredPlayers) {
      setWaitingForOpponent(false)
    } else {
      setWaitingForOpponent(true)
    }
  }, [gameState.players, playerCount])

  // Handle making a move
  const handleMakeMove = (row: number, col: number) => {
    if (isAiThinking) return // Prevent moves while AI is thinking
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

  // Handle advancing to next round in an event
  const handleNextRound = () => {
    const newState = advanceToNextRound(roomCode)
    setGameState(newState)

    toast({
      title: "Next Round",
      description: `Starting round ${newState.currentRound} of ${newState.totalRounds}`,
      duration: 3000,
    })
  }

  // Handle sending a chat message
  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !chatEnabled) return
      const updatedMessages = addChatMessage(roomCode, playerName, text)
      setMessages(updatedMessages)
    },
    [roomCode, playerName, chatEnabled],
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

  // Fix the player turn display logic
  // Find current player and opponents
  const currentPlayer = gameState.players.find((p) => p.id === playerId)
  const opponents = gameState.players.filter((p) => p.id !== playerId)

  // Determine if it's the current player's turn
  const isPlayerTurn = currentPlayer && currentPlayer.symbol === gameState.currentTurn && !isAiThinking

  // Find whose turn it is
  const currentTurnPlayer = gameState.players.find((p) => p.symbol === gameState.currentTurn)

  // Find the winner if there is one
  const winnerPlayer = gameState.winner ? gameState.players.find((p) => p.symbol === gameState.winner?.symbol) : null

  // Determine if the game can be played
  const requiredPlayers = Number.parseInt(playerCount)
  const canPlay = gameState.players.length >= requiredPlayers && !gameState.winner && !gameState.isDraw

  // Create a map of player names by symbol for the event status
  const playerNamesBySymbol: Record<string, string> = {}
  gameState.players.forEach((player) => {
    playerNamesBySymbol[player.symbol] = player.name
  })

  // Update game state when filter is toggled
  useEffect(() => {
    if (isHost && chatEnabled) {
      const currentState = getGameState(roomCode)
      if (currentState.chatFilter !== filterEnabled) {
        currentState.chatFilter = filterEnabled
        saveGameState(roomCode, currentState)
      }
    }
  }, [filterEnabled, isHost, roomCode, chatEnabled])

  // Calculate score to win for events
  const scoreToWin = gameState.totalRounds ? Math.ceil(Number(gameState.totalRounds) / 2) : 1

  // Determine the theme color based on the game type
  const getThemeColor = () => {
    if (isSinglePlayer) {
      return {
        light: {
          from: "from-purple-50",
          to: "to-pink-50",
          border: "border-purple-100",
          darkFrom: "dark:from-purple-950/50",
          darkTo: "dark:to-pink-950/50",
          darkBorder: "dark:border-purple-900",
          gradientText: "from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400",
          iconBg: "from-purple-500 to-pink-600",
          text: "text-purple-600 dark:text-purple-400",
        },
      }
    }

    if (isEvent) {
      return {
        light: {
          from: "from-amber-50",
          to: "to-orange-50",
          border: "border-amber-100",
          darkFrom: "dark:from-amber-950/50",
          darkTo: "dark:to-orange-950/50",
          darkBorder: "dark:border-amber-900",
          gradientText: "from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400",
          iconBg: "from-amber-500 to-orange-600",
          text: "text-amber-600 dark:text-amber-400",
        },
      }
    }

    // Default game theme
    return {
      light: {
        from: "from-blue-50",
        to: "to-indigo-50",
        border: "border-blue-100",
        darkFrom: "dark:from-blue-950/50",
        darkTo: "dark:to-indigo-950/50",
        darkBorder: "dark:border-blue-900",
        gradientText: "from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400",
        iconBg: "from-blue-500 to-indigo-600",
        text: "text-blue-600 dark:text-blue-400",
      },
    }
  }

  const theme = getThemeColor().light

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="container mx-auto py-4">
        <div
          className={`flex flex-col gap-4 bg-gradient-to-r ${theme.from} ${theme.to} ${theme.darkFrom} ${theme.darkTo} p-6 rounded-xl ${theme.border} ${theme.darkBorder} relative overflow-hidden mb-6`}
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>

              <div className="flex items-center ml-4">
                <div
                  className={`flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${theme.iconBg} text-white mr-3 shadow-lg`}
                >
                  {isSinglePlayer ? <Bot className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
                </div>
                <div>
                  <h1
                    className={`text-xl font-bold bg-gradient-to-r ${theme.gradientText} text-transparent bg-clip-text`}
                  >
                    {isSinglePlayer ? "Single Player" : isEvent ? "Tournament Game" : "Game Room"}
                  </h1>
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2 border-zinc-200 dark:border-zinc-800">
                      Room: {roomCode}
                      {!isSinglePlayer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyRoomCode}
                          className="ml-1 h-5 w-5 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-800 active:scale-95 transition-all"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>

                    {isSinglePlayer && (
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      >
                        vs AI ({difficulty})
                      </Badge>
                    )}

                    {isEvent && eventName && (
                      <Badge variant="secondary" className="ml-2">
                        {eventName}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center border-zinc-200 dark:border-zinc-800">
                <Users className="mr-1 h-3 w-3" />
                {gameState.players.length} / {playerCount} Players
              </Badge>
              <Badge variant="outline" className="flex items-center border-zinc-200 dark:border-zinc-800">
                Board: {boardSize}×{boardSize}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-indigo-200 to-blue-200 dark:from-indigo-800 dark:to-blue-800">
                <TabsTrigger
                  value="game"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-indigo-900 dark:data-[state=active]:to-blue-900"
                >
                  Game
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-100 data-[state=active]:to-blue-100 dark:data-[state=active]:from-indigo-900 dark:data-[state=active]:to-blue-900"
                >
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="game" className="mt-4">
                <div className="space-y-6">
                  {/* Event winner alert */}
                  {eventWinner.winner && (
                    <Alert className="bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800">
                      <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-800 dark:text-green-200">Event Complete!</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        {playerNamesBySymbol[eventWinner.winner] || "Player"} ({eventWinner.winner}) has won the event
                        with {eventWinner.winningScore} points!
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Event draw alert */}
                  {eventWinner.isDraw && (
                    <Alert className="bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertTitle className="text-amber-800 dark:text-amber-200">Event Ended in a Draw!</AlertTitle>
                      <AlertDescription className="text-amber-700 dark:text-amber-300">
                        Multiple players reached {eventWinner.winningScore} points, resulting in a draw.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* AI thinking indicator */}
                  {isSinglePlayer && isAiThinking && (
                    <Alert className="bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800">
                      <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <AlertTitle className="text-purple-800 dark:text-purple-200 flex items-center">
                        AI is thinking...
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      </AlertTitle>
                      <AlertDescription className="text-purple-700 dark:text-purple-300">
                        The AI is calculating the best move for {difficulty} difficulty.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Event status for event games - make visible to all players */}
                  {gameState.isEvent && gameState.currentRound && gameState.totalRounds && (
                    <EventStatus
                      currentRound={gameState.currentRound}
                      totalRounds={gameState.totalRounds}
                      scores={gameState.scores || {}}
                      playerSymbols={gameState.players.map((p) => p.symbol)}
                      playerNames={playerNamesBySymbol}
                      scoreToWin={scoreToWin}
                      isDraw={eventWinner.isDraw}
                    />
                  )}

                  <Card className="border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900 hover:shadow-md transition-all group overflow-hidden">
                    <div className="absolute w-32 h-32 -right-10 -top-10 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl"></div>
                    <div className="absolute w-32 h-32 left-40 bottom-10 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-xl"></div>

                    <CardContent className="pt-6">
                      <GameStatus
                        waitingForOpponent={waitingForOpponent}
                        winner={gameState.winner}
                        isDraw={gameState.isDraw ?? false}
                        isPlayerTurn={isPlayerTurn}
                        playerSymbol={currentPlayer?.symbol || ""}
                        currentTurnPlayerName={currentTurnPlayer?.name}
                        winnerName={winnerPlayer?.name}
                      />

                      <div className="mt-6">
                        <GameBoard
                          board={gameState.board}
                          onCellClick={handleMakeMove}
                          winnerLine={gameState.winner?.line}
                          disabled={!canPlay || !isPlayerTurn || isAiThinking}
                        />
                      </div>

                      {(gameState.winner || gameState.isDraw) && (
                        <div className="mt-6 text-center">
                          {isEvent && gameState.isEvent ? (
                            <Button
                              onClick={handleNextRound}
                              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-none hover:shadow-md active:scale-95 transition-all"
                              disabled={
                                !!(eventWinner.winner !== null ||
                                  eventWinner.isDraw ||
                                  (gameState.currentRound &&
                                    gameState.totalRounds &&
                                    gameState.currentRound >= gameState.totalRounds))
                              }
                            >
                              <RotateCw className="mr-2 h-4 w-4" />
                              Next Round
                            </Button>
                          ) : (
                            <Button
                              onClick={handleResetGame}
                              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-none hover:shadow-md active:scale-95 transition-all"
                            >
                              Play Again
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Player info section - fixed for 3+ players */}
                  <div
                    className={`grid gap-4 ${gameState.players.length > 2 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
                  >
                    {currentPlayer && (
                      <PlayerInfo
                        name={currentPlayer.name}
                        avatarId={currentPlayer.avatarId}
                        symbol={currentPlayer.symbol}
                        isCurrentTurn={gameState.currentTurn === currentPlayer.symbol && !isAiThinking}
                        isWinner={gameState.winner?.symbol === currentPlayer.symbol}
                        isYou={true}
                      />
                    )}

                    {opponents.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {opponents.map((opponent) => (
                          <PlayerInfo
                            key={opponent.id}
                            name={opponent.name}
                            avatarId={opponent.avatarId}
                            symbol={opponent.symbol}
                            isCurrentTurn={
                              gameState.currentTurn === opponent.symbol ||
                              (opponent.id.startsWith("ai-") && isAiThinking)
                            }
                            isWinner={gameState.winner?.symbol === opponent.symbol}
                            isYou={false}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card className="flex items-center justify-center p-4 border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900">
                        <p className="text-indigo-600 dark:text-indigo-400">
                          {isSinglePlayer ? "Setting up AI opponent..." : "Waiting for opponents..."}
                        </p>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <Card className="border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900 hover:shadow-md transition-all group overflow-hidden">
                  <div className="absolute w-32 h-32 -right-10 -top-10 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl"></div>
                  <div className="absolute w-32 h-32 left-40 bottom-10 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-xl"></div>

                  <CardHeader>
                    <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300">Game Settings</CardTitle>
                    <CardDescription className="text-indigo-600/80 dark:text-indigo-400/80">
                      Configure your game preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">Game Information</h3>
                        <Separator className="my-2 bg-indigo-200 dark:bg-indigo-800" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Room Code</p>
                            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">{roomCode}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Board Size</p>
                            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                              {boardSize}×{boardSize}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Game Mode</p>
                            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                              {isSinglePlayer ? `Single Player (${difficulty})` : `${playerCount} Players`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Your Role</p>
                            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                              {isSinglePlayer ? "Player" : isHost ? "Host" : "Guest"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Win Condition</p>
                            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                              {gameState.winningLength || 3} in a row
                            </p>
                          </div>
                          {isEvent && eventDetails && (
                            <>
                              <div>
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Event Name</p>
                                <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                                  {eventDetails.eventName}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Rounds</p>
                                <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                                  {eventDetails.rounds}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Time Limit</p>
                                <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
                                  {eventDetails.timeLimit === "0" ? "No limit" : `${eventDetails.timeLimit} seconds`}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Score to Win</p>
                                <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">{scoreToWin} wins</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {chatEnabled && (
                        <div>
                          <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300">Chat Settings</h3>
                          <Separator className="my-2 bg-indigo-200 dark:bg-indigo-800" />
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="chat-filter" className="text-indigo-700 dark:text-indigo-300">
                                  Chat Filter
                                </Label>
                                <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
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
                              <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 italic">
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
              <Card className="h-full border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900">
                <CardHeader>
                  <CardTitle className="text-indigo-700 dark:text-indigo-300">
                    {isSinglePlayer ? "Single Player Mode" : "Chat Disabled"}
                  </CardTitle>
                  <CardDescription className="text-indigo-600/80 dark:text-indigo-400/80">
                    {isSinglePlayer ? "Focus on your game against the AI" : "The host has disabled chat for this game"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-indigo-600/80 dark:text-indigo-400/80">
                    {isSinglePlayer
                      ? "Chat is not available in single player mode. Focus on beating the AI!"
                      : "Chat is currently unavailable for this game session."}
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
