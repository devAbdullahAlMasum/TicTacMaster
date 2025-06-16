"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardShell } from "@/components/dashboard-shell"
import { GameBoard } from "@/components/game-board"
import { PlayerInfo } from "@/components/player-info"
import { GameStatus } from "@/components/game-status"
import { ArrowRight, Bot, RotateCcw, Home, Trophy, Zap, Play, Sparkles } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { AIPlayer, type Difficulty } from "@/lib/ai-player"

type Player = {
  id: string
  name: string
  symbol: string
  avatarId: number
  isAI: boolean
}

type GameState = {
  board: string[][]
  currentTurn: string
  players: Player[]
  winner: { symbol: string; line: number[][] } | null
  isDraw: boolean
  boardSize: number
  gameStarted: boolean
  scores: Record<string, number>
}

export default function SinglePlayerPage() {
  const { settings } = useSettings()
  const { playMoveSound, playWinSound, playDrawSound } = useSoundEffects()

  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentTurn: "X",
    players: [],
    winner: null,
    isDraw: false,
    boardSize: 3,
    gameStarted: false,
    scores: {},
  })

  const [setupData, setSetupData] = useState({
    boardSize: settings.defaultBoardSize?.toString() || "3",
    difficulty: settings.difficulty || "medium",
    playerName: settings.defaultPlayerName || "Player",
    playerAvatar: settings.avatarId?.toString() || "1",
    playerSymbol: "X",
  })

  const [aiThinking, setAiThinking] = useState(false)

  // Check for win condition
  const checkWin = (board: string[][], symbol: string, boardSize: number): number[][] | null => {
    const winningLength = 3

    // Check rows
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j <= boardSize - winningLength; j++) {
        let win = true
        for (let k = 0; k < winningLength; k++) {
          if (board[i][j + k] !== symbol) {
            win = false
            break
          }
        }
        if (win) {
          return Array(winningLength)
            .fill(0)
            .map((_, k) => [i, j + k])
        }
      }
    }

    // Check columns
    for (let i = 0; i <= boardSize - winningLength; i++) {
      for (let j = 0; j < boardSize; j++) {
        let win = true
        for (let k = 0; k < winningLength; k++) {
          if (board[i + k][j] !== symbol) {
            win = false
            break
          }
        }
        if (win) {
          return Array(winningLength)
            .fill(0)
            .map((_, k) => [i + k, j])
        }
      }
    }

    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i <= boardSize - winningLength; i++) {
      for (let j = 0; j <= boardSize - winningLength; j++) {
        let win = true
        for (let k = 0; k < winningLength; k++) {
          if (board[i + k][j + k] !== symbol) {
            win = false
            break
          }
        }
        if (win) {
          return Array(winningLength)
            .fill(0)
            .map((_, k) => [i + k, j + k])
        }
      }
    }

    // Check diagonals (top-right to bottom-left)
    for (let i = 0; i <= boardSize - winningLength; i++) {
      for (let j = winningLength - 1; j < boardSize; j++) {
        let win = true
        for (let k = 0; k < winningLength; k++) {
          if (board[i + k][j - k] !== symbol) {
            win = false
            break
          }
        }
        if (win) {
          return Array(winningLength)
            .fill(0)
            .map((_, k) => [i + k, j - k])
        }
      }
    }

    return null
  }

  // Initialize empty board
  const createEmptyBoard = (size: number): string[][] => {
    return Array(size)
      .fill("")
      .map(() => Array(size).fill(""))
  }

  // Start the game
  const startGame = () => {
    const boardSize = Number.parseInt(setupData.boardSize)
    const playerSymbol = setupData.playerSymbol
    const aiSymbol = playerSymbol === "X" ? "O" : "X"

    const players: Player[] = [
      {
        id: "player",
        name: setupData.playerName,
        symbol: playerSymbol,
        avatarId: Number.parseInt(setupData.playerAvatar),
        isAI: false,
      },
      {
        id: "ai",
        name: `AI (${setupData.difficulty})`,
        symbol: aiSymbol,
        avatarId: 6, // AI avatar
        isAI: true,
      },
    ]

    // If AI goes first, sort players so AI is first
    if (aiSymbol === "X") {
      players.reverse()
    }

    const initialScores: Record<string, number> = {}
    players.forEach((player) => {
      initialScores[player.symbol] = 0
    })

    setGameState({
      board: createEmptyBoard(boardSize),
      currentTurn: "X",
      players,
      winner: null,
      isDraw: false,
      boardSize,
      gameStarted: true,
      scores: initialScores,
    })
  }

  // Make AI move if it's AI's turn
  useEffect(() => {
    if (
      gameState.gameStarted &&
      !gameState.winner &&
      !gameState.isDraw &&
      gameState.players.find((p) => p.symbol === gameState.currentTurn)?.isAI
    ) {
      const aiPlayer = gameState.players.find((p) => p.isAI)
      if (!aiPlayer) return

      setAiThinking(true)

      // Add a small delay to make it feel more natural
      const timer = setTimeout(() => {
        try {
          const ai = new AIPlayer(
            setupData.difficulty as Difficulty,
            aiPlayer.symbol,
            gameState.players.find((p) => !p.isAI)?.symbol || "X",
            gameState.boardSize,
          )

          const aiMove = ai.getMove(gameState.board)

          if (aiMove) {
            makeMove(aiMove.row, aiMove.col)
          }
        } catch (error) {
          console.error("AI move error:", error)
        } finally {
          setAiThinking(false)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [gameState.currentTurn, gameState.gameStarted, gameState.winner, gameState.isDraw])

  // Make a move
  const makeMove = (row: number, col: number) => {
    if (gameState.board[row][col] !== "" || gameState.winner || gameState.isDraw) {
      return
    }

    // Create a new board with the move
    const newBoard = gameState.board.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? gameState.currentTurn : c)),
    )

    // Play sound effect
    playMoveSound()

    // Check for win
    const winResult = checkWin(newBoard, gameState.currentTurn, gameState.boardSize)
    const isDraw = !winResult && newBoard.every((row) => row.every((cell) => cell !== ""))

    const newScores = { ...gameState.scores }
    if (winResult) {
      newScores[gameState.currentTurn] = (newScores[gameState.currentTurn] || 0) + 1
      playWinSound()
    } else if (isDraw) {
      playDrawSound()
    }

    // Determine next turn
    const nextTurn = gameState.currentTurn === "X" ? "O" : "X"

    setGameState({
      ...gameState,
      board: newBoard,
      currentTurn: winResult || isDraw ? gameState.currentTurn : nextTurn,
      winner: winResult ? { symbol: gameState.currentTurn, line: winResult } : null,
      isDraw,
      scores: newScores,
    })
  }

  // Play again
  const playAgain = () => {
    setGameState({
      ...gameState,
      board: createEmptyBoard(gameState.boardSize),
      currentTurn: "X",
      winner: null,
      isDraw: false,
    })
  }

  // Go back to setup
  const backToSetup = () => {
    setGameState({
      board: [],
      currentTurn: "X",
      players: [],
      winner: null,
      isDraw: false,
      boardSize: 3,
      gameStarted: false,
      scores: {},
    })
  }

  const currentPlayer = gameState.players.find((p) => p.symbol === gameState.currentTurn)
  const winnerPlayer = gameState.winner ? gameState.players.find((p) => p.symbol === gameState.winner?.symbol) : null
  const humanPlayer = gameState.players.find((p) => !p.isAI)
  const aiPlayer = gameState.players.find((p) => p.isAI)

  if (!gameState.gameStarted) {
    return (
      <DashboardShell>
        <div className="w-full h-full flex flex-col justify-center items-center p-4 py-8">
          <div className="w-full max-w-lg mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
              </div>

              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 sm:mb-6 shadow-2xl">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                    Single Player
                  </h1>
                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1">
                    VS AI
                  </Badge>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
                  Play against the computer with adjustable difficulty levels
                </p>
              </div>
            </div>

            {/* Setup Card */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 sm:gap-3">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  Game Setup
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">Configure your game against the AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-8 pb-6 sm:pb-8">
                {/* Player Info */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">Your Player Info</Label>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={setupData.playerName}
                      onChange={(e) => setSetupData({ ...setupData, playerName: e.target.value })}
                      className="flex-1 h-10 sm:h-12 px-4 text-base sm:text-lg border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Select
                      value={setupData.playerAvatar}
                      onValueChange={(value) => setSetupData({ ...setupData, playerAvatar: value })}
                    >
                      <SelectTrigger className="w-24 h-10 sm:h-12">
                        <SelectValue placeholder="Avatar" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((id) => (
                          <SelectItem key={id} value={id.toString()}>
                            Avatar {id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Game Options */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">Game Options</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-xs sm:text-sm text-muted-foreground">
                        AI Difficulty
                      </Label>
                      <Select
                        value={setupData.difficulty}
                        onValueChange={(value) => setSetupData({ ...setupData, difficulty: value })}
                      >
                        <SelectTrigger id="difficulty" className="h-10 sm:h-12">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="boardSize" className="text-xs sm:text-sm text-muted-foreground">
                        Board Size
                      </Label>
                      <Select
                        value={setupData.boardSize}
                        onValueChange={(value) => setSetupData({ ...setupData, boardSize: value })}
                      >
                        <SelectTrigger id="boardSize" className="h-10 sm:h-12">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3×3 (Classic)</SelectItem>
                          <SelectItem value="4">4×4 (Medium)</SelectItem>
                          <SelectItem value="5">5×5 (Large)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Player Symbol */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">Your Symbol</Label>
                  <div className="flex gap-4 justify-center">
                    <Button
                      type="button"
                      variant={setupData.playerSymbol === "X" ? "default" : "outline"}
                      className={`h-12 sm:h-14 w-20 sm:w-24 text-lg sm:text-xl font-bold ${
                        setupData.playerSymbol === "X"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-2 hover:border-blue-500 hover:text-blue-600"
                      }`}
                      onClick={() => setSetupData({ ...setupData, playerSymbol: "X" })}
                    >
                      X
                    </Button>
                    <Button
                      type="button"
                      variant={setupData.playerSymbol === "O" ? "default" : "outline"}
                      className={`h-12 sm:h-14 w-20 sm:w-24 text-lg sm:text-xl font-bold ${
                        setupData.playerSymbol === "O"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-2 hover:border-blue-500 hover:text-blue-600"
                      }`}
                      onClick={() => setSetupData({ ...setupData, playerSymbol: "O" })}
                    >
                      O
                    </Button>
                  </div>
                  <p className="text-center text-xs sm:text-sm text-muted-foreground">
                    {setupData.playerSymbol === "X" ? "You'll go first" : "AI will go first"}
                  </p>
                </div>

                {/* Start Button */}
                <Button
                  onClick={startGame}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 touch-manipulation"
                >
                  <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Game
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="w-full h-full flex flex-col justify-center items-center p-4 py-6">
        <div className="w-full max-w-lg mx-auto space-y-4 sm:space-y-6">
          {/* Game Header */}
          <div className="text-center space-y-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
                Single Player Game
              </h1>
              <Button variant="outline" onClick={backToSetup} size="sm" className="touch-manipulation">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Setup
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {gameState.boardSize}×{gameState.boardSize} board • {setupData.difficulty} difficulty
            </p>
          </div>

          {/* Game Status */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <GameStatus
                waitingForOpponent={false}
                winner={gameState.winner}
                isDraw={gameState.isDraw}
                isPlayerTurn={currentPlayer?.id === "player"}
                playerSymbol={humanPlayer?.symbol || "X"}
                currentTurnPlayerName={currentPlayer?.name || "Player"}
                winnerName={winnerPlayer?.name || "Player"}
              />
            </div>
          </div>

          {/* Players */}
          <div className="flex justify-center">
            <div className="flex gap-4 sm:gap-6 items-center">
              {gameState.players.map((player) => (
                <div key={player.id} className="flex flex-col items-center space-y-1 sm:space-y-2">
                  <div className="w-full max-w-[140px] sm:max-w-none">
                    <PlayerInfo
                      name={player.name}
                      avatarId={player.avatarId}
                      symbol={player.symbol}
                      isCurrentTurn={gameState.currentTurn === player.symbol && !gameState.winner && !gameState.isDraw}
                      isWinner={gameState.winner?.symbol === player.symbol}
                      isYou={player.id === "player"}
                      isAI={player.isAI}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    <Trophy className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                    {gameState.scores[player.symbol] || 0}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Game Board */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm">
              <GameBoard
                board={gameState.board}
                onCellClick={makeMove}
                winnerLine={gameState.winner?.line}
                disabled={
                  !!gameState.winner ||
                  gameState.isDraw ||
                  aiThinking ||
                  gameState.players.find((p) => p.symbol === gameState.currentTurn)?.isAI
                }
              />
            </div>
          </div>

          {/* Play Again Button */}
          {(gameState.winner || gameState.isDraw) && (
            <div className="flex justify-center">
              <Button
                onClick={playAgain}
                className="h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 touch-manipulation"
              >
                <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Play Again
                <Sparkles className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}

          {/* Current Turn Indicator */}
          {!gameState.winner && !gameState.isDraw && currentPlayer && (
            <div className="flex justify-center">
              <Card
                className={`w-full max-w-sm ${
                  currentPlayer.isAI
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 border-purple-200 dark:border-purple-800"
                    : "bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 border-blue-200 dark:border-blue-800"
                } shadow-lg`}
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Zap
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        currentPlayer.isAI ? "text-purple-600 dark:text-purple-400" : "text-blue-600 dark:text-blue-400"
                      } animate-pulse`}
                    />
                    <span
                      className={`text-base sm:text-lg font-bold ${
                        currentPlayer.isAI ? "text-purple-700 dark:text-purple-300" : "text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {currentPlayer.isAI ? "AI is thinking..." : "Your Turn"}
                    </span>
                    <div
                      className={`flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded ${
                        currentPlayer.isAI
                          ? "bg-gradient-to-br from-purple-500 to-blue-600"
                          : "bg-gradient-to-br from-blue-500 to-green-600"
                      } text-white font-bold text-xs sm:text-sm`}
                    >
                      {currentPlayer.symbol}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {currentPlayer.isAI ? "Please wait..." : "Tap any empty cell to make your move"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
