"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Send, MessageSquare } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

interface Message {
  id: string
  sender: string
  avatarId: number
  content: string
  timestamp: Date
  isSystem?: boolean
}

interface ChatBoxProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  className?: string
  playerName: string
  playerAvatarId: number
  disabled?: boolean
}

export function ChatBox({
  messages,
  onSendMessage,
  className,
  playerName,
  playerAvatarId,
  disabled = false,
}: ChatBoxProps) {
  const [message, setMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { settings } = useSettings()

  // Filter inappropriate words if enabled
  const filterMessage = (content: string) => {
    if (!settings?.chatFilter) return content

    // Simple filter for demonstration
    const inappropriateWords = ["damn", "hell", "crap", "stupid", "idiot"]
    let filtered = content

    inappropriateWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      filtered = filtered.replace(regex, "*".repeat(word.length))
    })

    return filtered
  }

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      const filteredMessage = filterMessage(message)
      onSendMessage(filteredMessage)
      setMessage("")

      // Focus input after sending
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <Card
      className={cn(
        "flex flex-col h-full border-0 shadow-lg",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
          Game Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-3 md:p-4 custom-scrollbar">
          <div className="space-y-3 md:space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full py-8">
                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2 md:gap-3 animate-fadeIn", msg.isSystem && "opacity-70")}>
                  {!msg.isSystem && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={`/avatars/avatar-${msg.avatarId}.png`} alt={msg.sender} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                        {msg.sender.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("flex-1 space-y-1", msg.isSystem && "pl-2")}>
                    {!msg.isSystem && (
                      <div className="flex items-center gap-2">
                        <p className={cn("font-medium", settings.largeText ? "text-sm" : "text-xs")}>{msg.sender}</p>
                        <span className={cn("text-muted-foreground", settings.largeText ? "text-xs" : "text-[10px]")}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2",
                        msg.isSystem
                          ? "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 italic"
                          : "bg-blue-50 dark:bg-blue-900/20 text-slate-800 dark:text-slate-200",
                        settings.largeText ? "text-sm" : "text-xs",
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-800 gap-2">
        <Input
          ref={inputRef}
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn("flex-1 h-9 md:h-10 bg-white dark:bg-slate-800", settings.largeText && "text-base")}
        />
        <Button
          size="sm"
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled}
          className="h-9 md:h-10 px-3 md:px-4 touch-manipulation"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
