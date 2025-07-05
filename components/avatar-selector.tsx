"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

interface AvatarSelectorProps {
  selectedAvatar: number
  onSelectAvatar: (id: number) => void
}

export function AvatarSelector({ selectedAvatar, onSelectAvatar }: AvatarSelectorProps) {
  const [hoveredAvatar, setHoveredAvatar] = useState<number | null>(null)
  const { settings } = useSettings()

  const avatars = [1, 2, 3, 4, 5, 6]

  return (
    <div className="flex flex-wrap gap-3 md:gap-4">
      {avatars.map((id) => (
        <button
          key={id}
          type="button"
          className={cn(
            "relative group rounded-full overflow-hidden transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "hover:scale-110",
            selectedAvatar === id && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950",
            settings.highContrastMode && "ring-offset-4",
          )}
          onClick={() => onSelectAvatar(id)}
          onMouseEnter={() => setHoveredAvatar(id)}
          onMouseLeave={() => setHoveredAvatar(null)}
        >
          <Avatar className="h-12 w-12 md:h-16 md:w-16 border-2 border-white/50 dark:border-slate-800/50">
            <AvatarImage src={`/avatars/avatar-${id}.png`} alt={`Avatar ${id}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{id}</AvatarFallback>
          </Avatar>

          {/* Selection indicator */}
          {selectedAvatar === id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 animate-fadeIn">
              <div className="bg-blue-500 rounded-full p-1">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
          )}

          {/* Hover effect */}
          {hoveredAvatar === id && selectedAvatar !== id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 animate-fadeIn">
              <div className="bg-white/80 dark:bg-slate-800/80 rounded-full p-1">
                <Check className="h-3 w-3 text-blue-500" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
