"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Grid3X3, Home, LogOut, Settings, Users, Menu, X, Trophy, Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-indigo-50 via-blue-50 to-sky-50 dark:from-indigo-950 dark:via-blue-950 dark:to-sky-950 fixed h-screen z-10">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
              <Grid3X3 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400 text-transparent bg-clip-text">
              TicTacMaster
            </span>
          </div>

          <div className="p-3">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-3 mb-3">
              <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-blue-500/20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 h-12 w-12 rounded-full bg-indigo-500/20 blur-xl"></div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                  <AvatarImage src="/avatars/avatar-1.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                    TM
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Welcome</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Player</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-3 py-2">MAIN MENU</div>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                pathname === "/"
                  ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/create-room"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                pathname === "/create-room"
                  ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
              <Grid3X3 className="h-4 w-4" />
              <span>Create Game</span>
            </Link>

            <Link
              href="/create-event"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                pathname === "/create-event"
                  ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
              <Trophy className="h-4 w-4" />
              <span>Create Tournament</span>
              <Badge className="ml-auto text-[10px] py-0 h-4 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30">
                BETA
              </Badge>
            </Link>

            <Link
              href="/join-room"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                pathname === "/join-room"
                  ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
              <Users className="h-4 w-4" />
              <span>Join Game</span>
            </Link>

            <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-3 py-2 mt-4">ACCOUNT</div>

            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                pathname === "/settings"
                  ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            <Link
              href="/leaderboard"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                pathname === "/leaderboard"
                  ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
              <Crown className="h-4 w-4" />
              <span>Leaderboard</span>
              <Badge className="ml-auto text-[10px] py-0 h-4 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30">
                NEW
              </Badge>
            </Link>
          </nav>

          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-100/50 to-blue-100/50 dark:from-indigo-900/50 dark:to-blue-900/50 w-full">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" className="text-zinc-600 dark:text-zinc-400">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 bg-gradient-to-b from-indigo-50 via-blue-50 to-sky-50 dark:from-indigo-950 dark:via-blue-950 dark:to-sky-950"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                    <Grid3X3 className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400 text-transparent bg-clip-text">
                    TicTacMaster
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-3">
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-3 mb-3">
                  <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-blue-500/20 blur-xl"></div>
                  <div className="absolute -bottom-6 -left-6 h-12 w-12 rounded-full bg-indigo-500/20 blur-xl"></div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                      <AvatarImage src="/avatars/avatar-1.png" alt="User" />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                        TM
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Welcome</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Player</p>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-3 space-y-1">
                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-3 py-2">MAIN MENU</div>
                <Link
                  href="/"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                    pathname === "/"
                      ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/create-room"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                    pathname === "/create-room"
                      ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
                  <Grid3X3 className="h-4 w-4" />
                  <span>Create Game</span>
                </Link>

                <Link
                  href="/create-event"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                    pathname === "/create-event"
                      ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
                  <Trophy className="h-4 w-4" />
                  <span>Create Tournament</span>
                  <Badge className="ml-auto text-[10px] py-0 h-4 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30">
                    BETA
                  </Badge>
                </Link>

                <Link
                  href="/join-room"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                    pathname === "/join-room"
                      ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
                  <Users className="h-4 w-4" />
                  <span>Join Game</span>
                </Link>

                <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-3 py-2 mt-4">ACCOUNT</div>

                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                    pathname === "/settings"
                      ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>

                <Link
                  href="/leaderboard"
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors relative overflow-hidden group",
                    pathname === "/leaderboard"
                      ? "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-300",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/5 group-hover:to-blue-500/10 transition-colors"></div>
                  <Crown className="h-4 w-4" />
                  <span>Leaderboard</span>
                  <Badge className="ml-auto text-[10px] py-0 h-4 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30">
                    NEW
                  </Badge>
                </Link>
              </nav>

              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-indigo-100/50 to-blue-100/50 dark:from-indigo-900/50 dark:to-blue-900/50">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" className="text-zinc-600 dark:text-zinc-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1 flex flex-col md:ml-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-950/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
          <div className="md:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
          <div className="flex-1 flex items-center">
            <div className="md:hidden flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                <Grid3X3 className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400 text-transparent bg-clip-text">
                TicTacMaster
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>
        <main className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
