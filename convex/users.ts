import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create user from Clerk authentication
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email!,
      username: identity.nickname || identity.preferredUsername,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      avatarId: 1,
      createdAt: Date.now(),
    });

    // Also create leaderboard entry for new user
    await ctx.db.insert("leaderboard", {
      userId: identity.subject,
      username:
        identity.nickname || identity.preferredUsername || identity.email!,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      winRate: 0,
      tournamentWins: 0,
      highestStreak: 0,
      currentStreak: 0,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(userId);
  },
});

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarId: v.optional(v.number()),
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

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      name: args.name,
      avatarId: args.avatarId,
    });

    // Update username in leaderboard if changed
    if (args.username) {
      const leaderboardEntry = await ctx.db
        .query("leaderboard")
        .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
        .unique();

      if (leaderboardEntry) {
        await ctx.db.patch(leaderboardEntry._id, {
          username: args.username,
        });
      }
    }

    return await ctx.db.get(user._id);
  },
});

// Get user by ID
export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});
