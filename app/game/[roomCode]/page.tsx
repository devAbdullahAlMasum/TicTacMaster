"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { GameBoard } from "@/components/game-board";
import { PlayerInfo } from "@/components/player-info";
import { GameStatus } from "@/components/game-status";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Home,
  RotateCw,
  Loader2,
  Users,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = params.roomCode as string;

  const [activeTab, setActiveTab] = useState("game");
  const [isCopied, setIsCopied] = useState(false);

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

  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Check if current user is a player
  const currentPlayer = game?.players.find(
    (p) => p.userId === currentUser?.clerkId,
  );
  const isMyTurn = game?.currentPlayer === currentUser?.clerkId;

  // Copy room code to clipboard
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setIsCopied(true);
    toast({
      title: "Room code copied!",
      description: "Share this code with your friends to join the game.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Make a move
  const handleMove = async (position: number) => {
    console.log("handleMove called", {
      position,
      hasGame: !!game,
      hasCurrentPlayer: !!currentPlayer,
      isMyTurn,
      currentPlayerUserId: game?.currentPlayer,
      myUserId: currentUser?.clerkId,
      gameStatus: game?.status,
    });

    if (!game || !currentPlayer || !isMyTurn) {
      console.log("Move blocked:", {
        noGame: !game,
        noCurrentPlayer: !currentPlayer,
        notMyTurn: !isMyTurn,
      });
      return;
    }

    try {
      console.log("Making move...");
      await makeMoveMutation({
        gameId: game._id,
        position,
      });
      console.log("Move successful");
    } catch (error: any) {
      console.error("Move error:", error);
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
      const newGameId = await rematchMutation({ gameId: game._id });
      toast({
        title: "Rematch created!",
        description: "Starting a new game...",
      });
      // Stay on same room code page, it will update automatically
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

  // Loading state
  if (game === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  // Game not found
  if (game === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Game not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This game room doesn't exist or has been deleted.
            </p>
            <Link href="/">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  return (
    <>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
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
      </Unauthenticated>

      <Authenticated>
        <div className="container mx-auto p-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
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
              <p className="text-muted-foreground mt-1">
                Room Code:{" "}
                <span className="font-mono font-bold">{roomCode}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyRoomCode}>
                <Copy className="mr-2 h-4 w-4" />
                {isCopied ? "Copied!" : "Copy Code"}
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left sidebar - Players */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="mr-2 h-5 w-5" />
                    Players ({game.players.length}/{game.maxPlayers})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {game.players.map((player) => (
                    <div
                      key={player.userId}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        game.currentPlayer === player.userId
                          ? "bg-primary/10 border-primary"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {player.name}
                          {player.userId === currentUser?.clerkId && " (You)"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {player.symbol}
                          {player.isHost && " • Host"}
                        </p>
                      </div>
                    </div>
                  ))}

                  {game.status === "waiting" && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Waiting for {game.maxPlayers - game.players.length} more
                        player(s)...
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyRoomCode}
                          className="flex-1"
                        >
                          {isCopied ? "Copied!" : "Share"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleLeaveGame}
                        >
                          Leave
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {game.status === "completed" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Game Over!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {game.winner === "draw" ? (
                      <p className="text-center text-lg">It's a draw! 🤝</p>
                    ) : (
                      <p className="text-center text-lg">
                        {
                          game.players.find((p) => p.userId === game.winner)
                            ?.name
                        }{" "}
                        wins! 🎉
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button onClick={handleRematch} className="w-full">
                        <RotateCw className="mr-2 h-4 w-4" />
                        Rematch
                      </Button>
                      <Link href="/">
                        <Button variant="outline" className="w-full">
                          <Home className="mr-2 h-4 w-4" />
                          Home
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Center - Game board */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="text-center">
                    {game.status === "waiting" ? (
                      <p className="text-lg font-semibold text-muted-foreground">
                        Waiting for players...
                      </p>
                    ) : game.status === "completed" ? (
                      <p className="text-lg font-semibold text-green-600">
                        Game completed!
                      </p>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Current Turn
                        </p>
                        <p className="text-lg font-bold">
                          {
                            game.players.find(
                              (p) => p.userId === game.currentPlayer,
                            )?.name
                          }
                          {isMyTurn && " (Your turn!)"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-6">
                  <GameBoard
                    board={game.board}
                    onCellClick={(pos) => {
                      console.log("GameBoard cell clicked:", pos);
                      handleMove(pos);
                    }}
                    disabled={
                      !isMyTurn || game.status !== "active" || !currentPlayer
                    }
                    boardSize={game.boardSize}
                    winningLine={null}
                  />
                </CardContent>
                {game.status === "waiting" && (
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Share the room code with friends to start playing!
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Right sidebar - Chat */}
            <div className="lg:col-span-1">
              {game.settings.chatEnabled ? (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <div className="flex flex-col h-full">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-muted/20 rounded-lg mb-4">
                        {chatMessages && chatMessages.length > 0 ? (
                          chatMessages.map((msg) => (
                            <div
                              key={msg._id}
                              className={`flex ${
                                msg.userId === currentUser?.clerkId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-lg p-2 ${
                                  msg.userId === currentUser?.clerkId
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-xs font-semibold mb-0.5">
                                  {msg.username}
                                </p>
                                <p className="text-sm break-words">
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground text-sm">
                            No messages yet
                          </p>
                        )}
                      </div>

                      {/* Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
                          disabled={
                            isSendingMessage || game.status !== "active"
                          }
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={
                            !chatInput.trim() ||
                            isSendingMessage ||
                            game.status !== "active"
                          }
                          size="sm"
                        >
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Send"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Chat Disabled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Chat has been disabled for this game.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Authenticated>
    </>
  );
}
