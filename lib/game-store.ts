// This file creates a centralized store for game state using localStorage
// to simulate a server and enable communication between browser tabs/windows

type Player = {
  id: string
  name: string
  avatarId: number
  symbol: string
}

type GameState = {
  board: string[][]
  currentTurn: string
  players: Player[]
  winner: { symbol: string; line: number[][] } | null
  isDraw: boolean
  lastUpdated: number
  boardSize: string
  playerCount: string
  chatEnabled: boolean
  chatFilter: boolean
}

export type ChatMessage = {
  sender: string
  text: string
  timestamp: number
  id: string
  filtered?: boolean
}

// Initialize empty game state
const createEmptyGameState = (
  boardSize = "3",
  playerCount = "2",
  chatEnabled = true,
  chatFilter = true,
): GameState => ({
  board: Array(Number.parseInt(boardSize))
    .fill("")
    .map(() => Array(Number.parseInt(boardSize)).fill("")),
  currentTurn: "X",
  players: [],
  winner: null,
  isDraw: false,
  lastUpdated: Date.now(),
  boardSize,
  playerCount,
  chatEnabled,
  chatFilter,
})

// Get game state from localStorage
export const getGameState = (roomCode: string): GameState => {
  try {
    const savedState = localStorage.getItem(`game-${roomCode}`)
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (error) {
    console.error("Error getting game state:", error)
  }

  // If no saved state or error, return empty state
  return createEmptyGameState()
}

// Save game state to localStorage and dispatch event for other tabs
export const saveGameState = (roomCode: string, state: GameState) => {
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

// Reset game state
export const resetGameState = (
  roomCode: string,
  boardSize?: string,
  playerCount?: string,
  chatEnabled?: boolean,
  chatFilter?: boolean,
) => {
  const currentState = getGameState(roomCode)
  const newState = {
    ...createEmptyGameState(
      boardSize || currentState.boardSize,
      playerCount || currentState.playerCount,
      chatEnabled !== undefined ? chatEnabled : currentState.chatEnabled,
      chatFilter !== undefined ? chatFilter : currentState.chatFilter,
    ),
    players: currentState.players, // Keep the players
  }
  saveGameState(roomCode, newState)
  return newState
}

// Add a player to the game
export const addPlayer = (roomCode: string, player: Player): GameState => {
  const state = getGameState(roomCode)

  // Check if player already exists
  if (!state.players.some((p) => p.id === player.id)) {
    // Assign appropriate symbol based on player count and position
    if (state.playerCount === "3" && state.players.length === 2) {
      player.symbol = "Δ" // Triangle for third player
    }

    state.players.push(player)
    saveGameState(roomCode, state)
  }

  return state
}

// Make a move in the game
export const makeMove = (roomCode: string, playerId: string, row: number, col: number): GameState => {
  const state = getGameState(roomCode)

  // Validate move
  if (state.board[row][col] !== "" || state.winner || state.isDraw) {
    return state
  }

  // Find the current player
  const currentPlayer = state.players.find((p) => p.id === playerId)
  if (!currentPlayer || currentPlayer.symbol !== state.currentTurn) {
    return state
  }

  // Update the board
  const newBoard = state.board.map((r, i) => r.map((c, j) => (i === row && j === col ? state.currentTurn : c)))

  // Check for win
  const winResult = checkWin(newBoard, state.currentTurn, Number.parseInt(state.boardSize))
  const isDraw = !winResult && newBoard.every((row) => row.every((cell) => cell !== ""))

  // Update state
  state.board = newBoard

  // Determine next turn based on player count
  if (state.playerCount === "2") {
    state.currentTurn = state.currentTurn === "X" ? "O" : "X"
  } else if (state.playerCount === "3") {
    // For 3 players, cycle through X, O, and Δ
    if (state.currentTurn === "X") state.currentTurn = "O"
    else if (state.currentTurn === "O") state.currentTurn = "Δ"
    else state.currentTurn = "X"
  }

  if (winResult) {
    state.winner = {
      symbol: currentPlayer.symbol,
      line: winResult,
    }
  }

  state.isDraw = isDraw

  // Save and return updated state
  saveGameState(roomCode, state)
  return state
}

// Check for win
const checkWin = (board: string[][], symbol: string, boardSize: number): number[][] | null => {
  // Check rows
  for (let i = 0; i < boardSize; i++) {
    if (board[i].every((cell) => cell === symbol)) {
      return Array(boardSize)
        .fill(0)
        .map((_, j) => [i, j])
    }
  }

  // Check columns
  for (let i = 0; i < boardSize; i++) {
    if (
      Array(boardSize)
        .fill(0)
        .every((_, j) => board[j][i] === symbol)
    ) {
      return Array(boardSize)
        .fill(0)
        .map((_, j) => [j, i])
    }
  }

  // Check main diagonal
  if (
    Array(boardSize)
      .fill(0)
      .every((_, i) => board[i][i] === symbol)
  ) {
    return Array(boardSize)
      .fill(0)
      .map((_, i) => [i, i])
  }

  // Check other diagonal
  if (
    Array(boardSize)
      .fill(0)
      .every((_, i) => board[i][boardSize - 1 - i] === symbol)
  ) {
    return Array(boardSize)
      .fill(0)
      .map((_, i) => [i, boardSize - 1 - i])
  }

  return null
}

// Get chat messages
export const getChatMessages = (roomCode: string): ChatMessage[] => {
  try {
    const savedMessages = localStorage.getItem(`chat-${roomCode}`)
    if (savedMessages) {
      return JSON.parse(savedMessages)
    }
  } catch (error) {
    console.error("Error getting chat messages:", error)
  }

  return []
}

// Comprehensive list of words to filter
const INAPPROPRIATE_WORDS = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "dick",
  "pussy",
  "cock",
  "cunt",
  "whore",
  "slut",
  "bastard",
  "damn",
  "hell",
  "piss",
  "crap",
  "asshole",
  "motherfucker",
  "bullshit",
  "wanker",
  "twat",
  "prick",
  "tits",
  "boobs",
  "penis",
  "vagina",
  "anal",
  "sex",
  "porn",
  "nsfw",
  "xxx",
  "horny",
  "jerk",
  "jackass",
  "dumbass",
  "retard",
  "idiot",
  "stupid",
  "dumb",
  "moron",
  "nigger",
  "nigga",
  "fag",
  "faggot",
  "homo",
  "queer",
  "gay",
  "lesbian",
  "tranny",
  "dyke",
  "kill",
  "murder",
  "suicide",
  "die",
  "death",
  "nazi",
  "hitler",
  "terrorist",
  "bomb",
  "rape",
  "molest",
  "pedo",
  "pedophile",
]

// Filter inappropriate words
const filterText = (text: string): { text: string; filtered: boolean } => {
  let filtered = false
  let filteredText = text

  // Check for exact matches and word boundaries
  INAPPROPRIATE_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    if (regex.test(filteredText)) {
      filtered = true
      filteredText = filteredText.replace(regex, "****")
    }
  })

  return { text: filteredText, filtered }
}

// Add a chat message
export const addChatMessage = (roomCode: string, sender: string, text: string): ChatMessage[] => {
  try {
    const messages = getChatMessages(roomCode)
    const gameState = getGameState(roomCode)

    // Apply filter if enabled
    const { text: filteredText, filtered } = gameState.chatFilter ? filterText(text) : { text, filtered: false }

    const newMessage: ChatMessage = {
      sender,
      text: filteredText,
      timestamp: Date.now(),
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      filtered,
    }

    messages.push(newMessage)

    // Keep only the last 50 messages
    const trimmedMessages = messages.slice(-50)

    // Save to localStorage
    localStorage.setItem(`chat-${roomCode}`, JSON.stringify(trimmedMessages))

    // Dispatch event for other tabs/windows
    window.dispatchEvent(
      new CustomEvent("chat-message", {
        detail: { roomCode, message: newMessage, messages: trimmedMessages },
      }),
    )

    return trimmedMessages
  } catch (error) {
    console.error("Error adding chat message:", error)
    return getChatMessages(roomCode)
  }
}
