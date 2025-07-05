"use client"

import { cn } from "@/lib/utils"

interface SkipNavProps {
  href?: string
  children?: React.ReactNode
  className?: string
}

export function SkipNav({ 
  href = "#main-content", 
  children = "Skip to main content",
  className 
}: SkipNavProps) {
  return (
    <a
      href={href}
      className={cn(
        "absolute top-0 left-0 z-[100] px-4 py-2 text-sm font-medium",
        "text-white bg-blue-600 rounded-br-lg",
        "transform -translate-y-full focus:translate-y-0",
        "transition-transform duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "sr-only focus:not-sr-only",
        className
      )}
    >
      {children}
    </a>
  )
}

export function SkipNavTarget({ 
  id = "main-content", 
  className,
  children 
}: { 
  id?: string
  className?: string
  children?: React.ReactNode 
}) {
  return (
    <div 
      id={id} 
      className={cn("focus:outline-none", className)}
      tabIndex={-1}
    >
      {children}
    </div>
  )
}