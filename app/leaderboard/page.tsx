"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Crown, Star, Calendar, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function LeaderboardPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50 p-6 rounded-xl border border-amber-100 dark:border-amber-900 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-yellow-500/10 blur-2xl"></div>

          <div className="flex items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white mr-4 shadow-lg">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 text-transparent bg-clip-text">
                  Leaderboard
                </h1>
                <Badge className="ml-3 bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30">
                  COMING SOON
                </Badge>
              </div>
              <p className="text-amber-600 dark:text-amber-400 max-w-2xl">
                Global rankings and statistics for TicTacMaster players
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 hover:shadow-md transition-all group overflow-hidden">
          <div className="absolute w-32 h-32 -right-10 -top-10 bg-amber-200/30 dark:bg-amber-800/20 rounded-full blur-xl"></div>
          <div className="absolute w-32 h-32 left-40 bottom-10 bg-yellow-200/20 dark:bg-yellow-800/10 rounded-full blur-xl"></div>

          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-amber-700 dark:text-amber-300 flex items-center">
              <Crown className="mr-2 h-6 w-6" />
              Global Leaderboard
            </CardTitle>
            <CardDescription className="text-amber-600/80 dark:text-amber-400/80">
              Track your progress and compete with players worldwide
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center mb-6">
                <Trophy className="h-12 w-12 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-3">Coming Soon!</h3>
              <p className="text-amber-600/80 dark:text-amber-400/80 max-w-md">
                We're working hard to bring you a comprehensive leaderboard system. Track your wins, compare stats, and
                climb the ranks!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 flex flex-col items-center">
                  <Star className="h-8 w-8 text-amber-500 mb-2" />
                  <h4 className="font-medium text-amber-700 dark:text-amber-300">Player Rankings</h4>
                  <p className="text-sm text-amber-600/70 dark:text-amber-400/70 text-center mt-1">
                    Global and regional rankings
                  </p>
                </div>

                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 flex flex-col items-center">
                  <Calendar className="h-8 w-8 text-amber-500 mb-2" />
                  <h4 className="font-medium text-amber-700 dark:text-amber-300">Seasonal Tournaments</h4>
                  <p className="text-sm text-amber-600/70 dark:text-amber-400/70 text-center mt-1">
                    Compete in monthly events
                  </p>
                </div>

                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 flex flex-col items-center">
                  <Users className="h-8 w-8 text-amber-500 mb-2" />
                  <h4 className="font-medium text-amber-700 dark:text-amber-300">Friend Challenges</h4>
                  <p className="text-sm text-amber-600/70 dark:text-amber-400/70 text-center mt-1">
                    Track scores against friends
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder Stats Card */}
        <Card className="border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-amber-700 dark:text-amber-300 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Coming in the Next Update
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Win Rate", "Games Played", "Tournaments Won", "Longest Streak"].map((stat, i) => (
                <div key={i} className="bg-white/40 dark:bg-black/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-700/30 dark:text-amber-300/30">--</div>
                  <div className="text-sm text-amber-600/60 dark:text-amber-400/60">{stat}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
