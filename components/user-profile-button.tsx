"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Trophy, LogOut, Crown, Shield } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSoundEffects } from "@/lib/sound-manager";
import { cn } from "@/lib/utils";

export function UserProfileButton() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { playClickSound } = useSoundEffects();
  const [open, setOpen] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const userStats = useQuery(api.leaderboard.getCurrentUserStats);
  const userRank = useQuery(api.leaderboard.getUserRankByWins);

  if (!user) return null;

  const avatarId = currentUser?.avatarId || 1;
  const username = currentUser?.username || user.username || "Player";
  const wins = userStats?.wins || 0;
  const losses = userStats?.losses || 0;
  const winRate = userStats?.winRate || 0;
  const rank = userRank?.rank || "N/A";

  const getRankBadge = (rank: number | string) => {
    if (rank === "N/A")
      return { color: "bg-slate-500", label: "Unranked", icon: Shield };
    if (typeof rank === "number") {
      if (rank === 1)
        return { color: "bg-yellow-500", label: "Champion", icon: Crown };
      if (rank <= 10)
        return { color: "bg-purple-500", label: "Master", icon: Trophy };
      if (rank <= 50)
        return { color: "bg-blue-500", label: "Expert", icon: Trophy };
      if (rank <= 100)
        return { color: "bg-green-500", label: "Advanced", icon: Trophy };
    }
    return { color: "bg-slate-500", label: "Novice", icon: Shield };
  };

  const rankBadge = getRankBadge(rank);
  const RankIcon = rankBadge.icon;

  const handleSignOut = () => {
    playClickSound();
    signOut(() => router.push("/"));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-12 rounded-full border-2 border-transparent hover:border-blue-500 transition-all duration-200"
          onClick={playClickSound}
        >
          <UserAvatar
            avatarId={avatarId}
            username={username}
            size="md"
            className="border-2 border-white/20"
          />
          {typeof rank === "number" && rank <= 10 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg">
              <Crown className="h-3 w-3 text-white" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-start gap-3 p-2">
            <UserAvatar
              avatarId={avatarId}
              username={username}
              size="lg"
              className="border-2 border-blue-500/20"
            />
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold leading-none">{username}</p>
              <p className="text-xs text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={cn(
                    "text-white border-none text-xs",
                    rankBadge.color,
                  )}
                >
                  <RankIcon className="h-3 w-3 mr-1" />
                  {rankBadge.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Rank #{rank}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="px-2 py-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {wins}
              </p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {losses}
              </p>
              <p className="text-xs text-muted-foreground">Losses</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {winRate.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <Link href="/profile" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer" onClick={playClickSound}>
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/settings" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer" onClick={playClickSound}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/leaderboard" onClick={() => setOpen(false)}>
          <DropdownMenuItem className="cursor-pointer" onClick={playClickSound}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Leaderboard</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
