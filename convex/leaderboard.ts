import { v } from "convex/values";
import { query } from "./_generated/server";

// Get top players by wins
export const getTopPlayersByWins = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const topPlayers = await ctx.db
      .query("leaderboard")
      .withIndex("by_wins")
      .order("desc")
      .take(limit);

    return topPlayers;
  },
});

// Get top players by tournament wins
export const getTopPlayersByTournamentWins = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const topPlayers = await ctx.db
      .query("leaderboard")
      .withIndex("by_tournament_wins")
      .order("desc")
      .take(limit);

    return topPlayers;
  },
});

// Get top players by win rate (minimum 5 games played)
export const getTopPlayersByWinRate = query({
  args: {
    limit: v.optional(v.number()),
    minGames: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const minGames = args.minGames || 5;

    const allPlayers = await ctx.db
      .query("leaderboard")
      .withIndex("by_win_rate")
      .order("desc")
      .collect();

    // Filter players with minimum games
    const qualifiedPlayers = allPlayers.filter(
      (player) => player.totalGames >= minGames,
    );

    return qualifiedPlayers.slice(0, limit);
  },
});

// Get current user's leaderboard stats
export const getCurrentUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const stats = await ctx.db
      .query("leaderboard")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    return stats;
  },
});

// Get user's rank by wins
export const getUserRankByWins = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userStats = await ctx.db
      .query("leaderboard")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userStats) {
      return null;
    }

    // Get all players sorted by wins
    const allPlayers = await ctx.db
      .query("leaderboard")
      .withIndex("by_wins")
      .order("desc")
      .collect();

    // Find user's rank
    const rank =
      allPlayers.findIndex((player) => player._id === userStats._id) + 1;

    return {
      rank,
      total: allPlayers.length,
      stats: userStats,
    };
  },
});

// Get user's rank by win rate
export const getUserRankByWinRate = query({
  args: { minGames: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const minGames = args.minGames || 5;

    const userStats = await ctx.db
      .query("leaderboard")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!userStats) {
      return null;
    }

    // Get all qualified players sorted by win rate
    const allPlayers = await ctx.db
      .query("leaderboard")
      .withIndex("by_win_rate")
      .order("desc")
      .collect();

    const qualifiedPlayers = allPlayers.filter(
      (player) => player.totalGames >= minGames,
    );

    // Find user's rank among qualified players
    const rank =
      qualifiedPlayers.findIndex((player) => player._id === userStats._id) + 1;

    return {
      rank: rank > 0 ? rank : null,
      total: qualifiedPlayers.length,
      stats: userStats,
      qualified: userStats.totalGames >= minGames,
    };
  },
});

// Get leaderboard with pagination
export const getLeaderboardPaginated = query({
  args: {
    sortBy: v.union(v.literal("wins"), v.literal("winRate")),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
    minGames: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const offset = args.offset || 0;
    const limit = args.limit || 20;
    const minGames = args.minGames || 0;

    let players;

    if (args.sortBy === "wins") {
      players = await ctx.db
        .query("leaderboard")
        .withIndex("by_wins")
        .order("desc")
        .collect();
    } else {
      players = await ctx.db
        .query("leaderboard")
        .withIndex("by_win_rate")
        .order("desc")
        .collect();
    }

    // Filter by minimum games if specified
    if (minGames > 0) {
      players = players.filter((player) => player.totalGames >= minGames);
    }

    const total = players.length;
    const paginatedPlayers = players.slice(offset, offset + limit);

    return {
      players: paginatedPlayers,
      total,
      hasMore: offset + limit < total,
    };
  },
});

// Search users in leaderboard by username
export const searchLeaderboard = query({
  args: {
    username: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const searchTerm = args.username.toLowerCase();

    const allPlayers = await ctx.db.query("leaderboard").collect();

    // Filter by username (case-insensitive partial match)
    const matchingPlayers = allPlayers
      .filter((player) => player.username.toLowerCase().includes(searchTerm))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, limit);

    return matchingPlayers;
  },
});
