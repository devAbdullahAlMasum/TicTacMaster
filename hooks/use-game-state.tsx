"use client"

import { useEffect, useState } from "react"
import type { Socket } from "socket.io-client"

interface Player {
  id: string
  name: string
  avatarId: number
  symbol: string
}

interface GameState {
  board: string[][]
  currentTurn: string
  players: Player[]
  winner: { symbol: string; line: number[][] } | null
  isDraw: boolean
}

interface PlayerData {
  name: string
  avatarId: number
  isHost: boolean
}

export function useGameState(socket: Socket | null, roomCode: string, playerData: PlayerData) {
  const [gameState, setGameState] = useState<string[][]>([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ])

  const [players, setPlayers] = useState<Player[]>([])
  const [currentTurn, setCurrentTurn] = useState<string>("X")
  const [winner, setWinner] = useState<{ symbol: string; line: number[][] } | null>(null)
  const [isDraw, setIsDraw] = useState(false)

  useEffect(() => {
    if (!socket) return

    // Join the room when socket is connected
    socket.emit("joinRoom", {
      roomCode,
      player: {
        name: playerData.name,
        avatarId: playerData.avatarId,
        isHost: playerData.isHost,
      },
    })

    // Add the current player to the players list
    const currentPlayer: Player = {
      id: socket.id,
      name: playerData.name,
      avatarId: playerData.avatarId,
      symbol: playerData.isHost ? "X" : "O",
    }

    // Add player only once when socket is initialized
    setPlayers((prev) => {
      // Check if player already exists
      if (prev.some((p) => p.id === currentPlayer.id)) {
        return prev
      }
      return [...prev, currentPlayer]
    })

    // Simulate persistent game state between players with the same room code
    // This uses localStorage to persist game state across browser tabs/windows
    const savedGameState = localStorage.getItem(`game-${roomCode}`)
    if (savedGameState) {
      try {
        const parsedState = JSON.parse(savedGameState)
        setGameState(parsedState.board || gameState)
        setCurrentTurn(parsedState.currentTurn || currentTurn)
        if (parsedState.winner) setWinner(parsedState.winner)
        setIsDraw(parsedState.isDraw || false)

        // Add existing players if any
        if (parsedState.players && parsedState.players.length) {
          setPlayers((prev) => {
            const existingIds = prev.map((p) => p.id)
            const newPlayers = parsedState.players.filter((p) => !existingIds.includes(p.id))
            return [...prev, ...newPlayers]
          })
        }
      } catch (e) {
        console.error("Error parsing saved game state", e)
      }
    }

    // Listen for game state updates
    const handleGameState = (state: GameState) => {
      setGameState(state.board)
      setCurrentTurn(state.currentTurn)
      setPlayers(state.players)
      setWinner(state.winner)
      setIsDraw(state.isDraw)

      // Save game state to localStorage for persistence
      localStorage.setItem(`game-${roomCode}`, JSON.stringify(state))
    }

    // Listen for player joined event
    const handlePlayerJoined = (player: Player) => {
      setPlayers((prev) => {
        // Check if player already exists
        if (prev.some((p) => p.id === player.id)) {
          return prev
        }
        return [...prev, player]
      })
    }

    socket.on("gameState", handleGameState)
    socket.on("playerJoined", handlePlayerJoined)

    // Clean up event listeners
    return () => {
      socket.off("gameState", handleGameState)
      socket.off("playerJoined", handlePlayerJoined)
    }
  }, [socket, roomCode, playerData])

  // Check for win or draw
  const checkGameStatus = (board: string[][], symbol: string) => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] === symbol && board[i][1] === symbol && board[i][2] === symbol) {
        return {
          winner: symbol,
          line: [
            [i, 0],
            [i, 1],
            [i, 2],
          ],
        }
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board[0][i] === symbol && board[1][i] === symbol && board[2][i] === symbol) {
        return {
          winner: symbol,
          line: [
            [0, i],
            [1, i],
            [2, i],
          ],
        }
      }
    }

    // Check diagonals
    if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) {
      return {
        winner: symbol,
        line: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      }
    }

    if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) {
      return {
        winner: symbol,
        line: [
          [0, 2],
          [1, 1],
          [2, 0],
        ],
      }
    }

    // Check for draw
    const isDraw = board.every((row) => row.every((cell) => cell !== ""))

    return { winner: null, isDraw }
  }

  // Make a move
  const makeMove = (row: number, col: number) => {
    if (!socket || gameState[row][col] !== "" || winner || isDraw) return

    // Get the current player's symbol
    const currentPlayer = players.find((p) => p.id === socket.id)
    if (!currentPlayer || currentPlayer.symbol !== currentTurn) return

    // Update the board
    const newBoard = gameState.map((r, i) => r.map((c, j) => (i === row && j === col ? currentTurn : c)))

    // Check for win or draw
    const { winner: newWinner, isDraw: newIsDraw } = checkGameStatus(newBoard, currentTurn)

    // Update the game state
    const newGameState = {
      board: newBoard,
      currentTurn: currentTurn === "X" ? "O" : "X",
      players,
      winner: newWinner ? { symbol: currentTurn, line: newWinner.line } : null,
      isDraw: newIsDraw,
    }

    // Emit the updated game state - this will trigger the gameState event handler
    // which will update all the state values
    socket.emit("gameState", newGameState)

    // Save to localStorage for persistence between tabs/windows
    localStorage.setItem(`game-${roomCode}`, JSON.stringify(newGameState))

    // Don't update local state here as it will be updated by the gameState event handler
  }

  // Reset the game
  const resetGame = () => {
    if (!socket || !playerData.isHost) return

    const newGameState = {
      board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
      currentTurn: "X",
      players,
      winner: null,
      isDraw: false,
    }

    // Emit the reset game state
    socket.emit("gameState", newGameState)

    // Clear localStorage for this room
    localStorage.setItem(`game-${roomCode}`, JSON.stringify(newGameState))

    // Update local state
    setGameState(newGameState.board)
    setCurrentTurn(newGameState.currentTurn)
    setWinner(null)
    setIsDraw(false)
  }

  // Add a player to the game
  const addPlayer = (player: Player) => {
    setPlayers((prev) => {
      if (prev.some((p) => p.id === player.id)) return prev
      return [...prev, player]
    })
  }

  return {
    gameState,
    players,
    currentTurn,
    winner,
    isDraw,
    makeMove,
    resetGame,
    addPlayer,
  }
}
