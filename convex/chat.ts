import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Send a chat message
export const sendMessage = mutation({
  args: {
    gameId: v.id("games"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user info
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Get game to check if user is a player and chat is enabled
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const player = game.players.find((p) => p.userId === identity.subject);
    if (!player) {
      throw new Error("You are not a player in this game");
    }

    if (!game.settings.chatEnabled) {
      throw new Error("Chat is disabled for this game");
    }

    // Check if message should be filtered
    const isFiltered = game.settings.chatFilter && containsProfanity(args.message);

    // Insert message
    const messageId = await ctx.db.insert("chatMessages", {
      gameId: args.gameId,
      userId: identity.subject,
      username: player.name,
      avatarId: player.avatarId,
      message: isFiltered ? "[Message filtered]" : args.message,
      isFiltered,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

// Get chat messages for a game
export const getMessages = query({
  args: {
    gameId: v.id("games"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_game_id", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(limit);

    return messages.reverse();
  },
});

// Get recent messages with pagination
export const getMessagesPaginated = query({
  args: {
    gameId: v.id("games"),
    before: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const before = args.before || Date.now();

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_game_and_created", (q) =>
        q.eq("gameId", args.gameId).lt("createdAt", before)
      )
      .order("desc")
      .take(limit);

    return {
      messages: messages.reverse(),
      hasMore: messages.length === limit,
      oldestTimestamp: messages[0]?.createdAt,
    };
  },
});

// Delete a message (only for the sender or host)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    const game = await ctx.db.get(message.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const player = game.players.find((p) => p.userId === identity.subject);
    if (!player) {
      throw new Error("You are not a player in this game");
    }

    // Only allow deletion if user is the sender or the host
    if (message.userId !== identity.subject && !player.isHost) {
      throw new Error("You don't have permission to delete this message");
    }

    await ctx.db.delete(args.messageId);
    return true;
  },
});

// Clear all messages for a game (host only)
export const clearMessages = mutation({
  args: {
    gameId: v.id("games"),
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

    const player = game.players.find((p) => p.userId === identity.subject);
    if (!player || !player.isHost) {
      throw new Error("Only the host can clear all messages");
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_game_id", (q) => q.eq("gameId", args.gameId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { deleted: messages.length };
  },
});

// Helper function to detect profanity
function containsProfanity(message: string): boolean {
  const profanityList = [
    "badword1",
    "badword2",
    "badword3",
    // Add more as needed
  ];

  const lowerMessage = message.toLowerCase();
  return profanityList.some((word) => lowerMessage.includes(word));
}

// Send a system message (for game events)
export const sendSystemMessage = mutation({
  args: {
    gameId: v.id("games"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const messageId = await ctx.db.insert("chatMessages", {
      gameId: args.gameId,
      userId: "system",
      username: "System",
      avatarId: 0,
      message: args.message,
      isFiltered: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});
