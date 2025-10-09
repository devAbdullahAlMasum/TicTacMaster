import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    avatarId: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  games: defineTable({
    players: v.array(
      v.object({
        userId: v.string(), // Clerk user ID
        name: v.string(),
        avatarId: v.number(),
        symbol: v.string(), // "X", "O", "A", "B", etc.
        isHost: v.boolean(),
      }),
    ),
    board: v.array(v.union(v.string(), v.null())), // "X", "O", "A", "B", or null
    boardSize: v.number(), // 3, 4, or 5
    currentPlayer: v.string(), // userId of current player
    winner: v.optional(v.union(v.string(), v.literal("draw"))), // userId or "draw"
    status: v.union(
      v.literal("waiting"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    roomCode: v.optional(v.string()),
    maxPlayers: v.number(), // 2, 3, or 4
    isPrivate: v.boolean(),
    gameMode: v.union(
      v.literal("classic"),
      v.literal("timed"),
      v.literal("tournament"),
    ),
    settings: v.object({
      chatEnabled: v.boolean(),
      chatFilter: v.boolean(),
      timeLimit: v.optional(v.number()), // seconds per turn
      winCondition: v.optional(v.number()), // how many in a row to win
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_room_code", ["roomCode"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  matchmaking: defineTable({
    userId: v.string(),
    username: v.string(),
    avatarId: v.number(),
    preferences: v.object({
      boardSize: v.number(),
      maxPlayers: v.number(),
      gameMode: v.string(),
    }),
    status: v.union(
      v.literal("searching"),
      v.literal("matched"),
      v.literal("cancelled"),
    ),
    gameId: v.optional(v.id("games")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  chatMessages: defineTable({
    gameId: v.id("games"),
    userId: v.string(),
    username: v.string(),
    avatarId: v.number(),
    message: v.string(),
    isFiltered: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_game_id", ["gameId"])
    .index("by_game_and_created", ["gameId", "createdAt"]),

  tournaments: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    hostId: v.string(), // Clerk user ID
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    settings: v.object({
      boardSize: v.number(),
      maxPlayers: v.number(), // players per match
      totalParticipants: v.number(),
      roundCount: v.number(),
      winCondition: v.number(),
      chatEnabled: v.boolean(),
      isPublic: v.boolean(),
    }),
    participants: v.array(
      v.object({
        userId: v.string(),
        username: v.string(),
        avatarId: v.number(),
        wins: v.number(),
        losses: v.number(),
        score: v.number(),
      }),
    ),
    currentRound: v.number(),
    rounds: v.array(
      v.object({
        roundNumber: v.number(),
        matches: v.array(v.id("games")),
        isComplete: v.boolean(),
      }),
    ),
    winner: v.optional(
      v.object({
        userId: v.string(),
        username: v.string(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_host_id", ["hostId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  leaderboard: defineTable({
    userId: v.string(), // Clerk user ID
    username: v.string(),
    wins: v.number(),
    losses: v.number(),
    draws: v.number(),
    totalGames: v.number(),
    winRate: v.number(),
    tournamentWins: v.number(),
    highestStreak: v.number(),
    currentStreak: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_wins", ["wins"])
    .index("by_win_rate", ["winRate"])
    .index("by_tournament_wins", ["tournamentWins"]),

  gameMoves: defineTable({
    gameId: v.id("games"),
    userId: v.string(),
    position: v.number(),
    symbol: v.string(),
    moveNumber: v.number(),
    timestamp: v.number(),
  })
    .index("by_game_id", ["gameId"])
    .index("by_game_and_move", ["gameId", "moveNumber"]),
});
