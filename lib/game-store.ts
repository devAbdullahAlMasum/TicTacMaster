// This file creates a centralized store for game state using localStorage
// to simulate a server and enable communication between browser tabs/windows

type Player = {
  id: string
  name: string
  avatarId: number
  symbol: string
  team?: number // For team games (4 players)
  score?: number // For tracking wins in events
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
  // Event-specific fields
  isEvent?: boolean
  currentRound?: number
  totalRounds?: number
  roundHistory?: Array<{
    winner: string | null
    isDraw: boolean
    timestamp: number
  }>
  scores?: Record<string, number> // Symbol -> score
  winningLength?: number // Number of symbols in a row needed to win
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
  isEvent = false,
  totalRounds = 1,
): GameState => {
  // Convert boardSize to number to create proper grid
  const size = Number.parseInt(boardSize)

  // Determine winning length based on board size
  // For 3x3, need 3 in a row; for 4x4 and 5x5, still need 3 in a row
  const winningLength = 3

  return {
    board: Array(size)
      .fill("")
      .map(() => Array(size).fill("")),
    currentTurn: "X",
    players: [],
    winner: null,
    isDraw: false,
    lastUpdated: Date.now(),
    boardSize,
    playerCount,
    chatEnabled,
    chatFilter,
    isEvent: isEvent,
    currentRound: isEvent ? 1 : undefined,
    totalRounds: isEvent ? totalRounds : undefined,
    roundHistory: isEvent ? [] : undefined,
    scores: isEvent ? {} : undefined,
    winningLength: winningLength,
  }
}

// Validate game state
const validateGameState = (state: GameState): boolean => {
  if (!state) return false
  if (!Array.isArray(state.board)) return false
  if (typeof state.currentTurn !== "string") return false
  if (!Array.isArray(state.players)) return false
  return true // Add more checks as needed
}

// Get game state from localStorage
export const getGameState = (roomCode: string): GameState => {
  try {
    const savedState = localStorage.getItem(`game-${roomCode}`)
    if (savedState) {
      const parsedState = JSON.parse(savedState)
      if (validateGameState(parsedState)) {
        return parsedState
      } else {
        console.error("Invalid game state in localStorage")
        return createEmptyGameState()
      }
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
    if (!validateGameState(state)) {
      console.error("Attempted to save invalid game state")
      return
    }

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

// Reset game state for a new round
export const resetGameState = (
  roomCode: string,
  boardSize?: string,
  playerCount?: string,
  chatEnabled?: boolean,
  chatFilter?: boolean,
  isEvent?: boolean,
  totalRounds?: number,
  advanceRound = false,
) => {
  try {
    const currentState = getGameState(roomCode)

    // For events, track round history
    if (currentState.isEvent && currentState.winner) {
      if (!currentState.roundHistory) {
        currentState.roundHistory = []
      }

      // Record the round result
      currentState.roundHistory.push({
        winner: currentState.winner.symbol,
        isDraw: false,
        timestamp: Date.now(),
      })

      // Update scores
      if (!currentState.scores) {
        currentState.scores = {}
      }

      const winnerSymbol = currentState.winner.symbol
      currentState.scores[winnerSymbol] = (currentState.scores[winnerSymbol] || 0) + 1
    } else if (currentState.isEvent && currentState.isDraw) {
      if (!currentState.roundHistory) {
        currentState.roundHistory = []
      }

      // Record draw
      currentState.roundHistory.push({
        winner: null,
        isDraw: true,
        timestamp: Date.now(),
      })
    }

    // Create new state
    const newState = {
      ...createEmptyGameState(
        boardSize || currentState.boardSize,
        playerCount || currentState.playerCount,
        chatEnabled !== undefined ? chatEnabled : currentState.chatEnabled,
        chatFilter !== undefined ? chatFilter : currentState.chatFilter,
        isEvent !== undefined ? isEvent : currentState.isEvent,
        totalRounds || currentState.totalRounds,
      ),
      players: currentState.players, // Keep the players
      roundHistory: currentState.roundHistory, // Keep round history
      scores: currentState.scores, // Keep scores
    }

    // For events, handle round advancement
    if (newState.isEvent && advanceRound && currentState.currentRound) {
      newState.currentRound = currentState.currentRound + 1
    } else if (newState.isEvent) {
      newState.currentRound = currentState.currentRound || 1
    }

    saveGameState(roomCode, newState)
    return newState
  } catch (error) {
    console.error("Error resetting game state:", error)
    return getGameState(roomCode) // Return current state in case of error
  }
}

// Fix the player symbol assignment and turn tracking
export const addPlayer = (roomCode: string, player: Player): GameState => {
  try {
    const state = getGameState(roomCode)

    // Check if player already exists
    const existingPlayer = state.players.find((p) => p.id === player.id)
    if (existingPlayer) {
      return state // Player already exists, no need to add again
    }

    // Assign appropriate symbol based on player count and position
    const playerPosition = state.players.length
    const maxPlayers = Number.parseInt(state.playerCount)

    if (playerPosition === 0) {
      player.symbol = "X"
    } else if (playerPosition === 1) {
      player.symbol = "O"
    } else if (playerPosition === 2 && maxPlayers >= 3) {
      player.symbol = "Δ" // Triangle for third player
    } else if (playerPosition === 3 && maxPlayers >= 4) {
      player.symbol = "□" // Square for fourth player
    }

    // For 4-player mode (teams)
    if (maxPlayers === 4) {
      if (playerPosition === 0 || playerPosition === 2) {
        player.team = 1 // Team 1: X and Δ
      } else {
        player.team = 2 // Team 2: O and □
      }
    }

    // Initialize player score for events
    if (state.isEvent) {
      player.score = 0
      if (!state.scores) {
        state.scores = {}
      }
      state.scores[player.symbol] = 0
    }

    // Add player to the game
    state.players.push(player)
    saveGameState(roomCode, state)
    return state
  } catch (error) {
    console.error("Error adding player:", error)
    return getGameState(roomCode) // Return current state in case of error
  }
}

// Fix the turn tracking logic
export const makeMove = (roomCode: string, playerId: string, row: number, col: number): GameState => {
  try {
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
    const boardSize = Number.parseInt(state.boardSize)
    const winningLength = state.winningLength || 3
    const winResult = checkWin(newBoard, state.currentTurn, boardSize, winningLength)
    const isDraw = !winResult && newBoard.every((row) => row.every((cell) => cell !== ""))

    // Update state
    state.board = newBoard

    // Determine next turn based on player count and available players
    const playerCount = Number.parseInt(state.playerCount)
    const availableSymbols = state.players.map((p) => p.symbol).sort()

    if (playerCount === 2) {
      // For 2 players, just toggle between X and O
      state.currentTurn = state.currentTurn === "X" ? "O" : "X"
    } else if (playerCount === 3) {
      // For 3 players, cycle through available symbols
      const currentIndex = availableSymbols.indexOf(state.currentTurn)
      const nextIndex = (currentIndex + 1) % availableSymbols.length
      state.currentTurn = availableSymbols[nextIndex]
    } else if (playerCount === 4) {
      // For 4 players (teams), alternate between teams
      // Team 1: X and Δ, Team 2: O and □
      if (state.currentTurn === "X") state.currentTurn = "O"
      else if (state.currentTurn === "O") state.currentTurn = "Δ"
      else if (state.currentTurn === "Δ") state.currentTurn = "□"
      else state.currentTurn = "X"
    }

    if (winResult) {
      state.winner = {
        symbol: currentPlayer.symbol,
        line: winResult,
      }

      // Update scores for events
      if (state.isEvent && state.scores) {
        state.scores[currentPlayer.symbol] = (state.scores[currentPlayer.symbol] || 0) + 1
      }
    }

    state.isDraw = isDraw

    // Save and return updated state
    saveGameState(roomCode, state)
    return state
  } catch (error) {
    console.error("Error making move:", error)
    return getGameState(roomCode) // Return current state in case of error
  }
}

// Check for win with variable winning length
const checkWin = (board: string[][], symbol: string, boardSize: number, winningLength: number): number[][] | null => {
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

// Advance to next round in an event
export const advanceToNextRound = (roomCode: string): GameState => {
  try {
    const state = getGameState(roomCode)

    if (!state.isEvent) {
      return state
    }

    // Check if we've reached the maximum number of rounds
    if (state.currentRound && state.totalRounds && state.currentRound >= state.totalRounds) {
      // Event is complete
      return state
    }

    // Reset the board but keep scores and advance round counter
    return resetGameState(roomCode, undefined, undefined, undefined, undefined, true, undefined, true)
  } catch (error) {
    console.error("Error advancing to next round:", error)
    return getGameState(roomCode) // Return current state in case of error
  }
}

// Check if a team/player has won the event
export const checkEventWinner = (
  roomCode: string,
): { winner: string | null; winningScore: number; isDraw: boolean } => {
  try {
    const state = getGameState(roomCode)

    if (!state.isEvent || !state.scores) {
      return { winner: null, winningScore: 0, isDraw: false }
    }

    // Calculate score needed to win
    const scoreToWin = state.totalRounds ? Math.ceil(Number(state.totalRounds) / 2) : 1

    // Check if any player has reached the winning score
    let highestScore = 0
    let winners: string[] = []

    Object.entries(state.scores).forEach(([symbol, score]) => {
      if (score >= scoreToWin) {
        if (score > highestScore) {
          highestScore = score
          winners = [symbol]
        } else if (score === highestScore) {
          winners.push(symbol)
        }
      }
    })

    // If we have a single winner
    if (winners.length === 1) {
      return { winner: winners[0], winningScore: highestScore, isDraw: false }
    }

    // If we have multiple winners (draw)
    if (winners.length > 1) {
      return { winner: null, winningScore: highestScore, isDraw: true }
    }

    // Check if all rounds have been played
    if (state.currentRound && state.totalRounds && state.currentRound >= state.totalRounds) {
      // Find the highest score
      let highestScore = 0
      let winners: string[] = []

      Object.entries(state.scores).forEach(([symbol, score]) => {
        if (score > highestScore) {
          highestScore = score
          winners = [symbol]
        } else if (score === highestScore) {
          winners.push(symbol)
        }
      })

      // If we have a single winner
      if (winners.length === 1) {
        return { winner: winners[0], winningScore: highestScore, isDraw: false }
      }

      // If we have multiple winners (draw)
      if (winners.length > 1) {
        return { winner: null, winningScore: highestScore, isDraw: true }
      }
    }

    return { winner: null, winningScore: 0, isDraw: false }
  } catch (error) {
    console.error("Error checking event winner:", error)
    return { winner: null, winningScore: 0, isDraw: false } // Return default in case of error
  }
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

// Save settings to localStorage
export const saveSettings = (settings: any) => {
  try {
    localStorage.setItem("game-settings", JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Error saving settings:", error)
    return false
  }
}

// Get settings from localStorage
export const getSettings = () => {
  try {
    const settings = localStorage.getItem("game-settings")
    if (settings) {
      return JSON.parse(settings)
    }
  } catch (error) {
    console.error("Error getting settings:", error)
  }

  // Default settings
  return {
    theme: "system",
    gameNotifications: true,
    chatNotifications: true,
    soundEffects: true,
    defaultBoardSize: "3x3",
    defaultPlayerName: "",
    defaultAvatarId: "1",
  }
}
