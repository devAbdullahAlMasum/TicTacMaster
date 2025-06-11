"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardShell } from "@/components/dashboard-shell"
import { GameBoard } from "@/components/game-board"
import { PlayerInfo } from "@/components/player-info"
import { GameStatus } from "@/components/game-status"
import { ArrowRight, Users, Home, Trophy, Zap, Play, RotateCcw, Sparkles } from "lucide-react"

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
    player1Name: "",
    player2Name: "",
    player3Name: "",
    player4Name: "",
  })

  // Initialize empty board
  const createEmptyBoard = (size: number): string[][] => {
    return Array(size)
      .fill("")
      .map(() => Array(size).fill(""))
  }

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

  // Start the game
  const startGame = () => {
    const boardSize = Number.parseInt(setupData.boardSize)
    const playerCount = Number.parseInt(setupData.playerCount)

    const players: LocalPlayer[] = []
    const symbols = ["X", "O", "Δ", "□"]

    for (let i = 0; i < playerCount; i++) {
      const playerName = setupData[`player${i + 1}Name` as keyof typeof setupData] || `Player ${i + 1}`
      players.push({
        id: `player-${i + 1}`,
        name: playerName,
        symbol: symbols[i],
        avatarId: i + 1,
      })
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

  // Make a move
  const makeMove = (row: number, col: number) => {
    if (gameState.board[row][col] !== "" || gameState.winner || gameState.isDraw) {
      return
    }

    const newBoard = gameState.board.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? gameState.currentTurn : c)),
    )

    // Check for win
    const winResult = checkWin(newBoard, gameState.currentTurn, gameState.boardSize)
    const isDraw = !winResult && newBoard.every((row) => row.every((cell) => cell !== ""))

    const newScores = { ...gameState.scores }
    if (winResult) {
      newScores[gameState.currentTurn] = (newScores[gameState.currentTurn] || 0) + 1
    }

    // Determine next turn
    const playerSymbols = gameState.players.map((p) => p.symbol)
    const currentIndex = playerSymbols.indexOf(gameState.currentTurn)
    const nextIndex = (currentIndex + 1) % playerSymbols.length
    const nextTurn = playerSymbols[nextIndex]

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

  if (!gameState.gameStarted) {
    return (
      <DashboardShell>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* Header Section */}
            <div className="text-center mb-12 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
              </div>

              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-2xl">
                <Users className="w-10 h-10" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 text-transparent bg-clip-text">
                    Local Multiplayer
                  </h1>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 text-sm px-3 py-1">
                    NEW
                  </Badge>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Play with friends on the same device! Take turns and enjoy classic Tic-Tac-Toe together in person.
                </p>
              </div>
            </div>

            {/* Setup Card */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
                  <Play className="w-6 h-6 text-emerald-600" />
                  Game Setup
                </CardTitle>
                <CardDescription className="text-lg">Configure your local multiplayer game settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 px-8 pb-8">
                {/* Board Size Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Board Size</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "3", label: "3×3", desc: "Classic" },
                      { value: "4", label: "4×4", desc: "Extended" },
                      { value: "5", label: "5×5", desc: "Challenge" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSetupData({ ...setupData, boardSize: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                          setupData.boardSize === option.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-lg"
                            : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                        }`}
                      >
                        <div className="text-lg font-bold">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Count Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Number of Players</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "2", label: "2 Players", symbols: ["X", "O"] },
                      { value: "3", label: "3 Players", symbols: ["X", "O", "Δ"] },
                      { value: "4", label: "4 Players", symbols: ["X", "O", "Δ", "□"] },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSetupData({ ...setupData, playerCount: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                          setupData.playerCount === option.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-lg"
                            : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                        }`}
                      >
                        <div className="text-lg font-bold mb-2">{option.label}</div>
                        <div className="flex justify-center gap-1">
                          {option.symbols.map((symbol, i) => (
                            <span
                              key={i}
                              className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs flex items-center justify-center font-bold"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Names */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Player Names</Label>
                  <div className="grid gap-4">
                    {Array.from({ length: Number.parseInt(setupData.playerCount) }, (_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg">
                          {["X", "O", "Δ", "□"][i]}
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder={`Enter Player ${i + 1} name`}
                            value={setupData[`player${i + 1}Name` as keyof typeof setupData]}
                            onChange={(e) =>
                              setSetupData({
                                ...setupData,
                                [`player${i + 1}Name`]: e.target.value,
                              })
                            }
                            className="text-lg h-12 border-0 bg-white dark:bg-slate-900 shadow-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={startGame}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <Play className="mr-3 h-5 w-5" />
                  Start Local Game
                  <ArrowRight className="ml-3 h-5 w-5" />
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Game Header - Centered */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 text-transparent bg-clip-text">
                Local Multiplayer Game
              </h1>
              <Button variant="outline" onClick={backToSetup} size="sm">
                <Home className="h-4 w-4 mr-1" />
                Setup
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {gameState.boardSize}×{gameState.boardSize} board • {gameState.players.length} players
            </p>
          </div>

          {/* Game Status - Centered */}
          <div className="flex justify-center">
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

          {/* Players - Centered in a compact row */}
          <div className="flex justify-center">
            <div className="flex gap-8 items-center">
              {gameState.players.map((player) => (
                <div key={player.id} className="flex flex-col items-center space-y-2">
                  <PlayerInfo
                    name={player.name}
                    avatarId={player.avatarId}
                    symbol={player.symbol}
                    isCurrentTurn={gameState.currentTurn === player.symbol && !gameState.winner && !gameState.isDraw}
                    isWinner={gameState.winner?.symbol === player.symbol}
                    isYou={false}
                  />
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    {gameState.scores[player.symbol] || 0}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Game Board - Centered */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <GameBoard
                board={gameState.board}
                onCellClick={makeMove}
                winnerLine={gameState.winner?.line}
                disabled={!!gameState.winner || gameState.isDraw}
              />
            </div>
          </div>

          {/* Play Again Button - Under Grid, Centered */}
          {(gameState.winner || gameState.isDraw) && (
            <div className="flex justify-center">
              <Button
                onClick={playAgain}
                className="h-11 px-6 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Current Turn Indicator - Centered */}
          {!gameState.winner && !gameState.isDraw && currentPlayer && (
            <div className="flex justify-center">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {currentPlayer.name}'s Turn
                    </span>
                    <div className="flex items-center justify-center h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                      {currentPlayer.symbol}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Tap any empty cell to make your move</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
