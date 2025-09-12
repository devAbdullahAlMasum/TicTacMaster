// Centralized game-state utilities backed by localStorage and browser events

// Exported types for external consumers
export type Player = {
  id: string
  name: string
  avatarId: number
  symbol: string
  team?: number // For team games (4 players)
  score?: number // For tracking wins in events
  isReady: boolean
}

export type GameState = {
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

export type StoredSettings = {
  theme: "light" | "dark" | "system"
  gameNotifications: boolean
  chatNotifications: boolean
  soundEffects: boolean
  defaultBoardSize: string
  defaultPlayerName: string
  defaultAvatarId: string
}

// Internal helpers

const createEmptyGameState = (
  boardSize: string = "3",
  playerCount: string = "2",
  chatEnabled: boolean = true,
  chatFilter: boolean = true,
  isEvent: boolean = false,
  totalRounds: number = 1,
): GameState => {
  const size = Number.parseInt(boardSize)
  const winningLength = 3 // 3 in a row for all sizes

  return {
    board: Array.from({ length: size }, () => Array.from({ length: size }, () => "")),
    currentTurn: "X",
    players: [],
    winner: null,
    isDraw: false,
    lastUpdated: Date.now(),
    boardSize,
    playerCount,
    chatEnabled,
    chatFilter,
    isEvent,
    currentRound: isEvent ? 1 : undefined,
    totalRounds: isEvent ? totalRounds : undefined,
    roundHistory: isEvent ? [] : undefined,
    scores: isEvent ? {} : undefined,
    winningLength,
  }
}

const validateGameState = (state: unknown): state is GameState => {
  if (!state || typeof state !== "object") return false
  const s = state as Partial<GameState>
  if (!Array.isArray(s.board)) return false
  if (typeof s.currentTurn !== "string") return false
  if (!Array.isArray(s.players)) return false
  return true
}

// Persistence API

export const getGameState = (roomCode: string): GameState => {
  try {
    const savedState = localStorage.getItem(`game-${roomCode}`)
    if (savedState) {
      const parsedState = JSON.parse(savedState) as unknown
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

  return createEmptyGameState()
}

export const saveGameState = (roomCode: string, state: GameState): void => {
  try {
    if (!validateGameState(state)) {
      console.error("Attempted to save invalid game state")
      return
    }

    const updated: GameState = { ...state, lastUpdated: Date.now() }
    localStorage.setItem(`game-${roomCode}`, JSON.stringify(updated))

    window.dispatchEvent(
      new CustomEvent("game-state-update", {
        detail: { roomCode, state: updated },
      }),
    )
  } catch (error) {
    console.error("Error saving game state:", error)
  }
}

// Game actions

export const resetGameState = (
  roomCode: string,
  boardSize?: string,
  playerCount?: string,
  chatEnabled?: boolean,
  chatFilter?: boolean,
  isEvent?: boolean,
  totalRounds?: number,
  advanceRound: boolean = false,
): GameState => {
  try {
    const currentState = getGameState(roomCode)

    // For events, track previous round result
    if (currentState.isEvent && currentState.winner) {
      currentState.roundHistory ||= []
      currentState.roundHistory.push({
        winner: currentState.winner.symbol,
        isDraw: false,
        timestamp: Date.now(),
      })

      currentState.scores ||= {}
      const winnerSymbol = currentState.winner.symbol
      currentState.scores[winnerSymbol] = (currentState.scores[winnerSymbol] || 0) + 1
    } else if (currentState.isEvent && currentState.isDraw) {
      currentState.roundHistory ||= []
      currentState.roundHistory.push({ winner: null, isDraw: true, timestamp: Date.now() })
    }

    const newState: GameState = {
      ...createEmptyGameState(
        boardSize || currentState.boardSize,
        playerCount || currentState.playerCount,
        chatEnabled !== undefined ? chatEnabled : currentState.chatEnabled,
        chatFilter !== undefined ? chatFilter : currentState.chatFilter,
        isEvent !== undefined ? isEvent : Boolean(currentState.isEvent),
        totalRounds || currentState.totalRounds || 1,
      ),
      players: currentState.players,
      roundHistory: currentState.roundHistory,
      scores: currentState.scores,
    }

    if (newState.isEvent && advanceRound && currentState.currentRound) {
      newState.currentRound = currentState.currentRound + 1
    } else if (newState.isEvent) {
      newState.currentRound = currentState.currentRound || 1
    }

    saveGameState(roomCode, newState)
    return newState
  } catch (error) {
    console.error("Error resetting game state:", error)
    return getGameState(roomCode)
  }
}

export const addPlayer = (roomCode: string, player: Player): GameState => {
  try {
    const state = getGameState(roomCode)

    // No duplicate players
    if (state.players.some((p) => p.id === player.id)) return state

    const playerPosition = state.players.length
    const maxPlayers = Number.parseInt(state.playerCount)

    if (playerPosition === 0) player.symbol = "X"
    else if (playerPosition === 1) player.symbol = "O"
    else if (playerPosition === 2 && maxPlayers >= 3) player.symbol = "Δ"
    else if (playerPosition === 3 && maxPlayers >= 4) player.symbol = "□"

    if (maxPlayers === 4) {
      player.team = playerPosition === 0 || playerPosition === 2 ? 1 : 2
    }

    if (state.isEvent) {
      player.score = 0
      state.scores ||= {}
      state.scores[player.symbol] = 0
    }

    state.players.push(player)
    saveGameState(roomCode, state)
    return state
  } catch (error) {
    console.error("Error adding player:", error)
    return getGameState(roomCode)
  }
}

export const makeMove = (roomCode: string, playerId: string, row: number, col: number): GameState => {
  try {
    const state = getGameState(roomCode)

    if (state.board[row][col] !== "" || state.winner || state.isDraw) return state

    const currentPlayer = state.players.find((p) => p.id === playerId)
    if (!currentPlayer || currentPlayer.symbol !== state.currentTurn) return state

    const newBoard = state.board.map((r, i) => r.map((c, j) => (i === row && j === col ? state.currentTurn : c)))

    const boardSize = Number.parseInt(state.boardSize)
    const winningLength = state.winningLength || 3
    const winResult = checkWin(newBoard, state.currentTurn, boardSize, winningLength)
    const isDraw = !winResult && newBoard.every((r) => r.every((c) => c !== ""))

    state.board = newBoard

    const playerCount = Number.parseInt(state.playerCount)
    const availableSymbols = state.players.map((p) => p.symbol).sort()

    if (playerCount === 2) {
      state.currentTurn = state.currentTurn === "X" ? "O" : "X"
    } else if (playerCount === 3) {
      const currentIndex = availableSymbols.indexOf(state.currentTurn)
      state.currentTurn = availableSymbols[(currentIndex + 1) % availableSymbols.length]
    } else if (playerCount === 4) {
      if (state.currentTurn === "X") state.currentTurn = "O"
      else if (state.currentTurn === "O") state.currentTurn = "Δ"
      else if (state.currentTurn === "Δ") state.currentTurn = "□"
      else state.currentTurn = "X"
    }

    if (winResult) {
      state.winner = { symbol: currentPlayer.symbol, line: winResult }
      if (state.isEvent && state.scores) {
        state.scores[currentPlayer.symbol] = (state.scores[currentPlayer.symbol] || 0) + 1
      }
    }

    state.isDraw = isDraw

    saveGameState(roomCode, state)
    return state
  } catch (error) {
    console.error("Error making move:", error)
    return getGameState(roomCode)
  }
}

const checkWin = (
  board: string[][],
  symbol: string,
  boardSize: number,
  winningLength: number,
): number[][] | null => {
  // Rows
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j <= boardSize - winningLength; j++) {
      let win = true
      for (let k = 0; k < winningLength; k++) {
        if (board[i][j + k] !== symbol) {
          win = false
          break
        }
      }
      if (win) return Array.from({ length: winningLength }, (_, k) => [i, j + k])
    }
  }

  // Columns
  for (let i = 0; i <= boardSize - winningLength; i++) {
    for (let j = 0; j < boardSize; j++) {
      let win = true
      for (let k = 0; k < winningLength; k++) {
        if (board[i + k][j] !== symbol) {
          win = false
          break
        }
      }
      if (win) return Array.from({ length: winningLength }, (_, k) => [i + k, j])
    }
  }

  // Diagonals TL-BR
  for (let i = 0; i <= boardSize - winningLength; i++) {
    for (let j = 0; j <= boardSize - winningLength; j++) {
      let win = true
      for (let k = 0; k < winningLength; k++) {
        if (board[i + k][j + k] !== symbol) {
          win = false
          break
        }
      }
      if (win) return Array.from({ length: winningLength }, (_, k) => [i + k, j + k])
    }
  }

  // Diagonals TR-BL
  for (let i = 0; i <= boardSize - winningLength; i++) {
    for (let j = winningLength - 1; j < boardSize; j++) {
      let win = true
      for (let k = 0; k < winningLength; k++) {
        if (board[i + k][j - k] !== symbol) {
          win = false
          break
        }
      }
      if (win) return Array.from({ length: winningLength }, (_, k) => [i + k, j - k])
    }
  }

  return null
}

// Event helpers

export const advanceToNextRound = (roomCode: string): GameState => {
  try {
    const state = getGameState(roomCode)
    if (!state.isEvent) return state

    if (state.currentRound && state.totalRounds && state.currentRound >= state.totalRounds) {
      return state
    }

    return resetGameState(roomCode, undefined, undefined, undefined, undefined, true, undefined, true)
  } catch (error) {
    console.error("Error advancing to next round:", error)
    return getGameState(roomCode)
  }
}

export const checkEventWinner = (
  roomCode: string,
): { winner: string | null; winningScore: number; isDraw: boolean } => {
  try {
    const state = getGameState(roomCode)

    if (!state.isEvent || !state.scores) {
      return { winner: null, winningScore: 0, isDraw: false }
    }

    const scoreToWin = state.totalRounds ? Math.ceil(Number(state.totalRounds) / 2) : 1

    let highestScore = 0
    let winners: string[] = []

    for (const [symbol, score] of Object.entries(state.scores)) {
      if (score >= scoreToWin) {
        if (score > highestScore) {
          highestScore = score
          winners = [symbol]
        } else if (score === highestScore) {
          winners.push(symbol)
        }
      }
    }

    if (winners.length === 1) {
      return { winner: winners[0], winningScore: highestScore, isDraw: false }
    }

    if (winners.length > 1) {
      return { winner: null, winningScore: highestScore, isDraw: true }
    }

    if (state.currentRound && state.totalRounds && state.currentRound >= state.totalRounds) {
      highestScore = 0
      winners = []

      for (const [symbol, score] of Object.entries(state.scores)) {
        if (score > highestScore) {
          highestScore = score
          winners = [symbol]
        } else if (score === highestScore) {
          winners.push(symbol)
        }
      }

      if (winners.length === 1) {
        return { winner: winners[0], winningScore: highestScore, isDraw: false }
      }

      if (winners.length > 1) {
        return { winner: null, winningScore: highestScore, isDraw: true }
      }
    }

    return { winner: null, winningScore: 0, isDraw: false }
  } catch (error) {
    console.error("Error checking event winner:", error)
    return { winner: null, winningScore: 0, isDraw: false }
  }
}

// Chat

export const getChatMessages = (roomCode: string): ChatMessage[] => {
  try {
    const savedMessages = localStorage.getItem(`chat-${roomCode}`)
    if (savedMessages) return JSON.parse(savedMessages) as ChatMessage[]
  } catch (error) {
    console.error("Error getting chat messages:", error)
  }
  return []
}

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
] as const

type FilterResult = { text: string; filtered: boolean }

const filterText = (text: string): FilterResult => {
  let filtered = false
  let filteredText = text

  for (const word of INAPPROPRIATE_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    if (regex.test(filteredText)) {
      filtered = true
      filteredText = filteredText.replace(regex, "****")
    }
  }

  return { text: filteredText, filtered }
}

export const addChatMessage = (roomCode: string, sender: string, text: string): ChatMessage[] => {
  try {
    const messages = getChatMessages(roomCode)
    const gameState = getGameState(roomCode)

    const { text: filteredText, filtered } = gameState.chatFilter ? filterText(text) : { text, filtered: false }

    const newMessage: ChatMessage = {
      sender,
      text: filteredText,
      timestamp: Date.now(),
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      filtered,
    }

    messages.push(newMessage)

    const trimmedMessages = messages.slice(-50)
    localStorage.setItem(`chat-${roomCode}`, JSON.stringify(trimmedMessages))

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

// Settings persistence

export const saveSettings = (settings: StoredSettings): boolean => {
  try {
    localStorage.setItem("game-settings", JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Error saving settings:", error)
    return false
  }
}

export const getSettings = (): StoredSettings => {
  try {
    const settings = localStorage.getItem("game-settings")
    if (settings) return JSON.parse(settings) as StoredSettings
  } catch (error) {
    console.error("Error getting settings:", error)
  }

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
