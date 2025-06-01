"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Grid3X3, Home, Settings, Users, Menu, Trophy, Crown, Bot } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { WhatsNew } from "@/components/whats-new"

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

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      description: "Overview and quick actions",
    },
    {
      name: "Single Player",
      href: "/single-player",
      icon: Bot,
      description: "Play against AI",
      badge: "NEW",
    },
    {
      name: "Create Game",
      href: "/create-room",
      icon: Grid3X3,
      description: "Start a new game",
    },
    {
      name: "Create Tournament",
      href: "/create-event",
      icon: Trophy,
      description: "Host a tournament",
      badge: "BETA",
    },
    {
      name: "Join Game",
      href: "/join-room",
      icon: Users,
      description: "Join an existing game",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      description: "Customize your experience",
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Crown,
      description: "View global rankings",
      badge: "SOON",
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-white/20 backdrop-blur-sm">
      </div>

      {/* User Profile */}
      <div className="p-6">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-blue-400/20 blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-indigo-400/20 blur-xl"></div>
          <div className="relative flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white/20 shadow-lg">
              <AvatarImage src="/avatars/avatar-1.png" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">TM</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white">Welcome!</p>
              <p className="text-sm text-blue-100">Ready to play?</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 pb-6">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative overflow-hidden rounded-xl p-4 transition-all duration-200 block",
                pathname === item.href
                  ? "bg-gradient-to-r from-white/20 to-white/10 text-white shadow-lg"
                  : "text-blue-100 hover:bg-white/10 hover:text-white",
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-blue-200 group-hover:bg-white/20 group-hover:text-white",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge className="text-xs bg-white/20 text-white border-white/20">{item.badge}</Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80 mt-0.5">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer with Theme Toggle and What's New */}
      <div className="p-6 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-100">Theme</span>
          <ThemeToggle />
        </div>
        <div className="w-full">
          <WhatsNew />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-80 md:flex-col fixed h-screen z-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 h-12 w-12 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border-white/20"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 border-none"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white/10 bg-white/80 dark:bg-slate-950/80 px-6 backdrop-blur-md">
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Grid3X3 className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                TicTacMaster
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container py-8 px-6 max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Mobile What's New Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <WhatsNew />
        </div>
      </div>
    </div>
  )
}
