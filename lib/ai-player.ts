// AI Player logic for single player mode

export type Difficulty = "easy" | "medium" | "hard"

export interface AIMove {
  row: number
  col: number
  score?: number
}

export class AIPlayer {
  private difficulty: Difficulty
  private symbol: string
  private opponentSymbol: string
  private boardSize: number
  private winningLength: number

  constructor(difficulty: Difficulty, symbol: string, opponentSymbol: string, boardSize: number, winningLength = 3) {
    this.difficulty = difficulty
    this.symbol = symbol
    this.opponentSymbol = opponentSymbol
    this.boardSize = boardSize
    this.winningLength = winningLength
  }

  // Main method to get AI move
  public getMove(board: string[][]): AIMove {
    const availableMoves = this.getAvailableMoves(board)

    if (availableMoves.length === 0) {
      throw new Error("No available moves")
    }

    switch (this.difficulty) {
      case "easy":
        return this.getEasyMove(board, availableMoves)
      case "medium":
        return this.getMediumMove(board, availableMoves)
      case "hard":
        return this.getHardMove(board, availableMoves)
      default:
        return availableMoves[Math.floor(Math.random() * availableMoves.length)]
    }
  }

  // Easy AI: Random moves with occasional smart moves
  private getEasyMove(board: string[][], availableMoves: AIMove[]): AIMove {
    // 30% chance to make a smart move
    if (Math.random() < 0.3) {
      // Check for winning move
      const winningMove = this.findWinningMove(board, this.symbol)
      if (winningMove) return winningMove

      // Check for blocking move
      const blockingMove = this.findWinningMove(board, this.opponentSymbol)
      if (blockingMove) return blockingMove
    }

    // Otherwise, random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  // Medium AI: Strategic moves with some randomness
  private getMediumMove(board: string[][], availableMoves: AIMove[]): AIMove {
    // Always check for winning move
    const winningMove = this.findWinningMove(board, this.symbol)
    if (winningMove) return winningMove

    // Always block opponent's winning move
    const blockingMove = this.findWinningMove(board, this.opponentSymbol)
    if (blockingMove) return blockingMove

    // 70% chance to make a strategic move
    if (Math.random() < 0.7) {
      const strategicMove = this.getStrategicMove(board, availableMoves)
      if (strategicMove) return strategicMove
    }

    // Otherwise, random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  // Hard AI: Uses minimax algorithm for optimal play
  private getHardMove(board: string[][], availableMoves: AIMove[]): AIMove {
    // Always check for immediate win
    const winningMove = this.findWinningMove(board, this.symbol)
    if (winningMove) return winningMove

    // Always block opponent's winning move
    const blockingMove = this.findWinningMove(board, this.opponentSymbol)
    if (blockingMove) return blockingMove

    // Use minimax for optimal move
    let bestMove = availableMoves[0]
    let bestScore = Number.NEGATIVE_INFINITY

    for (const move of availableMoves) {
      const newBoard = this.makeMove(board, move.row, move.col, this.symbol)
      const score = this.minimax(newBoard, 0, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  // Minimax algorithm with alpha-beta pruning
  private minimax(board: string[][], depth: number, isMaximizing: boolean, alpha: number, beta: number): number {
    const winner = this.checkWinner(board)

    // Terminal states
    if (winner === this.symbol) return 10 - depth
    if (winner === this.opponentSymbol) return depth - 10
    if (this.isBoardFull(board)) return 0

    // Limit depth for performance on larger boards
    const maxDepth = this.boardSize === 3 ? 9 : this.boardSize === 4 ? 6 : 4
    if (depth >= maxDepth) return 0

    const availableMoves = this.getAvailableMoves(board)

    if (isMaximizing) {
      let maxScore = Number.NEGATIVE_INFINITY
      for (const move of availableMoves) {
        const newBoard = this.makeMove(board, move.row, move.col, this.symbol)
        const score = this.minimax(newBoard, depth + 1, false, alpha, beta)
        maxScore = Math.max(score, maxScore)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return maxScore
    } else {
      let minScore = Number.POSITIVE_INFINITY
      for (const move of availableMoves) {
        const newBoard = this.makeMove(board, move.row, move.col, this.opponentSymbol)
        const score = this.minimax(newBoard, depth + 1, true, alpha, beta)
        minScore = Math.min(score, minScore)
        beta = Math.min(beta, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return minScore
    }
  }

  // Find a winning move for the given symbol
  private findWinningMove(board: string[][], symbol: string): AIMove | null {
    const availableMoves = this.getAvailableMoves(board)

    for (const move of availableMoves) {
      const newBoard = this.makeMove(board, move.row, move.col, symbol)
      if (this.checkWinner(newBoard) === symbol) {
        return move
      }
    }

    return null
  }

  // Get strategic move (center, corners, edges priority)
  private getStrategicMove(board: string[][], availableMoves: AIMove[]): AIMove | null {
    const center = Math.floor(this.boardSize / 2)

    // Prefer center
    if (board[center][center] === "") {
      return { row: center, col: center }
    }

    // Prefer corners
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: this.boardSize - 1 },
      { row: this.boardSize - 1, col: 0 },
      { row: this.boardSize - 1, col: this.boardSize - 1 },
    ]

    for (const corner of corners) {
      if (board[corner.row][corner.col] === "") {
        return corner
      }
    }

    // Look for moves that create multiple threats
    for (const move of availableMoves) {
      const newBoard = this.makeMove(board, move.row, move.col, this.symbol)
      const threats = this.countThreats(newBoard, this.symbol)
      if (threats >= 2) {
        return move
      }
    }

    return null
  }

  // Count potential winning threats for a symbol
  private countThreats(board: string[][], symbol: string): number {
    let threats = 0

    // Check all possible winning lines
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        // Check horizontal, vertical, and diagonal lines starting from this position
        const directions = [
          [0, 1], // horizontal
          [1, 0], // vertical
          [1, 1], // diagonal
          [1, -1], // anti-diagonal
        ]

        for (const [dx, dy] of directions) {
          if (this.isValidLine(i, j, dx, dy) && this.isWinningThreat(board, i, j, dx, dy, symbol)) {
            threats++
          }
        }
      }
    }

    return threats
  }

  // Check if a line is a winning threat (has potential to win)
  private isWinningThreat(
    board: string[][],
    startRow: number,
    startCol: number,
    dx: number,
    dy: number,
    symbol: string,
  ): boolean {
    let symbolCount = 0
    let emptyCount = 0

    for (let k = 0; k < this.winningLength; k++) {
      const row = startRow + k * dx
      const col = startCol + k * dy

      if (board[row][col] === symbol) {
        symbolCount++
      } else if (board[row][col] === "") {
        emptyCount++
      } else {
        return false // Blocked by opponent
      }
    }

    return symbolCount >= this.winningLength - 1 && emptyCount >= 1
  }

  // Check if a line position is valid for the winning length
  private isValidLine(row: number, col: number, dx: number, dy: number): boolean {
    const endRow = row + (this.winningLength - 1) * dx
    const endCol = col + (this.winningLength - 1) * dy

    return endRow >= 0 && endRow < this.boardSize && endCol >= 0 && endCol < this.boardSize
  }

  // Get all available moves
  private getAvailableMoves(board: string[][]): AIMove[] {
    const moves: AIMove[] = []

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (board[i][j] === "") {
          moves.push({ row: i, col: j })
        }
      }
    }

    return moves
  }

  // Make a move on the board (returns new board)
  private makeMove(board: string[][], row: number, col: number, symbol: string): string[][] {
    return board.map((r, i) => r.map((c, j) => (i === row && j === col ? symbol : c)))
  }

  // Check for winner
  private checkWinner(board: string[][]): string | null {
    // Check rows
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j <= this.boardSize - this.winningLength; j++) {
        const symbol = board[i][j]
        if (symbol && this.checkLine(board, i, j, 0, 1, symbol)) {
          return symbol
        }
      }
    }

    // Check columns
    for (let i = 0; i <= this.boardSize - this.winningLength; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const symbol = board[i][j]
        if (symbol && this.checkLine(board, i, j, 1, 0, symbol)) {
          return symbol
        }
      }
    }

    // Check diagonals
    for (let i = 0; i <= this.boardSize - this.winningLength; i++) {
      for (let j = 0; j <= this.boardSize - this.winningLength; j++) {
        const symbol = board[i][j]
        if (symbol && this.checkLine(board, i, j, 1, 1, symbol)) {
          return symbol
        }
      }
    }

    // Check anti-diagonals
    for (let i = 0; i <= this.boardSize - this.winningLength; i++) {
      for (let j = this.winningLength - 1; j < this.boardSize; j++) {
        const symbol = board[i][j]
        if (symbol && this.checkLine(board, i, j, 1, -1, symbol)) {
          return symbol
        }
      }
    }

    return null
  }

  // Check if a line has winning length of the same symbol
  private checkLine(
    board: string[][],
    startRow: number,
    startCol: number,
    dx: number,
    dy: number,
    symbol: string,
  ): boolean {
    for (let k = 0; k < this.winningLength; k++) {
      const row = startRow + k * dx
      const col = startCol + k * dy
      if (board[row][col] !== symbol) {
        return false
      }
    }
    return true
  }

  // Check if board is full
  private isBoardFull(board: string[][]): boolean {
    return board.every((row) => row.every((cell) => cell !== ""))
  }
}

// Helper function to make an AI move (for compatibility with the previous implementation)
export function makeAIMove(
  board: string[][],
  aiSymbol: string,
  playerSymbol: string,
  difficulty = "medium",
): AIMove | null {
  try {
    const boardSize = board.length
    const ai = new AIPlayer(difficulty as Difficulty, aiSymbol, playerSymbol, boardSize)
    return ai.getMove(board)
  } catch (error) {
    console.error("Error making AI move:", error)
    return null
  }
}
