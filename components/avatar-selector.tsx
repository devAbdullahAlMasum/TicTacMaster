"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AvatarSelectorProps {
  selectedAvatar: number
  onSelectAvatar: (avatarId: number) => void
}

const AVATARS = [
  { id: 1, src: "/placeholder.svg?height=40&width=40", alt: "Avatar 1" },
  { id: 2, src: "/placeholder.svg?height=40&width=40", alt: "Avatar 2" },
  { id: 3, src: "/placeholder.svg?height=40&width=40", alt: "Avatar 3" },
  { id: 4, src: "/placeholder.svg?height=40&width=40", alt: "Avatar 4" },
  { id: 5, src: "/placeholder.svg?height=40&width=40", alt: "Avatar 5" },
  { id: 6, src: "/placeholder.svg?height=40&width=40", alt: "Avatar 6" },
]

export function AvatarSelector({ selectedAvatar, onSelectAvatar }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {AVATARS.map((avatar) => (
        <div
          key={avatar.id}
          className={cn(
            "flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all",
            selectedAvatar === avatar.id ? "bg-accent ring-2 ring-primary/30" : "hover:bg-accent/50",
          )}
          onClick={() => onSelectAvatar(avatar.id)}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatar.src || "/placeholder.svg"} alt={avatar.alt} />
            <AvatarFallback>{avatar.id}</AvatarFallback>
          </Avatar>
        </div>
      ))}
    </div>
  )
}
