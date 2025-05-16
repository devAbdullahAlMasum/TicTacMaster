import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Grid3X3, Users, Settings } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Tic-Tac-Toe Dashboard</h1>
          <p className="text-muted-foreground">
            Create or join multiplayer games with customizable board sizes and player counts.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Grid3X3 className="mr-2 h-5 w-5 text-primary" />
                Create Game Room
              </CardTitle>
              <CardDescription>Start a new customizable game</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Create a new game room with custom board size, player count, and chat settings.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/create-room" className="w-full">
                <Button className="w-full group">
                  Create Game
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Join Game Room
              </CardTitle>
              <CardDescription>Join an existing game</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Enter a room code to join a friend's game and start playing immediately.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/join-room" className="w-full">
                <Button variant="outline" className="w-full group">
                  Join Game
                  <Users className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Game Settings
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                Adjust your game preferences, chat filters, and notification settings.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/settings" className="w-full">
                <Button variant="outline" className="w-full group">
                  Settings
                  <Settings className="ml-2 h-4 w-4 transition-transform group-hover:rotate-45" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Game Modes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Game Modes</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Classic 3×3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                  {Array(9)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-accent rounded-sm flex items-center justify-center text-lg font-bold"
                      >
                        {i % 3 === 0 ? "X" : i % 3 === 1 ? "O" : ""}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Extended 4×4</CardTitle>
                <CardDescription className="text-xs">More strategic gameplay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-1 max-w-[120px] mx-auto">
                  {Array(16)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-accent rounded-sm flex items-center justify-center text-sm font-bold"
                      >
                        {i % 4 === 0 ? "X" : i % 4 === 1 ? "O" : ""}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">Challenge 5×5</CardTitle>
                <CardDescription className="text-xs">For expert players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1 max-w-[120px] mx-auto">
                  {Array(25)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-accent rounded-sm flex items-center justify-center text-xs font-bold"
                      >
                        {i % 5 === 0 ? "X" : i % 5 === 1 ? "O" : i % 5 === 2 ? "Δ" : ""}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[
                  { event: "Game Completed", details: "Classic 3×3 - Victory", time: "10 minutes ago" },
                  { event: "New Feature", details: "3-Player Mode (Beta) is now available", time: "1 hour ago" },
                  { event: "Game Joined", details: "Extended 4×4 with Player2", time: "3 hours ago" },
                  { event: "Chat Filter", details: "Chat filtering has been enabled by default", time: "1 day ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{activity.event}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
