"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarSelectorProps {
  selectedAvatar: number
  onSelectAvatar: (avatarId: number) => void
}

const AVATARS = [
  { id: 1, src: "/avatars/avatar-1.png", alt: "Avatar 1" },
  { id: 2, src: "/avatars/avatar-2.png", alt: "Avatar 2" },
  { id: 3, src: "/avatars/avatar-3.png", alt: "Avatar 3" },
  { id: 4, src: "/avatars/avatar-4.png", alt: "Avatar 4" },
  { id: 5, src: "/avatars/avatar-5.png", alt: "Avatar 5" },
  { id: 6, src: "/avatars/avatar-6.png", alt: "Avatar 6" },
]

export function AvatarSelector({ selectedAvatar, onSelectAvatar }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AVATARS.map((avatar) => (
        <div
          key={avatar.id}
          className={cn(
            "flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all",
            selectedAvatar === avatar.id
              ? "bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 ring-2 ring-indigo-500/30 dark:ring-indigo-500/50"
              : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
          )}
          onClick={() => onSelectAvatar(avatar.id)}
        >
          <Avatar className="h-12 w-12 border-2 border-white dark:border-zinc-800 shadow-sm">
            <AvatarImage src={avatar.src || "/placeholder.svg"} alt={avatar.alt} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
              {avatar.id}
            </AvatarFallback>
          </Avatar>
        </div>
      ))}
    </div>
  )
}
