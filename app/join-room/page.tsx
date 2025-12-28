"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { PageLoader } from "@/components/page-loader"
import { 
  Search, Users, Globe, Lock, ArrowRight, Home, 
  Crown, Zap, Star, Trophy, Gamepad2, Clock, Eye
} from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Room {
  id: string
  name: string
  description: string
  host: string
  players: number
  maxPlayers: number
  boardSize: string
  isPrivate: boolean
  hasPassword: boolean
  allowSpectators: boolean
  status: "waiting" | "playing" | "finished"
  createdAt: string
}

export default function JoinRoomPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings } = useSettings()
  const { playClickSound, playSuccessSound, playErrorSound } = useSoundEffects()
  const { getStyles, currentTheme } = useThemeSystem()
  
  const [roomCode, setRoomCode] = useState(searchParams?.get("code") || "")
  const [password, setPassword] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [searchResults, setSearchResults] = useState<Room[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Mock rooms data
  const mockRooms: Room[] = [
    {
      id: "ABC123",
      name: "Epic Battle Arena",
      description: "Join for intense 3x3 battles!",
      host: "GameMaster",
      players: 1,
      maxPlayers: 2,
      boardSize: "3",
      isPrivate: false,
      hasPassword: false,
      allowSpectators: true,
      status: "waiting",
      createdAt: "2 min ago"
    },
    {
      id: "XYZ789",
      name: "Pro Tournament",
      description: "5x5 challenge for experts only",
      host: "ProPlayer",
      players: 3,
      maxPlayers: 4,
      boardSize: "5",
      isPrivate: true,
      hasPassword: true,
      allowSpectators: false,
      status: "waiting",
      createdAt: "5 min ago"
    },
    {
      id: "DEF456",
      name: "Casual Fun",
      description: "Relaxed 4x4 games welcome!",
      host: "FriendlyGamer",
      players: 2,
      maxPlayers: 2,
      boardSize: "4",
      isPrivate: false,
      hasPassword: false,
      allowSpectators: true,
      status: "playing",
      createdAt: "1 min ago"
    }
  ]

  useEffect(() => {
    // Load available rooms
    const loadRooms = async () => {
      try {
        const { getPublicRooms } = await import("@/lib/room-manager")
        const rooms = getPublicRooms()

        // Convert to expected format
        const convertedRooms = rooms.map(room => ({
          id: room.id,
          name: room.name,
          description: room.description,
          host: room.hostName,
          players: room.players.length,
          maxPlayers: room.maxPlayers,
          boardSize: room.boardSize.toString(),
          isPrivate: room.isPrivate,
          hasPassword: !!room.password,
          allowSpectators: room.allowSpectators,
          status: room.status as "waiting" | "playing" | "finished",
          createdAt: new Date(room.createdAt).toLocaleString()
        }))

        setSearchResults(convertedRooms)
      } catch (error) {
        // Fallback to mock data if room manager fails
        setSearchResults(mockRooms.filter(room => room.status === "waiting"))
      }
    }

    loadRooms()
  }, [])

  // Join room by code
  const joinRoomByCode = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a valid room code")
      return
    }

    const playerName = settings.defaultPlayerName || "Player"
    if (!playerName.trim()) {
      toast.error("Please set your name in settings first")
      return
    }

    playClickSound()
    setIsJoining(true)

    try {
      const { getRoom, joinRoom } = await import("@/lib/room-manager")

      // Check if room exists
      const room = getRoom(roomCode.toUpperCase())
      if (!room) {
        toast.error("Room not found")
        setIsJoining(false)
        return
      }

      // Generate player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Join the room
      const result = joinRoom(playerId, playerName, roomCode.toUpperCase(), password)

      if (result.success) {
        // Store player info
        localStorage.setItem("tictac_player_id", playerId)
        localStorage.setItem("tictac_player_name", playerName)

        playSuccessSound()
        toast.success(`Joined room ${roomCode.toUpperCase()}!`)

        router.push(`/room/${roomCode.toUpperCase()}`)
      } else {
        toast.error(result.error || "Failed to join room")
      }
    } catch (error) {
      console.error("Failed to join room:", error)
      toast.error("Failed to join room")
    } finally {
      setIsJoining(false)
    }
  }

  // Join specific room
  const joinRoom = async (room: Room) => {
    playClickSound()
    
    if (room.hasPassword && !password) {
      toast({
        title: "Password required",
        description: "This room requires a password.",
        variant: "destructive"
      })
      return
    }

    try {
      playSuccessSound()
      router.push(`/room/${room.id}`)
    } catch (error) {
      playErrorSound()
      toast({
        title: "Failed to join room",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  // Search rooms
  const searchRooms = async () => {
    setIsSearching(true)
    playClickSound()
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSearchResults(mockRooms.filter(room => 
        room.status === "waiting" && 
        (roomCode ? room.id.toLowerCase().includes(roomCode.toLowerCase()) : true)
      ))
    } finally {
      setIsSearching(false)
    }
  }

  const getStatusBadge = (status: Room["status"]) => {
    switch (status) {
      case "waiting":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Waiting</Badge>
      case "playing":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Playing</Badge>
      case "finished":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Finished</Badge>
    }
  }

  return (
    <PageLoader>
      <EnhancedDashboardShell>
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg",
                getStyles("sidebar.background")
              )}>
                <Search className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">Join Game Room</span>
              </div>
              <p className={cn("text-lg", getStyles("text.secondary"))}>
                Enter a room code or browse available games to join!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Join by Code */}
              <div className="lg:col-span-1 space-y-6">
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader>
                    <EnhancedCardTitle className="flex items-center gap-2">
                      <Gamepad2 className={cn("h-5 w-5", getStyles("text.accent"))} />
                      Quick Join
                    </EnhancedCardTitle>
                    <EnhancedCardDescription>Enter a room code to join directly</EnhancedCardDescription>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Room Code</Label>
                      <Input
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className={cn(
                          "text-center text-lg font-mono tracking-wider",
                          getStyles("input.base"), getStyles("input.focus")
                        )}
                      />
                    </div>

                    <EnhancedButton
                      onClick={joinRoomByCode}
                      loading={isJoining}
                      className={cn(
                        "w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                        getStyles("animations.transition")
                      )}
                      icon={<ArrowRight className="h-5 w-5" />}
                      iconPosition="right"
                    >
                      {isJoining ? "Joining..." : "Join Room"}
                    </EnhancedButton>
                  </EnhancedCardContent>
                </EnhancedCard>

                {/* Quick Stats */}
                <EnhancedCard className={getStyles("card.base")}>
                  <EnhancedCardContent className="p-4">
                    <div className="text-center space-y-2">
                      <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                        {searchResults.length}
                      </div>
                      <div className={cn("text-sm", getStyles("text.secondary"))}>
                        Available Rooms
                      </div>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </div>

              {/* Available Rooms */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={cn("text-xl font-bold", getStyles("text.primary"))}>
                    Available Rooms
                  </h2>
                  <EnhancedButton
                    onClick={searchRooms}
                    loading={isSearching}
                    variant="outline"
                    size="sm"
                    icon={<Search className="h-4 w-4" />}
                  >
                    Refresh
                  </EnhancedButton>
                </div>

                <div className="space-y-4">
                  {searchResults.map((room) => (
                    <EnhancedCard 
                      key={room.id} 
                      variant="elevated" 
                      interactive
                      className={cn(getStyles("card.base"), getStyles("card.hover"))}
                    >
                      <EnhancedCardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className={cn("font-bold text-lg", getStyles("text.primary"))}>
                                {room.name}
                              </h3>
                              {getStatusBadge(room.status)}
                              {room.isPrivate && <Lock className={cn("h-4 w-4", getStyles("text.secondary"))} />}
                            </div>
                            
                            <p className={cn("text-sm", getStyles("text.secondary"))}>
                              {room.description}
                            </p>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1">
                                <Crown className={cn("h-4 w-4", getStyles("text.accent"))} />
                                <span className={getStyles("text.secondary")}>Host: {room.host}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Users className={cn("h-4 w-4", getStyles("text.accent"))} />
                                <span className={getStyles("text.secondary")}>
                                  {room.players}/{room.maxPlayers} players
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Trophy className={cn("h-4 w-4", getStyles("text.accent"))} />
                                <span className={getStyles("text.secondary")}>
                                  {room.boardSize}×{room.boardSize}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Clock className={cn("h-4 w-4", getStyles("text.accent"))} />
                                <span className={getStyles("text.secondary")}>{room.createdAt}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {room.allowSpectators && (
                              <EnhancedButton
                                variant="outline"
                                size="sm"
                                icon={<Eye className="h-4 w-4" />}
                                onClick={() => router.push(`/room/${room.id}?spectate=true`)}
                              >
                                Watch
                              </EnhancedButton>
                            )}
                            
                            <EnhancedButton
                              onClick={() => joinRoom(room)}
                              disabled={room.players >= room.maxPlayers}
                              className={cn(
                                "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
                                getStyles("animations.transition")
                              )}
                              icon={<ArrowRight className="h-4 w-4" />}
                            >
                              {room.players >= room.maxPlayers ? "Full" : "Join"}
                            </EnhancedButton>
                          </div>
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  ))}
                  
                  {searchResults.length === 0 && (
                    <div className="text-center py-12">
                      <div className={cn("text-6xl mb-4", getStyles("text.secondary"))}>🎮</div>
                      <h3 className={cn("text-lg font-semibold mb-2", getStyles("text.primary"))}>
                        No rooms available
                      </h3>
                      <p className={cn("text-sm", getStyles("text.secondary"))}>
                        Be the first to create a room and start playing!
                      </p>
                      <EnhancedButton
                        onClick={() => router.push("/create-room")}
                        className="mt-4"
                        icon={<Crown className="h-4 w-4" />}
                      >
                        Create Room
                      </EnhancedButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </EnhancedDashboardShell>
    </PageLoader>
  )
}
