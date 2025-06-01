"use client"

import Link from "next/link"
import { Grid3X3 } from "lucide-react"

export function FloatingLogo() {
  return (
    <Link
      href="/"
      className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
    >
      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
        <Grid3X3 className="h-4 w-4" />
      </div>
      <span className="font-bold text-sm">TicTacMaster</span>
    </Link>
  )
}
