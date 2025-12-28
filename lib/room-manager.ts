// Room Management System
export interface Player {
  id: string
  name: string
  avatar: string
  symbol: "X" | "O" | null
  isHost: boolean
  isReady: boolean
  score: number
  joinedAt: string
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: string
  type: "message" | "system" | "game"
}

export interface GameRoom {
  id: string
  name: string
  description: string
  hostId: string
  hostName: string
  players: Player[]
  spectators: Player[]
  maxPlayers: number
  boardSize: number
  isPrivate: boolean
  password: string
  allowSpectators: boolean
  status: "waiting" | "playing" | "finished"
  currentTurn: "X" | "O" | null
  board: string[][]
  winner: { playerId: string; playerName: string; symbol: "X" | "O"; line: number[][] } | null
  isDraw: boolean
  gameHistory: any[]
  chatMessages: ChatMessage[]
  createdAt: string
  settings: {
    timeLimit: number
    autoStart: boolean
    allowRestart: boolean
  }
}

// In-memory room storage with localStorage persistence
let rooms = new Map<string, GameRoom>()
let playerRooms = new Map<string, string>() // playerId -> roomId

// Load from localStorage on initialization
if (typeof window !== "undefined") {
  try {
    const savedRooms = localStorage.getItem("tictac_rooms")
    const savedPlayerRooms = localStorage.getItem("tictac_player_rooms")

    if (savedRooms) {
      const roomsData = JSON.parse(savedRooms)
      rooms = new Map(Object.entries(roomsData))
    }

    if (savedPlayerRooms) {
      const playerRoomsData = JSON.parse(savedPlayerRooms)
      playerRooms = new Map(Object.entries(playerRoomsData))
    }
  } catch (error) {
    console.error("Failed to load rooms from localStorage:", error)
  }
}

// Save to localStorage
function saveToStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("tictac_rooms", JSON.stringify(Object.fromEntries(rooms)))
      localStorage.setItem("tictac_player_rooms", JSON.stringify(Object.fromEntries(playerRooms)))
    } catch (error) {
      console.error("Failed to save rooms to localStorage:", error)
    }
  }
}

// Generate unique room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Create new room
export function createRoom(hostId: string, hostName: string, roomData: {
  name: string
  description: string
  maxPlayers: number
  boardSize: number
  isPrivate: boolean
  password: string
  allowSpectators: boolean
  timeLimit: number
}): GameRoom {
  const roomId = generateRoomCode()
  
  const host: Player = {
    id: hostId,
    name: hostName,
    avatar: `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
    symbol: null,
    isHost: true,
    isReady: false,
    score: 0,
    joinedAt: new Date().toISOString()
  }

  const room: GameRoom = {
    id: roomId,
    name: roomData.name,
    description: roomData.description,
    hostId,
    hostName,
    players: [host],
    spectators: [],
    maxPlayers: roomData.maxPlayers,
    boardSize: roomData.boardSize,
    isPrivate: roomData.isPrivate,
    password: roomData.password,
    allowSpectators: roomData.allowSpectators,
    status: "waiting",
    currentTurn: null,
    board: createEmptyBoard(roomData.boardSize),
    winner: null,
    isDraw: false,
    gameHistory: [],
    chatMessages: [{
      id: Date.now().toString(),
      playerId: "system",
      playerName: "System",
      message: `Room created by ${hostName}`,
      timestamp: new Date().toISOString(),
      type: "system"
    }],
    createdAt: new Date().toISOString(),
    settings: {
      timeLimit: roomData.timeLimit,
      autoStart: false,
      allowRestart: true
    }
  }

  rooms.set(roomId, room)
  playerRooms.set(hostId, roomId)
  saveToStorage()

  return room
}

// Join room
export function joinRoom(playerId: string, playerName: string, roomId: string, password?: string): {
  success: boolean
  room?: GameRoom
  error?: string
} {
  const room = rooms.get(roomId)
  
  if (!room) {
    return { success: false, error: "Room not found" }
  }

  if (room.isPrivate && room.password !== password) {
    return { success: false, error: "Invalid password" }
  }

  if (room.players.length >= room.maxPlayers) {
    if (room.allowSpectators) {
      // Join as spectator
      const spectator: Player = {
        id: playerId,
        name: playerName,
        avatar: `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
        symbol: null,
        isHost: false,
        isReady: false,
        score: 0,
        joinedAt: new Date().toISOString()
      }
      
      room.spectators.push(spectator)
      addChatMessage(roomId, "system", "System", `${playerName} joined as spectator`, "system")
    } else {
      return { success: false, error: "Room is full" }
    }
  } else {
    // Join as player
    const player: Player = {
      id: playerId,
      name: playerName,
      avatar: `/avatars/avatar-${Math.floor(Math.random() * 5) + 1}.png`,
      symbol: room.players.length === 0 ? "X" : room.players.length === 1 ? "O" : null,
      isHost: false,
      isReady: false,
      score: 0,
      joinedAt: new Date().toISOString()
    }
    
    room.players.push(player)
    playerRooms.set(playerId, roomId)
    addChatMessage(roomId, "system", "System", `${playerName} joined the game`, "system")
  }

  saveToStorage()
  return { success: true, room }
}

// Leave room
export function leaveRoom(playerId: string): boolean {
  const roomId = playerRooms.get(playerId)
  if (!roomId) return false

  const room = rooms.get(roomId)
  if (!room) return false

  // Remove from players or spectators
  room.players = room.players.filter(p => p.id !== playerId)
  room.spectators = room.spectators.filter(p => p.id !== playerId)
  
  const player = [...room.players, ...room.spectators].find(p => p.id === playerId)
  if (player) {
    addChatMessage(roomId, "system", "System", `${player.name} left the game`, "system")
  }

  // If host left, assign new host or delete room
  if (room.hostId === playerId) {
    if (room.players.length > 0) {
      const newHost = room.players[0]
      room.hostId = newHost.id
      room.hostName = newHost.name
      newHost.isHost = true
      addChatMessage(roomId, "system", "System", `${newHost.name} is now the host`, "system")
    } else {
      // Delete empty room
      rooms.delete(roomId)
    }
  }

  playerRooms.delete(playerId)
  saveToStorage()
  return true
}

// Get room
export function getRoom(roomId: string): GameRoom | null {
  return rooms.get(roomId) || null
}

// Get all public rooms
export function getPublicRooms(): GameRoom[] {
  return Array.from(rooms.values()).filter(room => !room.isPrivate && room.status === "waiting")
}

// Add chat message
export function addChatMessage(roomId: string, playerId: string, playerName: string, message: string, type: "message" | "system" | "game" = "message"): boolean {
  const room = rooms.get(roomId)
  if (!room) return false

  const chatMessage: ChatMessage = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    playerId,
    playerName,
    message,
    timestamp: new Date().toISOString(),
    type
  }

  room.chatMessages.push(chatMessage)

  // Keep only last 100 messages
  if (room.chatMessages.length > 100) {
    room.chatMessages = room.chatMessages.slice(-100)
  }

  saveToStorage()
  return true
}

// Create empty board
function createEmptyBoard(size: number): string[][] {
  return Array(size).fill(null).map(() => Array(size).fill(""))
}

// Start game
export function startGame(roomId: string, hostId: string): boolean {
  const room = rooms.get(roomId)
  if (!room || room.hostId !== hostId || room.players.length < 2) return false

  // Assign symbols if not already assigned
  if (room.players.length >= 2) {
    room.players[0].symbol = "X"
    room.players[1].symbol = "O"
  }

  room.status = "playing"
  room.currentTurn = "X"
  room.board = createEmptyBoard(room.boardSize)
  room.winner = null
  room.isDraw = false

  addChatMessage(roomId, "system", "System", "Game started!", "game")
  saveToStorage()
  return true
}

// Make move
export function makeMove(roomId: string, playerId: string, row: number, col: number): {
  success: boolean
  room?: GameRoom
  error?: string
} {
  console.log("makeMove called:", { roomId, playerId, row, col })

  const room = rooms.get(roomId)
  if (!room) {
    console.log("Room not found:", roomId)
    return { success: false, error: "Room not found" }
  }

  console.log("Room status:", room.status, "Current turn:", room.currentTurn)

  if (room.status !== "playing") {
    console.log("Game not in progress, status:", room.status)
    return { success: false, error: "Game not in progress" }
  }

  const player = room.players.find(p => p.id === playerId)
  console.log("Player found:", !!player, "Player symbol:", player?.symbol, "Current turn:", room.currentTurn)

  if (!player || player.symbol !== room.currentTurn) {
    return { success: false, error: "Not your turn" }
  }

  if (room.board[row][col] !== "") {
    console.log("Cell already occupied:", row, col, "value:", room.board[row][col])
    return { success: false, error: "Cell already occupied" }
  }

  // Make the move
  room.board[row][col] = player.symbol!
  
  // Check for winner
  const winner = checkWinner(room.board, room.boardSize)
  if (winner) {
    const winningPlayer = room.players.find(p => p.symbol === winner.symbol)!
    room.winner = {
      playerId: winningPlayer.id,
      playerName: winningPlayer.name,
      symbol: winner.symbol,
      line: winner.line
    }
    room.status = "finished"
    winningPlayer.score++
    addChatMessage(roomId, "system", "System", `${winningPlayer.name} wins!`, "game")
  } else if (room.board.every(row => row.every(cell => cell !== ""))) {
    // Draw
    room.isDraw = true
    room.status = "finished"
    addChatMessage(roomId, "system", "System", "Game ended in a draw!", "game")
  } else {
    // Switch turns
    room.currentTurn = room.currentTurn === "X" ? "O" : "X"
  }

  saveToStorage()
  return { success: true, room }
}

// Check winner
function checkWinner(board: string[][], size: number) {
  // Check rows, columns, and diagonals
  for (let i = 0; i < size; i++) {
    // Check rows
    if (board[i][0] && board[i].every(cell => cell === board[i][0])) {
      return { line: board[i].map((_, j) => [i, j]), symbol: board[i][0] as "X" | "O" }
    }
    // Check columns
    if (board[0][i] && board.every(row => row[i] === board[0][i])) {
      return { line: board.map((_, j) => [j, i]), symbol: board[0][i] as "X" | "O" }
    }
  }
  
  // Check diagonals
  if (board[0][0] && board.every((row, i) => row[i] === board[0][0])) {
    return { line: board.map((_, i) => [i, i]), symbol: board[0][0] as "X" | "O" }
  }
  if (board[0][size-1] && board.every((row, i) => row[size-1-i] === board[0][size-1])) {
    return { line: board.map((_, i) => [i, size-1-i]), symbol: board[0][size-1] as "X" | "O" }
  }
  
  return null
}

// Reset game
export function resetGame(roomId: string, hostId: string): boolean {
  const room = rooms.get(roomId)
  if (!room || room.hostId !== hostId) return false

  room.status = "waiting"
  room.currentTurn = null
  room.board = createEmptyBoard(room.boardSize)
  room.winner = null
  room.isDraw = false
  
  // Reset player ready status
  room.players.forEach(player => {
    player.isReady = false
  })

  addChatMessage(roomId, "system", "System", "Game reset by host", "system")
  saveToStorage()
  return true
}
