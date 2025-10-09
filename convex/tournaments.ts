import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a tournament
export const createTournament = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    boardSize: v.number(),
    maxPlayers: v.number(),
    totalParticipants: v.number(),
    roundCount: v.number(),
    winCondition: v.number(),
    chatEnabled: v.boolean(),
    isPublic: v.boolean(),
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

    const tournamentId = await ctx.db.insert("tournaments", {
      name: args.name,
      description: args.description,
      hostId: identity.subject,
      status: "pending",
      settings: {
        boardSize: args.boardSize,
        maxPlayers: args.maxPlayers,
        totalParticipants: args.totalParticipants,
        roundCount: args.roundCount,
        winCondition: args.winCondition,
        chatEnabled: args.chatEnabled,
        isPublic: args.isPublic,
      },
      participants: [
        {
          userId: identity.subject,
          username: user?.username || user?.name || identity.name || "Host",
          avatarId: user?.avatarId || 1,
          wins: 0,
          losses: 0,
          score: 0,
        },
      ],
      currentRound: 0,
      rounds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return tournamentId;
  },
});

// Join a tournament
export const joinTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "pending") {
      throw new Error("Tournament has already started");
    }

    const existingParticipant = tournament.participants.find(
      (p) => p.userId === identity.subject,
    );
    if (existingParticipant) {
      throw new Error("You are already in this tournament");
    }

    if (
      tournament.participants.length >= tournament.settings.totalParticipants
    ) {
      throw new Error("Tournament is full");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    await ctx.db.patch(args.tournamentId, {
      participants: [
        ...tournament.participants,
        {
          userId: identity.subject,
          username: user?.username || user?.name || identity.name || "Player",
          avatarId: user?.avatarId || tournament.participants.length + 1,
          wins: 0,
          losses: 0,
          score: 0,
        },
      ],
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Leave a tournament
export const leaveTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "pending") {
      throw new Error("Cannot leave a tournament that has started");
    }

    if (tournament.hostId === identity.subject) {
      throw new Error("Host cannot leave. Cancel the tournament instead.");
    }

    const updatedParticipants = tournament.participants.filter(
      (p) => p.userId !== identity.subject,
    );

    await ctx.db.patch(args.tournamentId, {
      participants: updatedParticipants,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Start a tournament
export const startTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.hostId !== identity.subject) {
      throw new Error("Only the host can start the tournament");
    }

    if (tournament.status !== "pending") {
      throw new Error("Tournament has already started or is completed");
    }

    if (tournament.participants.length < 2) {
      throw new Error("Need at least 2 participants to start");
    }

    // Create first round matches
    const firstRound = await createRoundMatches(ctx, tournament, 1);

    await ctx.db.patch(args.tournamentId, {
      status: "active",
      currentRound: 1,
      rounds: [firstRound],
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Get tournament by ID
export const getTournament = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    return tournament;
  },
});

// Get public tournaments
export const getPublicTournaments = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const status = args.status as
      | "pending"
      | "active"
      | "completed"
      | undefined;

    let tournaments;

    if (status) {
      tournaments = await ctx.db
        .query("tournaments")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(limit);
    } else {
      tournaments = await ctx.db.query("tournaments").order("desc").take(limit);
    }

    return tournaments.filter((t) => t.settings.isPublic);
  },
});

// Get user's tournaments
export const getUserTournaments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const allTournaments = await ctx.db
      .query("tournaments")
      .order("desc")
      .take(50);

    return allTournaments.filter((t) =>
      t.participants.some((p) => p.userId === identity.subject),
    );
  },
});

// Get tournaments hosted by user
export const getHostedTournaments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const tournaments = await ctx.db
      .query("tournaments")
      .withIndex("by_host_id", (q) => q.eq("hostId", identity.subject))
      .order("desc")
      .collect();

    return tournaments;
  },
});

// Update tournament participant score
export const updateParticipantScore = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.string(),
    won: v.boolean(),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const updatedParticipants = tournament.participants.map((p) => {
      if (p.userId === args.userId) {
        return {
          ...p,
          wins: args.won ? p.wins + 1 : p.wins,
          losses: args.won ? p.losses : p.losses + 1,
          score: args.won ? p.score + 3 : p.score,
        };
      }
      return p;
    });

    await ctx.db.patch(args.tournamentId, {
      participants: updatedParticipants,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Advance to next round
export const advanceToNextRound = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.hostId !== identity.subject) {
      throw new Error("Only the host can advance rounds");
    }

    if (tournament.status !== "active") {
      throw new Error("Tournament is not active");
    }

    const currentRoundData = tournament.rounds[tournament.currentRound - 1];
    if (!currentRoundData?.isComplete) {
      throw new Error("Current round is not complete");
    }

    if (tournament.currentRound >= tournament.settings.roundCount) {
      // Tournament is complete, determine winner
      const sortedParticipants = [...tournament.participants].sort(
        (a, b) => b.score - a.score || b.wins - a.wins,
      );
      const winner = sortedParticipants[0];

      await ctx.db.patch(args.tournamentId, {
        status: "completed",
        winner: winner
          ? { userId: winner.userId, username: winner.username }
          : undefined,
        completedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update leaderboard for tournament win
      if (winner) {
        const leaderboardEntry = await ctx.db
          .query("leaderboard")
          .withIndex("by_user_id", (q) => q.eq("userId", winner.userId))
          .unique();

        if (leaderboardEntry) {
          await ctx.db.patch(leaderboardEntry._id, {
            tournamentWins: leaderboardEntry.tournamentWins + 1,
            updatedAt: Date.now(),
          });
        }
      }

      return { completed: true, winner };
    }

    // Create next round
    const nextRoundNumber = tournament.currentRound + 1;
    const nextRound = await createRoundMatches(
      ctx,
      tournament,
      nextRoundNumber,
    );

    await ctx.db.patch(args.tournamentId, {
      currentRound: nextRoundNumber,
      rounds: [...tournament.rounds, nextRound],
      updatedAt: Date.now(),
    });

    return { completed: false, nextRound: nextRoundNumber };
  },
});

// Mark round as complete
export const markRoundComplete = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    roundNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.hostId !== identity.subject) {
      throw new Error("Only the host can mark rounds as complete");
    }

    const updatedRounds = tournament.rounds.map((round) => {
      if (round.roundNumber === args.roundNumber) {
        return { ...round, isComplete: true };
      }
      return round;
    });

    await ctx.db.patch(args.tournamentId, {
      rounds: updatedRounds,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Cancel tournament
export const cancelTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.hostId !== identity.subject) {
      throw new Error("Only the host can cancel the tournament");
    }

    if (tournament.status === "completed") {
      throw new Error("Cannot cancel a completed tournament");
    }

    await ctx.db.patch(args.tournamentId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Helper function to create round matches
async function createRoundMatches(
  ctx: any,
  tournament: any,
  roundNumber: number,
) {
  const { boardSize, maxPlayers, winCondition, chatEnabled } =
    tournament.settings;
  const boardLength = boardSize * boardSize;
  const symbols = ["X", "O", "A", "B"];

  // Get active participants (sorted by score)
  const activeParticipants = [...tournament.participants].sort(
    (a, b) => b.score - a.score,
  );

  const matches: Id<"games">[] = [];

  // Create matches by pairing participants
  for (let i = 0; i < activeParticipants.length; i += maxPlayers) {
    const matchPlayers = activeParticipants.slice(i, i + maxPlayers);

    if (matchPlayers.length < 2) {
      // Not enough players for a match, give bye
      continue;
    }

    const gameId = await ctx.db.insert("games", {
      players: matchPlayers.map((p, index) => ({
        userId: p.userId,
        name: p.username,
        avatarId: p.avatarId,
        symbol: symbols[index] || `P${index + 1}`,
        isHost: index === 0,
      })),
      board: Array(boardLength).fill(null),
      boardSize,
      currentPlayer: matchPlayers[0].userId,
      status: "active",
      maxPlayers,
      isPrivate: true,
      gameMode: "tournament",
      settings: {
        chatEnabled,
        chatFilter: true,
        winCondition,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      startedAt: Date.now(),
    });

    matches.push(gameId);
  }

  return {
    roundNumber,
    matches,
    isComplete: false,
  };
}

// Get tournament leaderboard
export const getTournamentLeaderboard = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      return null;
    }

    const sortedParticipants = [...tournament.participants].sort(
      (a, b) => b.score - a.score || b.wins - a.wins || a.losses - b.losses,
    );

    return sortedParticipants;
  },
});
