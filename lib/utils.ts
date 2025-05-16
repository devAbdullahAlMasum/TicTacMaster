import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomCode() {
  // Generate a random 6-character alphanumeric code
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function checkWinner(board: string[][]) {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
      return {
        winner: board[i][0],
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
    if (board[0][i] && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
      return {
        winner: board[0][i],
        line: [
          [0, i],
          [1, i],
          [2, i],
        ],
      }
    }
  }

  // Check diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
    return {
      winner: board[0][0],
      line: [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    }
  }

  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
    return {
      winner: board[0][2],
      line: [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    }
  }

  return null
}

export function checkDraw(board: string[][]) {
  return board.every((row) => row.every((cell) => cell !== ""))
}
