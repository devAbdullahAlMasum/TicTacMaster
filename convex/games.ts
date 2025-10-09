import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new game
export const createGame = mutation({
  args: {
    roomCode: v.optional(v.string()),
    boardSize: v.optional(v.number()),
    maxPlayers: v.optional(v.number()),
    isPrivate: v.optional(v.boolean()),
    gameMode: v.optional(v.string()),
    chatEnabled: v.optional(v.boolean()),
    chatFilter: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const boardSize = args.boardSize || 3;
    const maxPlayers = args.maxPlayers || 2;
    const boardLength = boardSize * boardSize;

    const gameId = await ctx.db.insert("games", {
      players: [
        {
          userId: identity.subject,
          name: user?.username || user?.name || identity.name || "Player 1",
          avatarId: user?.avatarId || 1,
          symbol: "X",
          isHost: true,
        },
      ],
      board: Array(boardLength).fill(null),
      boardSize,
      currentPlayer: identity.subject,
      status: maxPlayers === 1 ? "active" : "waiting",
      roomCode: args.roomCode,
      maxPlayers,
      isPrivate: args.isPrivate || false,
      gameMode: (args.gameMode as any) || "classic",
      settings: {
        chatEnabled: args.chatEnabled !== false,
        chatFilter: args.chatFilter !== false,
        winCondition: boardSize,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return gameId;
  },
});

// Join a game by room code
export const joinGame = mutation({
  args: {
    roomCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // First check if any game with this room code exists
    const anyGame = await ctx.db
      .query("games")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.roomCode))
      .first();

    if (!anyGame) {
      throw new Error(`No game found with room code: ${args.roomCode}`);
    }

    // Check if game is available to join
    if (anyGame.status === "completed") {
      throw new Error("This game has already finished");
    }

    if (anyGame.status === "cancelled") {
      throw new Error("This game has been cancelled");
    }

    const game = anyGame;

    // Check if user is already in the game
    const existingPlayer = game.players.find(
      (p) => p.userId === identity.subject,
    );
    if (existingPlayer) {
      return game._id; // Already joined
    }

    if (game.players.length >= game.maxPlayers) {
      throw new Error("Game is full");
    }

    const symbols = ["X", "O", "A", "B"];
    const newSymbol = symbols[game.players.length];

    const updatedPlayers = [
      ...game.players,
      {
        userId: identity.subject,
        name:
          user?.username ||
          user?.name ||
          identity.name ||
          `Player ${game.players.length + 1}`,
        avatarId: user?.avatarId || game.players.length + 1,
        symbol: newSymbol,
        isHost: false,
      },
    ];

    await ctx.db.patch(game._id, {
      players: updatedPlayers,
      status: updatedPlayers.length === game.maxPlayers ? "active" : "waiting",
      updatedAt: Date.now(),
      startedAt:
        updatedPlayers.length === game.maxPlayers ? Date.now() : undefined,
    });

    return game._id;
  },
});

// Make a move
export const makeMove = mutation({
  args: {
    gameId: v.id("games"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    console.log("makeMove - Game state:", {
      status: game.status,
      currentPlayer: game.currentPlayer,
      requestingPlayer: identity.subject,
      position: args.position,
      boardCell: game.board[args.position],
    });

    if (game.status !== "active") {
      throw new Error("Game is not active");
    }

    const player = game.players.find((p) => p.userId === identity.subject);
    if (!player) {
      throw new Error("You are not a player in this game");
    }

    console.log("makeMove - Player check:", {
      playerFound: !!player,
      playerSymbol: player?.symbol,
      isCurrentPlayer: game.currentPlayer === identity.subject,
    });

    if (game.currentPlayer !== identity.subject) {
      throw new Error("Not your turn");
    }

    if (args.position < 0 || args.position >= game.board.length) {
      throw new Error("Invalid position");
    }

    if (game.board[args.position] !== null) {
      throw new Error("Position already taken");
    }

    // Make the move
    const newBoard = [...game.board];
    newBoard[args.position] = player.symbol;

    // Record the move
    const moveCount = await ctx.db
      .query("gameMoves")
      .withIndex("by_game_id", (q) => q.eq("gameId", args.gameId))
      .collect();

    await ctx.db.insert("gameMoves", {
      gameId: args.gameId,
      userId: identity.subject,
      position: args.position,
      symbol: player.symbol,
      moveNumber: moveCount.length + 1,
      timestamp: Date.now(),
    });

    // Check for winner
    const winner = checkWinner(
      newBoard,
      game.boardSize,
      game.settings.winCondition || game.boardSize,
    );
    const isDraw = !winner && newBoard.every((cell) => cell !== null);

    // Get next player
    const currentPlayerIndex = game.players.findIndex(
      (p) => p.userId === identity.subject,
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    const nextPlayer = game.players[nextPlayerIndex];

    const updates: any = {
      board: newBoard,
      currentPlayer: nextPlayer.userId,
      updatedAt: Date.now(),
    };

    if (winner || isDraw) {
      updates.status = "completed";
      updates.winner = winner || "draw";
      updates.completedAt = Date.now();

      // Update leaderboard
      await updateLeaderboard(ctx, game.players, winner || undefined);
    }

    await ctx.db.patch(args.gameId, updates);

    return {
      board: newBoard,
      winner: winner || (isDraw ? "draw" : null),
      gameOver: !!(winner || isDraw),
    };
  },
});

// Get game by ID with real-time updates
export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    return game;
  },
});

// Get game by room code with real-time updates
export const getGameByRoomCode = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const game = await ctx.db
      .query("games")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.roomCode))
      .order("desc")
      .first();

    return game;
  },
});

// Get user's active games
export const getUserActiveGames = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const games = await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return games.filter((game) =>
      game.players.some((p) => p.userId === identity.subject),
    );
  },
});

// Get user's waiting games
export const getUserWaitingGames = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const games = await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    return games.filter((game) =>
      game.players.some((p) => p.userId === identity.subject),
    );
  },
});

// Get user's game history
export const getUserGameHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const games = await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .order("desc")
      .take(args.limit || 20);

    return games.filter((game) =>
      game.players.some((p) => p.userId === identity.subject),
    );
  },
});

// Get public waiting games
export const getPublicWaitingGames = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .order("desc")
      .take(20);

    return games.filter((game) => !game.isPrivate);
  },
});

// Cancel/leave game
export const leaveGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const playerIndex = game.players.findIndex(
      (p) => p.userId === identity.subject,
    );
    if (playerIndex === -1) {
      throw new Error("You are not in this game");
    }

    // If game hasn't started or only has one player, cancel it
    if (game.status === "waiting" || game.players.length === 1) {
      await ctx.db.patch(args.gameId, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
      return { cancelled: true };
    }

    // If game is active, mark as completed with other player as winner
    if (game.status === "active") {
      const otherPlayers = game.players.filter(
        (p) => p.userId !== identity.subject,
      );
      const winner = otherPlayers[0]?.userId;

      await ctx.db.patch(args.gameId, {
        status: "completed",
        winner,
        updatedAt: Date.now(),
        completedAt: Date.now(),
      });

      // Update leaderboard
      await updateLeaderboard(ctx, game.players, winner);
      return { completed: true, winner };
    }

    return { cancelled: false };
  },
});

// Rematch
export const rematch = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const oldGame = await ctx.db.get(args.gameId);
    if (!oldGame) {
      throw new Error("Game not found");
    }

    const player = oldGame.players.find((p) => p.userId === identity.subject);
    if (!player) {
      throw new Error("You were not in this game");
    }

    const boardLength = oldGame.boardSize * oldGame.boardSize;

    const newGameId = await ctx.db.insert("games", {
      players: [
        {
          ...player,
          isHost: true,
        },
      ],
      board: Array(boardLength).fill(null),
      boardSize: oldGame.boardSize,
      currentPlayer: player.userId,
      status: "waiting",
      roomCode: oldGame.roomCode,
      maxPlayers: oldGame.maxPlayers,
      isPrivate: oldGame.isPrivate,
      gameMode: oldGame.gameMode,
      settings: oldGame.settings,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newGameId;
  },
});

// Helper function to check for winner
function checkWinner(
  board: (string | null)[],
  boardSize: number,
  winCondition: number,
): string | null {
  // Check rows
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - winCondition; col++) {
      const startIndex = row * boardSize + col;
      const symbols: (string | null)[] = [];
      for (let i = 0; i < winCondition; i++) {
        symbols.push(board[startIndex + i]);
      }
      if (symbols[0] && symbols.every((s) => s === symbols[0])) {
        return symbols[0];
      }
    }
  }

  // Check columns
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row <= boardSize - winCondition; row++) {
      const symbols: (string | null)[] = [];
      for (let i = 0; i < winCondition; i++) {
        symbols.push(board[(row + i) * boardSize + col]);
      }
      if (symbols[0] && symbols.every((s) => s === symbols[0])) {
        return symbols[0];
      }
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row <= boardSize - winCondition; row++) {
    for (let col = 0; col <= boardSize - winCondition; col++) {
      const symbols: (string | null)[] = [];
      for (let i = 0; i < winCondition; i++) {
        symbols.push(board[(row + i) * boardSize + (col + i)]);
      }
      if (symbols[0] && symbols.every((s) => s === symbols[0])) {
        return symbols[0];
      }
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row <= boardSize - winCondition; row++) {
    for (let col = winCondition - 1; col < boardSize; col++) {
      const symbols: (string | null)[] = [];
      for (let i = 0; i < winCondition; i++) {
        symbols.push(board[(row + i) * boardSize + (col - i)]);
      }
      if (symbols[0] && symbols.every((s) => s === symbols[0])) {
        return symbols[0];
      }
    }
  }

  return null;
}

// Helper function to update leaderboard
async function updateLeaderboard(
  ctx: any,
  players: Array<{ userId: string; symbol: string }>,
  winner: string | "draw" | undefined,
) {
  for (const player of players) {
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .withIndex("by_user_id", (q: any) => q.eq("userId", player.userId))
      .unique();

    if (!leaderboardEntry) continue;

    let wins = leaderboardEntry.wins;
    let losses = leaderboardEntry.losses;
    let draws = leaderboardEntry.draws;
    let currentStreak = leaderboardEntry.currentStreak;

    if (winner === "draw") {
      draws += 1;
      currentStreak = 0;
    } else if (winner === player.userId) {
      wins += 1;
      currentStreak += 1;
    } else {
      losses += 1;
      currentStreak = 0;
    }

    const totalGames = wins + losses + draws;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const highestStreak = Math.max(
      leaderboardEntry.highestStreak,
      currentStreak,
    );

    await ctx.db.patch(leaderboardEntry._id, {
      wins,
      losses,
      draws,
      totalGames,
      winRate,
      currentStreak,
      highestStreak,
      updatedAt: Date.now(),
    });
  }
}
