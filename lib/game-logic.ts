export interface GamePosition {
  row: number
  col: number
}

export interface WinResult {
  winner: string
  line: GamePosition[]
}

export interface GameState {
  board: string[][]
  winner: WinResult | null
  isDraw: boolean
  isEmpty: boolean
}

/**
 * Create an empty game board
 */
export function createEmptyBoard(size: number): string[][] {
  return Array(size).fill(null).map(() => Array(size).fill(''))
}

/**
 * Make a move on the board
 */
export function makeMove(board: string[][], row: number, col: number, symbol: string): string[][] {
  if (board[row][col] !== '') {
    throw new Error('Cell is already occupied')
  }
  
  return board.map((r, i) => 
    r.map((c, j) => (i === row && j === col ? symbol : c))
  )
}

/**
 * Check if a position is valid
 */
export function isValidPosition(board: string[][], row: number, col: number): boolean {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length
}

/**
 * Check if a cell is empty
 */
export function isCellEmpty(board: string[][], row: number, col: number): boolean {
  return isValidPosition(board, row, col) && board[row][col] === ''
}

/**
 * Get all empty positions on the board
 */
export function getEmptyPositions(board: string[][]): GamePosition[] {
  const positions: GamePosition[] = []
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === '') {
        positions.push({ row, col })
      }
    }
  }
  
  return positions
}

/**
 * Check if the board is full
 */
export function isBoardFull(board: string[][]): boolean {
  return board.every(row => row.every(cell => cell !== ''))
}

/**
 * Check for a win condition
 */
export function checkWin(board: string[][], winningLength: number = 3): WinResult | null {
  const boardSize = board.length
  
  // Check rows
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const symbol = board[row][col]
      if (symbol && checkLine(board, row, col, 0, 1, symbol, winningLength)) {
        return {
          winner: symbol,
          line: Array(winningLength).fill(0).map((_, i) => ({ row, col: col + i }))
        }
      }
    }
  }
  
  // Check columns
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = 0; col < boardSize; col++) {
      const symbol = board[row][col]
      if (symbol && checkLine(board, row, col, 1, 0, symbol, winningLength)) {
        return {
          winner: symbol,
          line: Array(winningLength).fill(0).map((_, i) => ({ row: row + i, col }))
        }
      }
    }
  }
  
  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = 0; col <= boardSize - winningLength; col++) {
      const symbol = board[row][col]
      if (symbol && checkLine(board, row, col, 1, 1, symbol, winningLength)) {
        return {
          winner: symbol,
          line: Array(winningLength).fill(0).map((_, i) => ({ row: row + i, col: col + i }))
        }
      }
    }
  }
  
  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row <= boardSize - winningLength; row++) {
    for (let col = winningLength - 1; col < boardSize; col++) {
      const symbol = board[row][col]
      if (symbol && checkLine(board, row, col, 1, -1, symbol, winningLength)) {
        return {
          winner: symbol,
          line: Array(winningLength).fill(0).map((_, i) => ({ row: row + i, col: col - i }))
        }
      }
    }
  }
  
  return null
}

/**
 * Check if a line has the required length of the same symbol
 */
function checkLine(
  board: string[][], 
  startRow: number, 
  startCol: number, 
  deltaRow: number, 
  deltaCol: number, 
  symbol: string, 
  length: number
): boolean {
  for (let i = 0; i < length; i++) {
    const row = startRow + i * deltaRow
    const col = startCol + i * deltaCol
    
    if (!isValidPosition(board, row, col) || board[row][col] !== symbol) {
      return false
    }
  }
  
  return true
}

/**
 * Get the current game state
 */
export function getGameState(board: string[][], winningLength: number = 3): GameState {
  const winner = checkWin(board, winningLength)
  const isDraw = !winner && isBoardFull(board)
  const isEmpty = board.every(row => row.every(cell => cell === ''))
  
  return {
    board,
    winner,
    isDraw,
    isEmpty
  }
}

/**
 * Get the next player symbol
 */
export function getNextPlayer(currentPlayer: string, players: string[] = ['X', 'O']): string {
  const currentIndex = players.indexOf(currentPlayer)
  return players[(currentIndex + 1) % players.length]
}

/**
 * Count symbols on the board
 */
export function countSymbols(board: string[][], symbol: string): number {
  return board.flat().filter(cell => cell === symbol).length
}

/**
 * Get board statistics
 */
export function getBoardStats(board: string[][]): Record<string, number> {
  const stats: Record<string, number> = {}
  
  board.flat().forEach(cell => {
    if (cell !== '') {
      stats[cell] = (stats[cell] || 0) + 1
    }
  })
  
  return stats
}

/**
 * Check if a move would result in a win
 */
export function wouldWin(board: string[][], row: number, col: number, symbol: string, winningLength: number = 3): boolean {
  if (!isCellEmpty(board, row, col)) {
    return false
  }
  
  const newBoard = makeMove(board, row, col, symbol)
  const result = checkWin(newBoard, winningLength)
  
  return result !== null && result.winner === symbol
}

/**
 * Find all winning moves for a symbol
 */
export function findWinningMoves(board: string[][], symbol: string, winningLength: number = 3): GamePosition[] {
  const winningMoves: GamePosition[] = []
  const emptyPositions = getEmptyPositions(board)
  
  for (const position of emptyPositions) {
    if (wouldWin(board, position.row, position.col, symbol, winningLength)) {
      winningMoves.push(position)
    }
  }
  
  return winningMoves
}

/**
 * Clone a board
 */
export function cloneBoard(board: string[][]): string[][] {
  return board.map(row => [...row])
}

/**
 * Generate a board string representation (for debugging)
 */
export function boardToString(board: string[][]): string {
  return board.map(row => row.map(cell => cell || '·').join(' ')).join('\n')
}