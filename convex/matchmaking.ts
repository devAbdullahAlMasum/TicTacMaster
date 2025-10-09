import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Join matchmaking queue
export const joinQueue = mutation({
  args: {
    boardSize: v.number(),
    maxPlayers: v.number(),
    gameMode: v.string(),
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

    // Check if user is already in queue
    const existing = await ctx.db
      .query("matchmaking")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "searching"))
      .first();

    if (existing) {
      return existing._id;
    }

    // Add to queue
    const queueId = await ctx.db.insert("matchmaking", {
      userId: identity.subject,
      username: user?.username || user?.name || identity.name || "Player",
      avatarId: user?.avatarId || 1,
      preferences: {
        boardSize: args.boardSize,
        maxPlayers: args.maxPlayers,
        gameMode: args.gameMode,
      },
      status: "searching",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Try to find a match
    await findMatch(ctx, queueId);

    return queueId;
  },
});

// Leave matchmaking queue
export const leaveQueue = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const queueEntry = await ctx.db
      .query("matchmaking")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("status"), "searching"))
      .first();

    if (queueEntry) {
      await ctx.db.patch(queueEntry._id, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

// Get user's queue status
export const getQueueStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const queueEntry = await ctx.db
      .query("matchmaking")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "searching"),
          q.eq(q.field("status"), "matched"),
        ),
      )
      .first();

    return queueEntry;
  },
});

// Get queue statistics
export const getQueueStats = query({
  args: {},
  handler: async (ctx) => {
    const searching = await ctx.db
      .query("matchmaking")
      .withIndex("by_status", (q) => q.eq("status", "searching"))
      .collect();

    const stats = {
      totalSearching: searching.length,
      byMode: {} as Record<string, number>,
      byPlayers: {} as Record<number, number>,
      byBoardSize: {} as Record<number, number>,
    };

    for (const entry of searching) {
      const mode = entry.preferences.gameMode;
      const players = entry.preferences.maxPlayers;
      const boardSize = entry.preferences.boardSize;

      stats.byMode[mode] = (stats.byMode[mode] || 0) + 1;
      stats.byPlayers[players] = (stats.byPlayers[players] || 0) + 1;
      stats.byBoardSize[boardSize] = (stats.byBoardSize[boardSize] || 0) + 1;
    }

    return stats;
  },
});

// Internal function to find matches
async function findMatch(ctx: any, queueId: Id<"matchmaking">) {
  const entry = await ctx.db.get(queueId);
  if (!entry || entry.status !== "searching") {
    return;
  }

  const { preferences } = entry;

  // Find other players with matching preferences
  const potentialMatches = await ctx.db
    .query("matchmaking")
    .withIndex("by_status", (q: any) => q.eq("status", "searching"))
    .collect();

  const compatiblePlayers = potentialMatches.filter(
    (p: any) =>
      p._id !== queueId &&
      p.preferences.boardSize === preferences.boardSize &&
      p.preferences.maxPlayers === preferences.maxPlayers &&
      p.preferences.gameMode === preferences.gameMode,
  );

  // If we have enough players for a game, create it
  if (compatiblePlayers.length >= preferences.maxPlayers - 1) {
    const players = [
      entry,
      ...compatiblePlayers.slice(0, preferences.maxPlayers - 1),
    ];

    const boardSize = preferences.boardSize;
    const boardLength = boardSize * boardSize;
    const symbols = ["X", "O", "A", "B"];

    // Create the game
    const gameId = await ctx.db.insert("games", {
      players: players.map((p, index) => ({
        userId: p.userId,
        name: p.username,
        avatarId: p.avatarId,
        symbol: symbols[index],
        isHost: index === 0,
      })),
      board: Array(boardLength).fill(null),
      boardSize,
      currentPlayer: players[0].userId,
      status: "active",
      maxPlayers: preferences.maxPlayers,
      isPrivate: false,
      gameMode: preferences.gameMode as any,
      settings: {
        chatEnabled: true,
        chatFilter: true,
        winCondition: boardSize,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      startedAt: Date.now(),
    });

    // Update all queue entries to matched
    for (const player of players) {
      await ctx.db.patch(player._id, {
        status: "matched",
        gameId,
        updatedAt: Date.now(),
      });
    }

    return gameId;
  }

  return null;
}

// Periodic cleanup of old queue entries (called by cron or manually)
export const cleanupQueue = mutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    const oldEntries = await ctx.db
      .query("matchmaking")
      .withIndex("by_created_at")
      .filter((q) => q.lt(q.field("createdAt"), oneDayAgo))
      .collect();

    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }

    return { deleted: oldEntries.length };
  },
});
