"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { GameBoard } from "@/components/game-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/user-avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Home,
  RotateCw,
  Loader2,
  Send,
  Trophy,
  Target,
  Zap,
  Award,
  Crown,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { useSoundEffects } from "@/lib/sound-manager";
import { cn } from "@/lib/utils";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  const { playClickSound } = useSoundEffects();

  const [isCopied, setIsCopied] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [playerCardOpen, setPlayerCardOpen] = useState(false);

  // Convex queries and mutations
  const game = useQuery(
    api.games.getGameByRoomCode,
    roomCode ? { roomCode } : "skip",
  );
  const makeMoveMutation = useMutation(api.games.makeMove);
  const leaveGameMutation = useMutation(api.games.leaveGame);
  const rematchMutation = useMutation(api.games.rematch);
  const currentUser = useQuery(api.users.getCurrentUser);
  const chatMessages = useQuery(
    api.chat.getMessages,
    game?._id ? { gameId: game._id, limit: 100 } : "skip",
  );
  const sendMessageMutation = useMutation(api.chat.sendMessage);

  // Get player stats for card
  const selectedPlayerStats = useQuery(
    api.leaderboard.getUserStats,
    selectedPlayerId ? { userId: selectedPlayerId } : "skip",
  );

  // Check if current user is a player
  const currentPlayer = game?.players.find(
    (p) => p.userId === currentUser?.clerkId,
  );
  const isMyTurn = game?.currentPlayer === currentUser?.clerkId;
  const isGameActive = game?.status === "active";
  const isGameCompleted = game?.status === "completed";

  // Copy room code to clipboard
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setIsCopied(true);
    playClickSound();
    toast({
      title: "Room code copied!",
      description: "Share this code with your friends to join the game.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Make a move
  const handleMove = async (position: number) => {
    if (!game || !currentPlayer || !isMyTurn || !isGameActive) {
      return;
    }

    try {
      playClickSound();
      await makeMoveMutation({
        gameId: game._id,
        position,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to make move",
        variant: "destructive",
      });
    }
  };

  // Leave game
  const handleLeaveGame = async () => {
    if (!game) return;

    try {
      playClickSound();
      await leaveGameMutation({ gameId: game._id });
      toast({
        title: "Left game",
        description: "You have left the game.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave game",
        variant: "destructive",
      });
    }
  };

  // Rematch
  const handleRematch = async () => {
    if (!game) return;

    try {
      playClickSound();
      await rematchMutation({ gameId: game._id });
      toast({
        title: "Rematch created!",
        description: "Starting a new game...",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create rematch",
        variant: "destructive",
      });
    }
  };

  // Send chat message
  const handleSendMessage = async () => {
    if (!game || !chatInput.trim()) return;

    setIsSendingMessage(true);
    try {
      playClickSound();
      await sendMessageMutation({
        gameId: game._id,
        message: chatInput.trim(),
      });
      setChatInput("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Open player card
  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setPlayerCardOpen(true);
    playClickSound();
  };

  // Get winner info
  const getWinnerInfo = () => {
    if (!game || !game.winner) return null;

    if (game.winner === "draw") {
      return { text: "It's a Draw!", color: "text-yellow-500" };
    }

    const winner = game.players.find((p) => p.userId === game.winner);
    if (!winner) return null;

    const isCurrentUserWinner = game.winner === currentUser?.clerkId;
    return {
      text: isCurrentUserWinner ? "You Won! 🎉" : `${winner.name} Wins!`,
      color: isCurrentUserWinner ? "text-green-500" : "text-blue-500",
    };
  };

  // Loading state
  if (game === undefined) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Loading game...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Game not found
  if (game === null) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Game not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This game room doesn't exist or has been deleted.
              </p>
              <Link href="/">
                <Button className="w-full" onClick={playClickSound}>
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  // Not authenticated
  return (
    <>
      <Unauthenticated>
        <DashboardShell>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Sign in required</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You need to be signed in to play this game.
                </p>
                <SignInButton mode="modal">
                  <Button className="w-full">Sign In</Button>
                </SignInButton>
              </CardContent>
            </Card>
          </div>
        </DashboardShell>
      </Unauthenticated>

      <Authenticated>
        <DashboardShell>
          <div className="container mx-auto max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Game Room</h1>
                  <Badge
                    variant={
                      game.status === "active"
                        ? "default"
                        : game.status === "waiting"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {game.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-muted-foreground">
                    Room Code:{" "}
                    <span className="font-mono font-bold text-foreground">
                      {roomCode}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyRoomCode}
                    className="h-7"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="outline" onClick={playClickSound}>
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                {isGameCompleted && (
                  <Button onClick={handleRematch}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Rematch
                  </Button>
                )}
              </div>
            </div>

            {/* Main Game Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Players & Game Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Players Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Players
                      </CardTitle>
                      <Badge variant="outline">
                        {game.players.length} / {game.maxPlayers}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {game.players.map((player) => {
                      const isCurrentPlayer =
                        player.userId === currentUser?.clerkId;
                      const isActive = game.currentPlayer === player.userId;

                      return (
                        <button
                          key={player.userId}
                          onClick={() => handlePlayerClick(player.userId)}
                          className={cn(
                            "w-full p-3 rounded-lg border-2 transition-all hover:shadow-md",
                            isActive
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-border hover:border-blue-300",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <UserAvatar
                                avatarId={player.avatarId}
                                username={player.name}
                                size="md"
                              />
                              {isActive && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">
                                  {player.name}
                                  {isCurrentPlayer && " (You)"}
                                </p>
                                {player.isHost && (
                                  <Badge
                                    variant="secondary"
                                    className="h-5 text-xs"
                                  >
                                    Host
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Playing as {player.symbol}
                              </p>
                            </div>
                            {isActive && (
                              <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Waiting for players */}
                    {game.players.length < game.maxPlayers &&
                      game.status === "waiting" && (
                        <div className="p-4 border-2 border-dashed rounded-lg text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Waiting for players...
                          </p>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Game Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Game Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Board Size
                      </span>
                      <Badge variant="outline">
                        {game.boardSize}x{game.boardSize}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Game Mode
                      </span>
                      <Badge variant="outline">{game.gameMode}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Max Players
                      </span>
                      <Badge variant="outline">{game.maxPlayers}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Private Room
                      </span>
                      <Badge variant={game.isPrivate ? "default" : "secondary"}>
                        {game.isPrivate ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Leave Game Button */}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLeaveGame}
                >
                  Leave Game
                </Button>
              </div>

              {/* Center Column - Game Board */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    {/* Game Status */}
                    {isGameActive && (
                      <div className="mb-6 text-center">
                        {isMyTurn ? (
                          <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              Your Turn! ✨
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                              Waiting for opponent...
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Waiting Status */}
                    {game.status === "waiting" && (
                      <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-center">
                        <p className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
                          Waiting for more players...
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {game.players.length} / {game.maxPlayers} joined
                        </p>
                      </div>
                    )}

                    {/* Game Completed */}
                    {isGameCompleted && getWinnerInfo() && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/50 rounded-lg text-center">
                        <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                        <p
                          className={cn(
                            "text-2xl font-bold",
                            getWinnerInfo()?.color,
                          )}
                        >
                          {getWinnerInfo()?.text}
                        </p>
                      </div>
                    )}

                    {/* Game Board */}
                    <div className="flex items-center justify-center">
                      <GameBoard
                        board={game.board}
                        boardSize={game.boardSize}
                        onCellClick={handleMove}
                        disabled={!isMyTurn || !isGameActive}
                        currentPlayer={currentPlayer?.symbol || ""}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Chat */}
              <div className="lg:col-span-1">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 px-4">
                      <div className="space-y-3 py-4">
                        {chatMessages && chatMessages.length > 0 ? (
                          chatMessages.map((msg) => {
                            const isOwnMessage =
                              msg.userId === currentUser?.clerkId;
                            return (
                              <div
                                key={msg._id}
                                className={cn(
                                  "flex gap-2",
                                  isOwnMessage
                                    ? "flex-row-reverse"
                                    : "flex-row",
                                )}
                              >
                                <UserAvatar
                                  avatarId={msg.avatarId}
                                  username={msg.username}
                                  size="sm"
                                  className="flex-shrink-0"
                                />
                                <div
                                  className={cn(
                                    "max-w-[80%]",
                                    isOwnMessage ? "items-end" : "items-start",
                                  )}
                                >
                                  <p
                                    className={cn(
                                      "text-xs font-medium mb-1",
                                      isOwnMessage ? "text-right" : "text-left",
                                    )}
                                  >
                                    {msg.username}
                                  </p>
                                  <div
                                    className={cn(
                                      "rounded-lg px-3 py-2",
                                      isOwnMessage
                                        ? "bg-blue-500 text-white"
                                        : "bg-muted",
                                    )}
                                  >
                                    <p className="text-sm break-words">
                                      {msg.message}
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                              No messages yet. Start the conversation!
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          disabled={
                            !game.settings.chatEnabled || isSendingMessage
                          }
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={
                            !chatInput.trim() ||
                            !game.settings.chatEnabled ||
                            isSendingMessage
                          }
                          size="icon"
                        >
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Player Card Dialog */}
          <Dialog open={playerCardOpen} onOpenChange={setPlayerCardOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Player Profile</DialogTitle>
              </DialogHeader>
              {selectedPlayerId && (
                <div className="space-y-6">
                  {/* Player Info */}
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      avatarId={
                        game.players.find((p) => p.userId === selectedPlayerId)
                          ?.avatarId || 1
                      }
                      username={
                        game.players.find((p) => p.userId === selectedPlayerId)
                          ?.name || "Player"
                      }
                      size="xl"
                      className="border-4 border-blue-500/20"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">
                        {game.players.find((p) => p.userId === selectedPlayerId)
                          ?.name || "Player"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Playing as{" "}
                        {game.players.find((p) => p.userId === selectedPlayerId)
                          ?.symbol || "?"}
                      </p>
                      {game.players.find((p) => p.userId === selectedPlayerId)
                        ?.isHost && <Badge className="mt-2">Host</Badge>}
                    </div>
                  </div>

                  <Separator />

                  {/* Player Stats */}
                  {selectedPlayerStats ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Statistics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-500/10 rounded-lg">
                          <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {selectedPlayerStats.wins}
                          </p>
                          <p className="text-xs text-muted-foreground">Wins</p>
                        </div>

                        <div className="text-center p-4 bg-red-500/10 rounded-lg">
                          <Target className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {selectedPlayerStats.losses}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Losses
                          </p>
                        </div>

                        <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                          <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {selectedPlayerStats.winRate.toFixed(0)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Win Rate
                          </p>
                        </div>

                        <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                          <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold">
                            {selectedPlayerStats.tournamentWins}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tournaments
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Games</span>
                          <span className="font-bold">
                            {selectedPlayerStats.totalGames}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Current Streak</span>
                          <span className="font-bold">
                            {selectedPlayerStats.currentStreak}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Highest Streak</span>
                          <span className="font-bold">
                            {selectedPlayerStats.highestStreak}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Loading stats...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </DashboardShell>
      </Authenticated>
    </>
  );
}
