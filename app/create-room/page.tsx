"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { PageLoader } from "@/components/page-loader"
import { 
  Plus, Users, Globe, Lock, Settings, Copy, Share2, 
  ArrowRight, Home, Crown, Zap, Star, Trophy, Gamepad2 
} from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface RoomSettings {
  roomName: string
  description: string
  hostName: string
  maxPlayers: string
  boardSize: string
  isPrivate: boolean
  allowSpectators: boolean
  timeLimit: string
  password: string
}

export default function CreateRoomPage() {
  const router = useRouter()
  const { settings } = useSettings()
  const { playClickSound, playSuccessSound } = useSoundEffects()
  const { getStyles, currentTheme } = useThemeSystem()
  
  const [roomSettings, setRoomSettings] = useState<RoomSettings>({
    roomName: `${settings.defaultPlayerName || "Player"}'s Room`,
    description: "Join me for an epic Tic Tac Toe battle!",
    hostName: settings.defaultPlayerName || "Player",
    maxPlayers: "2",
    boardSize: "3",
    isPrivate: false,
    allowSpectators: true,
    timeLimit: "60",
    password: ""
  })
  
  const [isCreating, setIsCreating] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [roomCreated, setRoomCreated] = useState(false)

  // Generate random room code
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Create room
  const createRoom = async () => {
    if (!roomSettings.hostName.trim()) {
      toast.error("Please enter your name")
      return
    }

    if (!roomSettings.roomName.trim()) {
      toast.error("Please enter a room name")
      return
    }

    if (roomSettings.isPrivate && !roomSettings.password.trim()) {
      toast.error("Please set a password for private room")
      return
    }

    playClickSound()
    setIsCreating(true)

    try {
      // Import room manager
      const { createRoom: createGameRoom } = await import("@/lib/room-manager")

      const hostId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const room = createGameRoom(hostId, roomSettings.hostName, {
        name: roomSettings.roomName,
        description: roomSettings.description,
        maxPlayers: parseInt(roomSettings.maxPlayers),
        boardSize: parseInt(roomSettings.boardSize),
        isPrivate: roomSettings.isPrivate,
        password: roomSettings.password,
        allowSpectators: roomSettings.allowSpectators,
        timeLimit: parseInt(roomSettings.timeLimit)
      })

      setRoomCode(room.id)
      setRoomCreated(true)
      playSuccessSound()

      // Store host info in localStorage
      localStorage.setItem("tictac_host_id", hostId)
      localStorage.setItem("tictac_player_name", roomSettings.hostName)

      toast.success(`Room created successfully! Code: ${room.id}`)
    } catch (error) {
      console.error("Failed to create room:", error)
      toast.error("Failed to create room. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  // Copy room code
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    playClickSound()
    toast({
      title: "Room code copied!",
      description: "Share it with your friends to join the game.",
    })
  }

  // Share room
  const shareRoom = () => {
    playClickSound()
    if (navigator.share) {
      navigator.share({
        title: "Join my TicTacMaster game!",
        text: `Join my game room: ${roomCode}`,
        url: `${window.location.origin}/join-room?code=${roomCode}`
      })
    } else {
      copyRoomCode()
    }
  }

  // Join created room
  const joinRoom = () => {
    playClickSound()
    router.push(`/room/${roomCode}`)
  }

  return (
    <PageLoader>
      <EnhancedDashboardShell>
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg",
                getStyles("sidebar.background")
              )}>
                <Plus className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">Create Game Room</span>
              </div>
              <p className={cn("text-lg", getStyles("text.secondary"))}>
                Set up your own multiplayer room and invite friends to play!
              </p>
            </div>

            {!roomCreated ? (
              // Room Creation Form
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                  <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                    <EnhancedCardHeader>
                      <EnhancedCardTitle className="flex items-center gap-2">
                        <Settings className={cn("h-5 w-5", getStyles("text.accent"))} />
                        Room Settings
                      </EnhancedCardTitle>
                      <EnhancedCardDescription>Configure your game room</EnhancedCardDescription>
                    </EnhancedCardHeader>
                    
                    <EnhancedCardContent className="space-y-6">
                      {/* Host Name */}
                      <div className="space-y-2">
                        <Label>Your Name (Host)</Label>
                        <Input
                          value={roomSettings.hostName}
                          onChange={(e) => setRoomSettings(prev => ({ ...prev, hostName: e.target.value }))}
                          placeholder="Enter your name"
                          className={cn(getStyles("input.base"), getStyles("input.focus"))}
                        />
                      </div>

                      {/* Room Name */}
                      <div className="space-y-2">
                        <Label>Room Name</Label>
                        <Input
                          value={roomSettings.roomName}
                          onChange={(e) => setRoomSettings(prev => ({ ...prev, roomName: e.target.value }))}
                          placeholder="Enter room name"
                          className={cn(getStyles("input.base"), getStyles("input.focus"))}
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          value={roomSettings.description}
                          onChange={(e) => setRoomSettings(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your room..."
                          className={cn(getStyles("input.base"), getStyles("input.focus"))}
                          rows={3}
                        />
                      </div>

                      {/* Game Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Max Players</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {["2", "4"].map((count) => (
                              <EnhancedButton
                                key={count}
                                variant={roomSettings.maxPlayers === count ? "default" : "outline"}
                                onClick={() => setRoomSettings(prev => ({ ...prev, maxPlayers: count }))}
                                className="h-10"
                              >
                                {count} Players
                              </EnhancedButton>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Board Size</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {["3", "4", "5"].map((size) => (
                              <EnhancedButton
                                key={size}
                                variant={roomSettings.boardSize === size ? "default" : "outline"}
                                onClick={() => setRoomSettings(prev => ({ ...prev, boardSize: size }))}
                                className="h-10"
                              >
                                {size}×{size}
                              </EnhancedButton>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Private Room</Label>
                            <p className="text-sm text-muted-foreground">Require password to join</p>
                          </div>
                          <Switch
                            checked={roomSettings.isPrivate}
                            onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, isPrivate: checked }))}
                          />
                        </div>

                        {roomSettings.isPrivate && (
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                              type="password"
                              value={roomSettings.password}
                              onChange={(e) => setRoomSettings(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="Enter room password"
                              className={cn(getStyles("input.base"), getStyles("input.focus"))}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label>Allow Spectators</Label>
                            <p className="text-sm text-muted-foreground">Let others watch the game</p>
                          </div>
                          <Switch
                            checked={roomSettings.allowSpectators}
                            onCheckedChange={(checked) => setRoomSettings(prev => ({ ...prev, allowSpectators: checked }))}
                          />
                        </div>
                      </div>
                    </EnhancedCardContent>
                  </EnhancedCard>
                </div>

                {/* Preview & Actions */}
                <div className="space-y-6">
                  {/* Room Preview */}
                  <EnhancedCard className={getStyles("card.base")}>
                    <EnhancedCardHeader>
                      <EnhancedCardTitle className="text-lg">Room Preview</EnhancedCardTitle>
                    </EnhancedCardHeader>
                    <EnhancedCardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className={cn("h-4 w-4", getStyles("text.accent"))} />
                          <span className={cn("font-medium", getStyles("text.primary"))}>
                            {roomSettings.roomName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className={cn("h-4 w-4", getStyles("text.secondary"))} />
                          <span className={cn("text-sm", getStyles("text.secondary"))}>
                            {roomSettings.maxPlayers} players max
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Trophy className={cn("h-4 w-4", getStyles("text.secondary"))} />
                          <span className={cn("text-sm", getStyles("text.secondary"))}>
                            {roomSettings.boardSize}×{roomSettings.boardSize} board
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {roomSettings.isPrivate ? (
                            <Lock className={cn("h-4 w-4", getStyles("text.secondary"))} />
                          ) : (
                            <Globe className={cn("h-4 w-4", getStyles("text.secondary"))} />
                          )}
                          <span className={cn("text-sm", getStyles("text.secondary"))}>
                            {roomSettings.isPrivate ? "Private" : "Public"} room
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className={cn("text-sm", getStyles("text.secondary"))}>
                          {roomSettings.description}
                        </p>
                      </div>
                    </EnhancedCardContent>
                  </EnhancedCard>

                  {/* Create Button */}
                  <EnhancedButton
                    onClick={createRoom}
                    loading={isCreating}
                    className={cn(
                      "w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                      getStyles("animations.transition")
                    )}
                    icon={<Plus className="h-5 w-5" />}
                  >
                    {isCreating ? "Creating Room..." : "Create Room"}
                  </EnhancedButton>
                </div>
              </div>
            ) : (
              // Room Created Success
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                  <div className={cn(
                    "inline-flex items-center gap-3 px-6 py-3 rounded-full",
                    "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  )}>
                    <Crown className="h-6 w-6" />
                    <span className="font-bold text-lg">Room Created Successfully!</span>
                  </div>
                </div>

                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader className="text-center">
                    <EnhancedCardTitle>Your Room is Ready</EnhancedCardTitle>
                    <EnhancedCardDescription>Share the room code with your friends</EnhancedCardDescription>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-6">
                    {/* Room Code */}
                    <div className="text-center space-y-3">
                      <Label>Room Code</Label>
                      <div className={cn(
                        "text-4xl font-bold tracking-wider py-4 px-6 rounded-lg border-2 border-dashed",
                        getStyles("border.accent"), getStyles("text.accent")
                      )}>
                        {roomCode}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EnhancedButton
                        onClick={copyRoomCode}
                        variant="outline"
                        icon={<Copy className="h-4 w-4" />}
                      >
                        Copy Code
                      </EnhancedButton>
                      
                      <EnhancedButton
                        onClick={shareRoom}
                        variant="outline"
                        icon={<Share2 className="h-4 w-4" />}
                      >
                        Share Room
                      </EnhancedButton>
                    </div>

                    <EnhancedButton
                      onClick={joinRoom}
                      className={cn(
                        "w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                        getStyles("animations.transition")
                      )}
                      icon={<ArrowRight className="h-5 w-5" />}
                      iconPosition="right"
                    >
                      Join Your Room
                    </EnhancedButton>
                  </EnhancedCardContent>
                </EnhancedCard>
              </div>
            )}
          </div>
        </div>
      </EnhancedDashboardShell>
    </PageLoader>
  )
}
