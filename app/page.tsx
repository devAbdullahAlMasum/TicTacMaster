"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Grid3X3, Users, Calendar, Trophy, Sparkles } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-6 rounded-xl border border-blue-100 dark:border-blue-900 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl"></div>

          <div className="flex items-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white mr-4 shadow-lg">
              <Grid3X3 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                  TicTacMaster
                </h1>
                <Badge className="ml-3 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30">
                  BETA
                </Badge>
              </div>
              <p className="text-blue-600 dark:text-blue-400 max-w-2xl">
                Create or join multiplayer games with customizable board sizes and player counts. Challenge friends in
                tournaments or quick matches!
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <Link href="/create-room">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/join-room">
              <Button
                variant="outline"
                className="border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                Join a Game
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute w-20 h-20 -right-5 -top-5 bg-blue-200/50 dark:bg-blue-800/30 rounded-full blur-xl group-hover:bg-blue-300/50 dark:group-hover:bg-blue-700/30 transition-all"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-blue-700 dark:text-blue-300">
                <Grid3X3 className="mr-2 h-5 w-5" />
                Create Game Room
              </CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                Start a new customizable game
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                Create a new game room with custom board size, player count, and chat settings.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/create-room" className="w-full">
                <Button className="w-full group bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                  Create Game
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute w-20 h-20 -right-5 -top-5 bg-purple-200/50 dark:bg-purple-800/30 rounded-full blur-xl group-hover:bg-purple-300/50 dark:group-hover:bg-purple-700/30 transition-all"></div>
            <div className="absolute top-3 right-3">
              <Badge className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">BETA</Badge>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-purple-700 dark:text-purple-300">
                <Calendar className="mr-2 h-5 w-5" />
                Create Event
              </CardTitle>
              <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
                Host a custom game event
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                Create a fully customizable event with multiple rounds, time limits, and special rules.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/create-event" className="w-full">
                <Button
                  variant="outline"
                  className="w-full group border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-200/50 dark:hover:bg-purple-800/50"
                >
                  Create Event
                  <Calendar className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 hover:shadow-md transition-all group overflow-hidden">
            <div className="absolute w-20 h-20 -right-5 -top-5 bg-emerald-200/50 dark:bg-emerald-800/30 rounded-full blur-xl group-hover:bg-emerald-300/50 dark:group-hover:bg-emerald-700/30 transition-all"></div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-emerald-700 dark:text-emerald-300">
                <Users className="mr-2 h-5 w-5" />
                Join Game Room
              </CardTitle>
              <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">
                Join an existing game
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                Enter a room code to join a friend's game and start playing immediately.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/join-room" className="w-full">
                <Button
                  variant="outline"
                  className="w-full group border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50"
                >
                  Join Game
                  <Users className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Featured Game Modes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 text-transparent bg-clip-text">
                Featured Game Modes
              </span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="overflow-hidden border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:shadow-md transition-all group">
              <div className="absolute w-20 h-20 -right-5 -top-5 bg-blue-200/50 dark:bg-blue-800/30 rounded-full blur-xl group-hover:bg-blue-300/50 dark:group-hover:bg-blue-700/30 transition-all"></div>
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  Classic
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300">3×3 Grid</CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                  The original game everyone loves
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-w-[150px] mx-auto">
                  {Array(9)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-md flex items-center justify-center text-lg font-bold ${
                          i % 3 === 0
                            ? "bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200"
                            : i % 3 === 1
                              ? "bg-rose-200 dark:bg-rose-700 text-rose-700 dark:text-rose-200"
                              : "bg-zinc-100 dark:bg-zinc-800"
                        }`}
                      >
                        {i % 3 === 0 ? "X" : i % 3 === 1 ? "O" : ""}
                      </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Get 3 in a row to win</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-md transition-all group">
              <div className="absolute w-20 h-20 -right-5 -top-5 bg-purple-200/50 dark:bg-purple-800/30 rounded-full blur-xl group-hover:bg-purple-300/50 dark:group-hover:bg-purple-700/30 transition-all"></div>
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                >
                  Extended
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300">4×4 Grid</CardTitle>
                <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
                  More strategic gameplay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-1 max-w-[150px] mx-auto">
                  {Array(16)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-md flex items-center justify-center text-sm font-bold ${
                          i % 4 === 0
                            ? "bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200"
                            : i % 4 === 1
                              ? "bg-rose-200 dark:bg-rose-700 text-rose-700 dark:text-rose-200"
                              : i % 4 === 2
                                ? "bg-amber-200 dark:bg-amber-700 text-amber-700 dark:text-amber-200"
                                : "bg-zinc-100 dark:bg-zinc-800"
                        }`}
                      >
                        {i % 4 === 0 ? "X" : i % 4 === 1 ? "O" : i % 4 === 2 ? "Δ" : ""}
                      </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-purple-600/80 dark:text-purple-400/80">Still need 3 in a row to win</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 hover:shadow-md transition-all group">
              <div className="absolute w-20 h-20 -right-5 -top-5 bg-emerald-200/50 dark:bg-emerald-800/30 rounded-full blur-xl group-hover:bg-emerald-300/50 dark:group-hover:bg-emerald-700/30 transition-all"></div>
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100"
                >
                  Challenge
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300">5×5 Grid</CardTitle>
                <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">
                  For expert players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1 max-w-[150px] mx-auto">
                  {Array(25)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-md flex items-center justify-center text-xs font-bold ${
                          i % 5 === 0
                            ? "bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200"
                            : i % 5 === 1
                              ? "bg-rose-200 dark:bg-rose-700 text-rose-700 dark:text-rose-200"
                              : i % 5 === 2
                                ? "bg-amber-200 dark:bg-amber-700 text-amber-700 dark:text-amber-200"
                                : i % 5 === 3
                                  ? "bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200"
                                  : "bg-zinc-100 dark:bg-zinc-800"
                        }`}
                      >
                        {i % 5 === 0 ? "X" : i % 5 === 1 ? "O" : i % 5 === 2 ? "Δ" : i % 5 === 3 ? "□" : ""}
                      </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                    Larger board, same 3-in-a-row goal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Mode Card */}
          <Card className="overflow-hidden border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 hover:shadow-md transition-all group">
            <div className="absolute w-32 h-32 -right-10 -top-10 bg-amber-200/30 dark:bg-amber-800/20 rounded-full blur-xl group-hover:bg-amber-300/30 dark:group-hover:bg-amber-700/20 transition-all"></div>
            <div className="absolute w-24 h-24 right-20 bottom-5 bg-orange-200/20 dark:bg-orange-800/10 rounded-full blur-xl group-hover:bg-orange-300/20 dark:group-hover:bg-orange-700/10 transition-all"></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-amber-700 dark:text-amber-300 flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Tournament Mode
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">New!</Badge>
                  <Badge className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">BETA</Badge>
                </div>
              </div>
              <CardDescription className="text-amber-600/80 dark:text-amber-400/80">
                Create multi-round events and compete for the championship
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 flex flex-col items-center">
                  <div className="text-amber-600 dark:text-amber-400 font-semibold mb-2">Multiple Rounds</div>
                  <p className="text-sm text-center text-amber-700/70 dark:text-amber-300/70">
                    Play up to 9 rounds in a single event
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 flex flex-col items-center">
                  <div className="text-amber-600 dark:text-amber-400 font-semibold mb-2">Score Tracking</div>
                  <p className="text-sm text-center text-amber-700/70 dark:text-amber-300/70">
                    First to reach the winning score takes the trophy
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 flex flex-col items-center">
                  <div className="text-amber-600 dark:text-amber-400 font-semibold mb-2">Team Play</div>
                  <p className="text-sm text-center text-amber-700/70 dark:text-amber-300/70">
                    Support for 2, 3, or 4 players (teams)
                  </p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link href="/create-event">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none">
                    Create Tournament
                    <Trophy className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
