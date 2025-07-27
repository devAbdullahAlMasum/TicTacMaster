"use client"

import { useState, useEffect } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { EnhancedGameBoard } from "@/components/enhanced-game-board"
import { PageLoader } from "@/components/page-loader"
import { ArrowRight, Users, RotateCcw, Home, Trophy, Zap, Play, Sparkles, Crown, Star } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"

interface GameState {
  gameStarted: boolean
  board: string[][]
  currentTurn: "X" | "O"
  players: Array<{ name: string; symbol: "X" | "O" }>
  winner: { player: string; symbol: "X" | "O"; line: number[][] } | null
  isDraw: boolean
  boardSize: number
  scores: { [key: string]: number }
}

export default function LocalMultiplayerPage() {
  const { settings } = useSettings()
  const { playMoveSound, playWinSound, playDrawSound, playClickSound } = useSoundEffects()
  const { getStyles, currentTheme } = useThemeSystem()

  const [setupData, setSetupData] = useState({
    player1Name: "Player 1",
    player2Name: "Player 2",
    boardSize: "3",
  })

  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    board: [],
    currentTurn: "X",
    players: [],
    winner: null,
    isDraw: false,
    boardSize: 3,
    scores: {},
  })

  // Initialize empty board
  const createEmptyBoard = (size: number): string[][] => {
    return Array(size).fill(null).map(() => Array(size).fill(""))
  }

  // Check for winner
  const checkWinner = (board: string[][], size: number) => {
    // Check rows, columns, and diagonals
    for (let i = 0; i < size; i++) {
      // Check rows
      if (board[i][0] && board[i].every(cell => cell === board[i][0])) {
        return { line: board[i].map((_, j) => [i, j]), symbol: board[i][0] }
      }
      // Check columns
      if (board[0][i] && board.every(row => row[i] === board[0][i])) {
        return { line: board.map((_, j) => [j, i]), symbol: board[0][i] }
      }
    }
    
    // Check diagonals
    if (board[0][0] && board.every((row, i) => row[i] === board[0][0])) {
      return { line: board.map((_, i) => [i, i]), symbol: board[0][0] }
    }
    if (board[0][size-1] && board.every((row, i) => row[size-1-i] === board[0][size-1])) {
      return { line: board.map((_, i) => [i, size-1-i]), symbol: board[0][size-1] }
    }
    
    return null
  }

  // Start game
  const startGame = () => {
    playClickSound()
    const size = parseInt(setupData.boardSize)
    const players = [
      { name: setupData.player1Name, symbol: "X" as const },
      { name: setupData.player2Name, symbol: "O" as const }
    ]
    
    setGameState({
      gameStarted: true,
      board: createEmptyBoard(size),
      currentTurn: "X",
      players,
      winner: null,
      isDraw: false,
      boardSize: size,
      scores: { [setupData.player1Name]: 0, [setupData.player2Name]: 0 }
    })
  }

  // Make move
  const makeMove = (row: number, col: number) => {
    if (gameState.board[row][col] || gameState.winner || gameState.isDraw) return

    const newBoard = gameState.board.map(r => [...r])
    newBoard[row][col] = gameState.currentTurn
    
    const winner = checkWinner(newBoard, gameState.boardSize)
    const isDraw = !winner && newBoard.every(row => row.every(cell => cell !== ""))
    
    if (winner) {
      const winningPlayer = gameState.players.find(p => p.symbol === winner.symbol)!
      playWinSound()
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        winner: { player: winningPlayer.name, symbol: winner.symbol, line: winner.line },
        scores: { ...prev.scores, [winningPlayer.name]: prev.scores[winningPlayer.name] + 1 }
      }))
    } else if (isDraw) {
      playDrawSound()
      setGameState(prev => ({ ...prev, board: newBoard, isDraw: true }))
    } else {
      playMoveSound()
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentTurn: prev.currentTurn === "X" ? "O" : "X"
      }))
    }
  }

  // Play again
  const playAgain = () => {
    playClickSound()
    setGameState(prev => ({
      ...prev,
      board: createEmptyBoard(prev.boardSize),
      currentTurn: "X",
      winner: null,
      isDraw: false
    }))
  }

  // Back to setup
  const backToSetup = () => {
    playClickSound()
    setGameState(prev => ({ ...prev, gameStarted: false }))
  }

  const currentPlayer = gameState.players.find(p => p.symbol === gameState.currentTurn)

  return (
    <PageLoader>
      <EnhancedDashboardShell>
        {!gameState.gameStarted ? (
          // Setup Screen
          <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className={cn(
                  "inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg",
                  getStyles("sidebar.background")
                )}>
                  <Users className="h-6 w-6 text-white" />
                  <span className="text-white font-semibold">Local Multiplayer</span>
                </div>
                <p className={cn("text-lg", getStyles("text.secondary"))}>
                  Play with friends on the same device. Take turns and see who's the best!
                </p>
              </div>

              {/* Setup Card */}
              <EnhancedCard variant="elevated" className={cn("max-w-2xl mx-auto", getStyles("card.base"))}>
                <EnhancedCardHeader className="text-center">
                  <EnhancedCardTitle className="flex items-center justify-center gap-3">
                    <Play className={cn("h-6 w-6", getStyles("text.accent"))} />
                    Game Setup
                  </EnhancedCardTitle>
                  <EnhancedCardDescription>Configure your local multiplayer game</EnhancedCardDescription>
                </EnhancedCardHeader>
                
                <EnhancedCardContent className="space-y-6">
                  {/* Player Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Player 1 (X)</Label>
                      <Input
                        value={setupData.player1Name}
                        onChange={(e) => setSetupData(prev => ({ ...prev, player1Name: e.target.value }))}
                        className={cn(getStyles("input.base"), getStyles("input.focus"))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Player 2 (O)</Label>
                      <Input
                        value={setupData.player2Name}
                        onChange={(e) => setSetupData(prev => ({ ...prev, player2Name: e.target.value }))}
                        className={cn(getStyles("input.base"), getStyles("input.focus"))}
                      />
                    </div>
                  </div>

                  {/* Board Size */}
                  <div className="space-y-3">
                    <Label>Board Size</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "3", label: "3×3", desc: "Classic" },
                        { value: "4", label: "4×4", desc: "Extended" },
                        { value: "5", label: "5×5", desc: "Challenge" },
                      ].map((option) => (
                        <EnhancedButton
                          key={option.value}
                          variant={setupData.boardSize === option.value ? "default" : "outline"}
                          onClick={() => setSetupData(prev => ({ ...prev, boardSize: option.value }))}
                          className="h-16 flex-col gap-1"
                        >
                          <div className="font-bold">{option.label}</div>
                          <div className="text-xs opacity-70">{option.desc}</div>
                        </EnhancedButton>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <EnhancedButton
                    onClick={startGame}
                    className={cn(
                      "w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
                      getStyles("animations.transition")
                    )}
                    icon={<Play className="h-5 w-5" />}
                  >
                    <span className="flex items-center gap-3">
                      Start Local Game
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </EnhancedButton>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </div>
        ) : (
          // Game Screen
          <div className="container mx-auto max-w-6xl py-8 px-4">
            <div className="space-y-8">
              {/* Game Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <h1 className={cn("text-2xl font-bold", getStyles("text.primary"))}>
                    Local Multiplayer Game
                  </h1>
                  <EnhancedButton variant="outline" onClick={backToSetup} size="sm" icon={<Home className="h-4 w-4" />}>
                    Setup
                  </EnhancedButton>
                </div>
                
                {/* Scores */}
                <div className="flex justify-center gap-6">
                  {gameState.players.map((player) => (
                    <div key={player.name} className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      getStyles("card.base")
                    )}>
                      <Crown className={cn("h-4 w-4", getStyles("text.accent"))} />
                      <span className={cn("font-medium", getStyles("text.primary"))}>{player.name}</span>
                      <Badge variant="secondary">{gameState.scores[player.name]}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Board */}
              <div className="flex justify-center">
                <EnhancedGameBoard
                  board={gameState.board}
                  onCellClick={makeMove}
                  winnerLine={gameState.winner?.line}
                  disabled={!!gameState.winner || gameState.isDraw}
                />
              </div>

              {/* Game Status */}
              {gameState.winner ? (
                <div className="text-center space-y-4">
                  <div className={cn(
                    "inline-flex items-center gap-3 px-6 py-3 rounded-full",
                    "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                  )}>
                    <Trophy className="h-6 w-6" />
                    <span className="font-bold text-lg">{gameState.winner.player} Wins!</span>
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
              ) : gameState.isDraw ? (
                <div className="text-center">
                  <div className={cn(
                    "inline-flex items-center gap-3 px-6 py-3 rounded-full",
                    getStyles("card.base"), getStyles("text.primary")
                  )}>
                    <Star className="h-6 w-6" />
                    <span className="font-bold text-lg">It's a Draw!</span>
                  </div>
                </div>
              ) : currentPlayer && (
                <div className="text-center">
                  <EnhancedCard className="max-w-sm mx-auto">
                    <EnhancedCardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
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
                        Tap any empty cell to make your move
                      </p>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </div>
              )}

              {/* Play Again Button */}
              {(gameState.winner || gameState.isDraw) && (
                <div className="flex justify-center">
                  <EnhancedButton
                    onClick={playAgain}
                    className={cn(
                      "h-12 px-6 font-semibold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
                      getStyles("animations.transition")
                    )}
                    icon={<RotateCcw className="h-4 w-4" />}
                  >
                    <span className="flex items-center gap-2">
                      Play Again
                      <Sparkles className="h-4 w-4" />
                    </span>
                  </EnhancedButton>
                </div>
              )}
            </div>
          </div>
        )}
      </EnhancedDashboardShell>
    </PageLoader>
  )
}
