"use client"

interface GameStatusProps {
  waitingForOpponent: boolean
  winner: { symbol: string; line: number[][] } | null
  isDraw: boolean
  isPlayerTurn: boolean
  playerName: string
  opponentName?: string
}

export function GameStatus({
  waitingForOpponent,
  winner,
  isDraw,
  isPlayerTurn,
  playerName,
  opponentName,
}: GameStatusProps) {
  let statusMessage = ""
  let statusClass = "text-foreground"

  if (waitingForOpponent) {
    statusMessage = "Waiting for an opponent to join..."
    statusClass = "text-muted-foreground"
  } else if (winner) {
    const isPlayerWinner = isPlayerTurn ? winner.symbol !== "X" : winner.symbol === "X"
    statusMessage = isPlayerWinner ? "You won the game! 🎉" : `${opponentName || "Opponent"} won the game!`
    statusClass = isPlayerWinner ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"
  } else if (isDraw) {
    statusMessage = "Game ended in a draw!"
    statusClass = "text-amber-600 dark:text-amber-400"
  } else {
    statusMessage = isPlayerTurn ? "Your turn" : `Waiting for ${opponentName || "opponent"} to make a move...`
  }

  return (
    <div className="text-center">
      <h2 className={`text-xl font-semibold ${statusClass}`}>{statusMessage}</h2>
    </div>
  )
}
