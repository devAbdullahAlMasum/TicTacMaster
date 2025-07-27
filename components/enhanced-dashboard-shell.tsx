"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeSelector } from "@/components/theme-selector"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Grid3X3, Home, Settings, Users, Menu, Trophy, Crown, Bot, UserCheck, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { WhatsNew } from "@/components/whats-new"
import { useSettings } from "@/hooks/use-settings"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { useSoundEffects } from "@/lib/sound-manager"

interface EnhancedDashboardShellProps {
  children: React.ReactNode
}

export function EnhancedDashboardShell({ children }: EnhancedDashboardShellProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { settings } = useSettings()
  const { getStyles, currentTheme } = useThemeSystem()
  const { playClickSound } = useSoundEffects()

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || !currentTheme) {
    return null
  }

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: "Single Player",
      href: "/single-player",
      icon: Bot,
      current: pathname === "/single-player",
    },
    {
      name: "Local Multiplayer",
      href: "/local-multiplayer",
      icon: Users,
      current: pathname === "/local-multiplayer",
    },
    {
      name: "Create Room",
      href: "/create-room",
      icon: UserCheck,
      current: pathname === "/create-room",
    },
    {
      name: "Join Room",
      href: "/join-room",
      icon: Grid3X3,
      current: pathname === "/join-room",
    },
    {
      name: "Tournaments",
      href: "/tournaments",
      icon: Trophy,
      current: pathname === "/tournaments",
    },
    {
      name: "Leaderboard",
      href: "/leaderboard",
      icon: Trophy,
      current: pathname === "/leaderboard",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: pathname === "/settings",
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Profile - Compact */}
      <div className="p-4">
        <div className={cn(
          "relative overflow-hidden rounded-lg backdrop-blur-sm border p-3",
          getStyles("sidebar.accent"),
          getStyles("border.primary")
        )}>
          <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-blue-400/20 blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-indigo-400/20 blur-xl"></div>
          <div className="relative flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/20 shadow-lg">
              <AvatarImage src="/avatars/avatar-1.png" alt="User" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                TM
              </AvatarFallback>
            </Avatar>
            <div>
              <p className={cn("font-semibold text-sm", getStyles("sidebar.text"))}>
                TicTac Master
              </p>
              <p className={cn("text-xs opacity-80", getStyles("sidebar.text"))}>
                Level {settings.playerLevel || 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => {
                playClickSound()
                setIsMobileOpen(false)
              }}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                getStyles("sidebar.text"),
                item.current
                  ? cn(getStyles("sidebar.accent"), "shadow-lg")
                  : cn("hover:bg-white/10", getStyles("sidebar.hover"))
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
              {item.current && (
                <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
                  <Crown className="h-3 w-3" />
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Theme Controls */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <ThemeSelector variant="compact" />
        </div>
      </div>

      {/* Desktop What's New */}
      <div className="hidden md:block p-4">
        <WhatsNew />
      </div>
    </div>
  )

  return (
    <div className={cn("flex min-h-screen", getStyles("background.gradient"))}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex md:w-80 md:flex-col fixed h-screen z-10 shadow-2xl",
        getStyles("sidebar.background")
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg border-white/20 touch-manipulation"
              onClick={playClickSound}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className={cn(
              "w-[85%] max-w-[300px] p-0 border-none",
              getStyles("sidebar.background")
            )}
          >
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full",
                  getStyles("sidebar.accent"),
                  getStyles("sidebar.text"),
                  getStyles("sidebar.hover")
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Mobile Header */}
        <header className={cn(
          "md:hidden sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-6 backdrop-blur-md safe-area-inset-top",
          getStyles("border.primary"),
          "bg-white/80 dark:bg-slate-950/80"
        )}>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Grid3X3 className="h-4 w-4" />
              </div>
              <span className={cn(
                "font-bold text-lg bg-gradient-to-r text-transparent bg-clip-text",
                getStyles("text.accent")
              )}>
                TicTacMaster
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 md:py-8 px-4 md:px-6 max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Mobile What's New Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <WhatsNew />
        </div>

        {/* Version Badge */}
        <div className="version-badge">v2.3</div>
      </div>
    </div>
  )
}
