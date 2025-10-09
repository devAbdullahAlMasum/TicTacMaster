"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatarId?: number;
  username: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const avatarGradients = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-rose-600",
  "from-yellow-500 to-orange-600",
  "from-indigo-500 to-purple-600",
  "from-teal-500 to-green-600",
  "from-red-500 to-pink-600",
  "from-emerald-500 to-cyan-600",
  "from-violet-500 to-fuchsia-600",
  "from-amber-500 to-yellow-600",
  "from-lime-500 to-green-600",
  "from-sky-500 to-indigo-600",
];

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-16 w-16 text-2xl",
  xl: "h-32 w-32 text-5xl",
};

export function UserAvatar({
  avatarId = 1,
  username,
  className,
  size = "md",
}: UserAvatarProps) {
  const gradientIndex = (avatarId - 1) % avatarGradients.length;
  const gradient = avatarGradients[gradientIndex];
  const initial = username.charAt(0).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback
        className={cn(
          "bg-gradient-to-br text-white font-semibold",
          gradient
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
