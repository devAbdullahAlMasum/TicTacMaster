"use client"

import { useState } from "react"
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
import { ArrowRight, Users, RotateCcw, Home, Trophy, Zap, Play, Sparkles } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { createEmptyBoard, checkWin, getNextPlayer, isBoardFull } from "@/lib/game-logic"

type LocalPlayer = {
  id: string
  name: string
  symbol: string
  avatarId: number
}

type LocalGameState = {
  board: string[][]
  currentTurn: string
  players: LocalPlayer[]
  winner: { symbol: string; line: number[][] } | null
  isDraw: boolean
  boardSize: number
  gameStarted: boolean
  scores: Record<string, number>
}

export default function LocalMultiplayerPage() {
  const { settings } = useSettings()
  const { playMoveSound, playWinSound, playDrawSound } = useSoundEffects()

  const [gameState, setGameState] = useState<LocalGameState>({
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
    boardSize: "3",
    playerCount: "2",
    player1Name: settings.defaultPlayerName || "Player 1",
    player2Name: "Player 2",
    player1Avatar: "1",
    player2Avatar: "2",
  })

  // Helper function to convert our new format to the old format for compatibility
  const convertWinResult = (result: ReturnType<typeof checkWin>): number[][] | null => {
    if (!result) return null
    return result.line.map(pos => [pos.row, pos.col])
  }

  // Start the game
  const startGame = () => {
    const boardSize = Number.parseInt(setupData.boardSize)
    const playerCount = Number.parseInt(setupData.playerCount)

    const players: LocalPlayer[] = [
      {
        id: "player-1",
        name: setupData.player1Name || "Player 1",
        symbol: "X",
        avatarId: Number.parseInt(setupData.player1Avatar),
      },
      {
        id: "player-2",
        name: setupData.player2Name || "Player 2",
        symbol: "O",
        avatarId: Number.parseInt(setupData.player2Avatar),
      },
    ]

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

  // Make a move
  const makeMove = (row: number, col: number) => {
    if (gameState.board[row][col] !== "" || gameState.winner || gameState.isDraw) {
      return
    }

    const newBoard = gameState.board.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? gameState.currentTurn : c)),
    )

    // Play sound effect
    playMoveSound()

    // Check for win
    const winResult = checkWin(newBoard, 3)
    const isDraw = !winResult && isBoardFull(newBoard)
    const winLine = convertWinResult(winResult)

    const newScores = { ...gameState.scores }
    if (winResult) {
      newScores[gameState.currentTurn] = (newScores[gameState.currentTurn] || 0) + 1
      playWinSound()
    } else if (isDraw) {
      playDrawSound()
    }

    // Determine next turn
    const nextTurn = getNextPlayer(gameState.currentTurn)

    setGameState({
      ...gameState,
      board: newBoard,
      currentTurn: winResult || isDraw ? gameState.currentTurn : nextTurn,
      winner: winResult ? { symbol: gameState.currentTurn, line: winLine! } : null,
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

  if (!gameState.gameStarted) {
    return (
      <DashboardShell>
        <div className="w-full h-full flex flex-col justify-center items-center p-4 py-8">
          <div className="w-full max-w-lg mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
              </div>

              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 text-white mb-4 sm:mb-6 shadow-2xl">
                <Users className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 dark:from-green-400 dark:via-teal-400 dark:to-blue-400 text-transparent bg-clip-text">
                    Local Multiplayer
                  </h1>
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1">
                    CLASSIC
                  </Badge>
                </div>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
                  Play with friends on the same device. Take turns and see who's the best!
                </p>
              </div>
            </div>

            {/* Setup Card */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 sm:gap-3">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  Game Setup
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  Configure your local multiplayer game
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-8 pb-6 sm:pb-8">
                {/* Player 1 */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">Player 1 (X)</Label>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Enter player 1 name"
                      value={setupData.player1Name}
                      onChange={(e) => setSetupData({ ...setupData, player1Name: e.target.value })}
                      className="flex-1 h-10 sm:h-12 px-4 text-base sm:text-lg border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Select
                      value={setupData.player1Avatar}
                      onValueChange={(value) => setSetupData({ ...setupData, player1Avatar: value })}
                    >
                      <SelectTrigger className="w-24 h-10 sm:h-12">
                        <SelectValue placeholder="Avatar" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((id) => (
                          <SelectItem key={id} value={id.toString()}>
                            Avatar {id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Player 2 */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">Player 2 (O)</Label>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Enter player 2 name"
                      value={setupData.player2Name}
                      onChange={(e) => setSetupData({ ...setupData, player2Name: e.target.value })}
                      className="flex-1 h-10 sm:h-12 px-4 text-base sm:text-lg border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <Select
                      value={setupData.player2Avatar}
                      onValueChange={(value) => setSetupData({ ...setupData, player2Avatar: value })}
                    >
                      <SelectTrigger className="w-24 h-10 sm:h-12">
                        <SelectValue placeholder="Avatar" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((id) => (
                          <SelectItem key={id} value={id.toString()}>
                            Avatar {id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Board Size Selection */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold">Board Size</Label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[
                      { value: "3", label: "3×3", desc: "Classic" },
                      { value: "4", label: "4×4", desc: "Extended" },
                      { value: "5", label: "5×5", desc: "Challenge" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSetupData({ ...setupData, boardSize: option.value })}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 touch-manipulation ${
                          setupData.boardSize === option.value
                            ? "border-green-500 bg-green-50 dark:bg-green-950/50 shadow-lg"
                            : "border-slate-200 dark:border-slate-700 hover:border-green-300"
                        }`}
                      >
                        <div className="text-base sm:text-lg font-bold">{option.label}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={startGame}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 touch-manipulation"
                >
                  <Play className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                  Start Local Game
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
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 text-transparent bg-clip-text">
                Local Multiplayer Game
              </h1>
              <Button variant="outline" onClick={backToSetup} size="sm" className="touch-manipulation">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Setup
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {gameState.boardSize}×{gameState.boardSize} board • {gameState.players.length} players
            </p>
          </div>

          {/* Game Status */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <GameStatus
                waitingForOpponent={false}
                winner={gameState.winner}
                isDraw={gameState.isDraw}
                isPlayerTurn={true}
                playerSymbol={gameState.currentTurn}
                currentTurnPlayerName={currentPlayer?.name}
                winnerName={winnerPlayer?.name}
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
                      isYou={player.id === "player-1"}
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
                disabled={!!gameState.winner || gameState.isDraw}
              />
            </div>
          </div>

          {/* Play Again Button */}
          {(gameState.winner || gameState.isDraw) && (
            <div className="flex justify-center">
              <Button
                onClick={playAgain}
                className="h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 touch-manipulation"
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
              <Card className="w-full max-w-sm bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50 border-green-200 dark:border-green-800 shadow-lg">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 animate-pulse" />
                    <span className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300">
                      {currentPlayer.name}'s Turn
                    </span>
                    <div className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded bg-gradient-to-br from-green-500 to-blue-600 text-white font-bold text-xs sm:text-sm">
                      {currentPlayer.symbol}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Tap any empty cell to make your move</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
