"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import type { ChatMessage } from "@/lib/game-store"

interface ChatBoxProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  playerName: string
  disabled?: boolean
}

export function ChatBox({ messages, onSendMessage, playerName, disabled = false }: ChatBoxProps) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim() && !isSending) {
      setIsSending(true)
      onSendMessage(message)
      setMessage("")

      // Prevent multiple rapid sends
      setTimeout(() => {
        setIsSending(false)
      }, 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-md h-full flex flex-col border border-border/40">
      <div className="p-4 border-b border-border/40">
        <h3 className="font-medium">Chat</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4 h-[400px]" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id || `${msg.timestamp}-${msg.sender}`}
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === playerName
                    ? "ml-auto bg-primary/20 text-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                <p className="text-xs font-medium mb-1">{msg.sender}</p>
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-border/40">
        <div className="flex space-x-2">
          <Input
            placeholder={disabled ? "Waiting for opponent..." : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            className="bg-background"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={disabled || !message.trim() || isSending}
            className="transition-all hover:bg-primary/90 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
