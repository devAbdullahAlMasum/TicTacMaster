"use client"

import { useEffect } from "react"
import { useSoundEffects } from "@/lib/sound-manager"

export function GlobalSoundProvider({ children }: { children: React.ReactNode }) {
  const { playClickSound } = useSoundEffects()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('button, [role="button"]')) {
        playClickSound && playClickSound()
      }
    }

    document.body.addEventListener("click", handleClick)

    return () => {
      document.body.removeEventListener("click", handleClick)
    }
  }, [playClickSound])

  return <>{children}</>
}
