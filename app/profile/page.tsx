"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Calendar,
  Users,
  Gamepad2,
  Medal,
  Star,
  Edit,
  Activity,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useSoundEffects } from "@/lib/sound-manager";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { playClickSound } = useSoundEffects();
  const [mounted, setMounted] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const userStats = useQuery(api.leaderboard.getCurrentUserStats);
  const userRank = useQuery(api.leaderboard.getUserRankByWins);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <DashboardShell>
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell>
        <div className="container mx-auto max-w-6xl">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Please sign in to view your profile
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const avatarId = currentUser?.avatarId || 1;
  const username = currentUser?.username || user.username || "Player";
  const name = currentUser?.name || user.fullName || username;
  const email =
    currentUser?.email || user.primaryEmailAddress?.emailAddress || "";

  const wins = userStats?.wins || 0;
  const losses = userStats?.losses || 0;
  const draws = userStats?.draws || 0;
  const totalGames = userStats?.totalGames || 0;
  const winRate = userStats?.winRate || 0;
  const tournamentWins = userStats?.tournamentWins || 0;
  const highestStreak = userStats?.highestStreak || 0;
  const currentStreak = userStats?.currentStreak || 0;

  const rank = userRank?.rank || "N/A";
  const totalPlayers = userRank?.total || 0;

  const getRankBadge = (rank: number | string) => {
    if (rank === "N/A") return { color: "bg-slate-500", label: "Unranked" };
    if (typeof rank === "number") {
      if (rank === 1) return { color: "bg-yellow-500", label: "Champion" };
      if (rank <= 10) return { color: "bg-purple-500", label: "Master" };
      if (rank <= 50) return { color: "bg-blue-500", label: "Expert" };
      if (rank <= 100) return { color: "bg-green-500", label: "Advanced" };
    }
    return { color: "bg-slate-500", label: "Novice" };
  };

  const rankBadge = getRankBadge(rank);

  const getProgressColor = (rate: number) => {
    if (rate >= 70) return "bg-green-500";
    if (rate >= 50) return "bg-blue-500";
    if (rate >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <DashboardShell>
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50"></div>
                <UserAvatar
                  avatarId={avatarId}
                  username={username}
                  size="xl"
                  className="relative border-4 border-white dark:border-slate-800 shadow-2xl"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
                    {name}
                  </h1>
                  <Badge
                    className={cn(
                      "text-white border-none shadow-lg",
                      rankBadge.color,
                    )}
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    {rankBadge.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">@{username}</p>
                <p className="text-sm text-muted-foreground mb-4">{email}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">Rank #{rank}</span>
                    <span className="text-muted-foreground">
                      of {totalPlayers}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>
                      Member since{" "}
                      {new Date(
                        currentUser?.createdAt || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link href="/settings">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={playClickSound}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {wins}
                  </p>
                  <p className="text-xs text-muted-foreground">Wins</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {losses}
                  </p>
                  <p className="text-xs text-muted-foreground">Losses</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {draws}
                  </p>
                  <p className="text-xs text-muted-foreground">Draws</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Total Games
                </CardTitle>
                <Gamepad2 className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalGames}</p>
              <p className="text-xs text-muted-foreground mt-2">Games Played</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Target className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{winRate.toFixed(1)}%</p>
              <Progress
                value={winRate}
                className="mt-2 h-2"
                indicatorClassName={getProgressColor(winRate)}
              />
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Best: {highestStreak}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Tournaments
                </CardTitle>
                <Award className="h-5 w-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tournamentWins}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Championships Won
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" onClick={playClickSound}>
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" onClick={playClickSound}>
              <Medal className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" onClick={playClickSound}>
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>
                  Detailed statistics of your gaming performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Wins</span>
                      <span className="text-sm text-muted-foreground">
                        {wins} / {totalGames}
                      </span>
                    </div>
                    <Progress
                      value={(wins / totalGames) * 100 || 0}
                      className="h-3"
                      indicatorClassName="bg-green-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Losses</span>
                      <span className="text-sm text-muted-foreground">
                        {losses} / {totalGames}
                      </span>
                    </div>
                    <Progress
                      value={(losses / totalGames) * 100 || 0}
                      className="h-3"
                      indicatorClassName="bg-red-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Draws</span>
                      <span className="text-sm text-muted-foreground">
                        {draws} / {totalGames}
                      </span>
                    </div>
                    <Progress
                      value={(draws / totalGames) * 100 || 0}
                      className="h-3"
                      indicatorClassName="bg-yellow-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Win Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {winRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={winRate}
                      className="h-3"
                      indicatorClassName={getProgressColor(winRate)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{currentStreak}</p>
                    <p className="text-xs text-muted-foreground">
                      Current Streak
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                    <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{highestStreak}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg">
                    <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{tournamentWins}</p>
                    <p className="text-xs text-muted-foreground">
                      Tournament Wins
                    </p>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg">
                    <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">#{rank}</p>
                    <p className="text-xs text-muted-foreground">Global Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Badges</CardTitle>
                <CardDescription>
                  Unlock achievements by reaching milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* First Win Achievement */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      wins >= 1
                        ? "bg-green-500/10 border-green-500/50"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50",
                    )}
                  >
                    <Trophy
                      className={cn(
                        "h-10 w-10 mb-2",
                        wins >= 1 ? "text-green-500" : "text-slate-400",
                      )}
                    />
                    <h3 className="font-semibold mb-1">First Victory</h3>
                    <p className="text-xs text-muted-foreground">
                      Win your first game
                    </p>
                    {wins >= 1 && (
                      <Badge className="mt-2 bg-green-500">Unlocked</Badge>
                    )}
                  </div>

                  {/* 10 Wins Achievement */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      wins >= 10
                        ? "bg-blue-500/10 border-blue-500/50"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50",
                    )}
                  >
                    <Star
                      className={cn(
                        "h-10 w-10 mb-2",
                        wins >= 10 ? "text-blue-500" : "text-slate-400",
                      )}
                    />
                    <h3 className="font-semibold mb-1">Rising Star</h3>
                    <p className="text-xs text-muted-foreground">
                      Win 10 games ({wins}/10)
                    </p>
                    {wins >= 10 && (
                      <Badge className="mt-2 bg-blue-500">Unlocked</Badge>
                    )}
                  </div>

                  {/* Win Streak Achievement */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      highestStreak >= 5
                        ? "bg-yellow-500/10 border-yellow-500/50"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50",
                    )}
                  >
                    <Zap
                      className={cn(
                        "h-10 w-10 mb-2",
                        highestStreak >= 5
                          ? "text-yellow-500"
                          : "text-slate-400",
                      )}
                    />
                    <h3 className="font-semibold mb-1">Hot Streak</h3>
                    <p className="text-xs text-muted-foreground">
                      Win 5 games in a row ({highestStreak}/5)
                    </p>
                    {highestStreak >= 5 && (
                      <Badge className="mt-2 bg-yellow-500">Unlocked</Badge>
                    )}
                  </div>

                  {/* Tournament Win Achievement */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      tournamentWins >= 1
                        ? "bg-purple-500/10 border-purple-500/50"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50",
                    )}
                  >
                    <Award
                      className={cn(
                        "h-10 w-10 mb-2",
                        tournamentWins >= 1
                          ? "text-purple-500"
                          : "text-slate-400",
                      )}
                    />
                    <h3 className="font-semibold mb-1">Champion</h3>
                    <p className="text-xs text-muted-foreground">
                      Win a tournament
                    </p>
                    {tournamentWins >= 1 && (
                      <Badge className="mt-2 bg-purple-500">Unlocked</Badge>
                    )}
                  </div>

                  {/* 50 Wins Achievement */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      wins >= 50
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50",
                    )}
                  >
                    <Medal
                      className={cn(
                        "h-10 w-10 mb-2",
                        wins >= 50 ? "text-red-500" : "text-slate-400",
                      )}
                    />
                    <h3 className="font-semibold mb-1">Veteran</h3>
                    <p className="text-xs text-muted-foreground">
                      Win 50 games ({wins}/50)
                    </p>
                    {wins >= 50 && (
                      <Badge className="mt-2 bg-red-500">Unlocked</Badge>
                    )}
                  </div>

                  {/* Top 10 Achievement */}
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      typeof rank === "number" && rank <= 10
                        ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 opacity-50",
                    )}
                  >
                    <Crown
                      className={cn(
                        "h-10 w-10 mb-2",
                        typeof rank === "number" && rank <= 10
                          ? "text-yellow-500"
                          : "text-slate-400",
                      )}
                    />
                    <h3 className="font-semibold mb-1">Elite Player</h3>
                    <p className="text-xs text-muted-foreground">
                      Reach Top 10 leaderboard
                    </p>
                    {typeof rank === "number" && rank <= 10 && (
                      <Badge className="mt-2 bg-yellow-500">Unlocked</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard Position</CardTitle>
                <CardDescription>
                  See where you stand among all players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-3xl font-bold mb-4 shadow-lg">
                    #{rank}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Your Global Rank</h3>
                  <p className="text-muted-foreground mb-6">
                    Out of {totalPlayers} players
                  </p>

                  <div className="flex items-center justify-center gap-8 mb-8">
                    <div>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {wins}
                      </p>
                      <p className="text-sm text-muted-foreground">Wins</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {winRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {tournamentWins}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tournaments
                      </p>
                    </div>
                  </div>

                  <Link href="/leaderboard">
                    <Button
                      className="gap-2"
                      size="lg"
                      onClick={playClickSound}
                    >
                      <Trophy className="h-5 w-5" />
                      View Full Leaderboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
