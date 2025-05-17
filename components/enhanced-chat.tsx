"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, AlertTriangle, Smile, Filter } from "lucide-react"
import type { ChatMessage } from "@/lib/game-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface EnhancedChatProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  playerName: string
  disabled?: boolean
  filterEnabled?: boolean
  onToggleFilter?: (enabled: boolean) => void
}

export function EnhancedChat({
  messages,
  onSendMessage,
  playerName,
  disabled = false,
  filterEnabled = true,
  onToggleFilter,
}: EnhancedChatProps) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [showFilteredMessages, setShowFilteredMessages] = useState(true)

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

  // Filter messages based on active tab
  const filteredMessages = messages.filter((msg) => {
    if (!showFilteredMessages && msg.filtered) return false
    if (activeTab === "all") return true
    if (activeTab === "you") return msg.sender === playerName
    if (activeTab === "others") return msg.sender !== playerName
    return true
  })

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="h-full flex flex-col border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-950 dark:to-blue-900">
      <CardHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Smile className="mr-2 h-5 w-5 text-primary" />
            Chat
          </CardTitle>
          {onToggleFilter && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={filterEnabled ? "default" : "outline"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => onToggleFilter(!filterEnabled)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{filterEnabled ? "Disable" : "Enable"} chat filter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="you">You</TabsTrigger>
              <TabsTrigger value="others">Others</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filterEnabled && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Show filtered messages</span>
            <ToggleGroup
              type="single"
              value={showFilteredMessages ? "yes" : "no"}
              onValueChange={(val) => setShowFilteredMessages(val === "yes")}
            >
              <ToggleGroupItem value="yes" size="sm" className="h-6 px-2">
                Yes
              </ToggleGroupItem>
              <ToggleGroupItem value="no" size="sm" className="h-6 px-2">
                No
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </CardHeader>

      <ScrollArea className="flex-1 p-4 bg-zinc-100 dark:bg-zinc-900" ref={scrollAreaRef}>
        {filteredMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id || `${msg.timestamp}-${msg.sender}`}
                className={`flex gap-3 max-w-full ${msg.sender === playerName ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={msg.sender} />
                  <AvatarFallback>{msg.sender.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div
                  className={`relative group max-w-[75%] ${msg.sender === playerName ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`rounded-lg p-3 ${
                      msg.sender === playerName
                        ? "bg-primary/20 text-foreground rounded-tr-none"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-tl-none"
                    } ${msg.filtered ? "border border-yellow-500/30" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.sender}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>

                  {msg.filtered && (
                    <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full p-1">
                              <AlertTriangle className="h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This message was filtered</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        {disabled ? (
          <div className="bg-zinc-200/50 dark:bg-zinc-800/50 rounded-md p-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Chat is currently unavailable
          </div>
        ) : (
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || isSending}
              className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
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
        )}
      </div>
    </Card>
  )
}
