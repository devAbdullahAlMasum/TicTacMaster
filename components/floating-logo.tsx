"use client"

import Link from "next/link"
import { Grid3X3 } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function FloatingLogo() {
  const pathname = usePathname()

  // Don't show on home page
  if (pathname === "/") {
    return null
  }

  return (
    <Link
      href="/"
      className={cn(
        "fixed top-4 right-4 z-[100] flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group touch-manipulation",
        "md:px-4 md:py-2",
        // Hide on game pages where it might interfere with gameplay
        pathname.startsWith("/game/") && "hidden md:flex",
      )}
    >
      <div className="flex items-center justify-center h-6 w-6 md:h-8 md:w-8 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
        <Grid3X3 className="h-3 w-3 md:h-4 md:w-4" />
      </div>
      <span className="font-bold text-xs md:text-sm">TicTacMaster</span>
    </Link>
  )
}
