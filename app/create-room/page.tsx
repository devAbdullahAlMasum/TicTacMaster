"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { generateRoomCode } from "@/lib/utils"
import { Loader2, Grid3X3, Users } from "lucide-react"
import { resetGameState } from "@/lib/game-store"
import { DashboardShell } from "@/components/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

export default function CreateRoomPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  // Game settings
  const [boardSize, setBoardSize] = useState("3x3")
  const [playerCount, setPlayerCount] = useState("2")
  const [chatEnabled, setChatEnabled] = useState(true)
  const [chatFilterEnabled, setChatFilterEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return

    setIsCreating(true)

    // Generate a unique room code
    const roomCode = generateRoomCode()

    // Reset any existing game state for this room
    resetGameState(roomCode)

    // Redirect to the game room with all settings
    setTimeout(() => {
      const queryParams = new URLSearchParams({
        name: playerName,
        avatar: selectedAvatar.toString(),
        host: "true",
        boardSize,
        playerCount,
        chatEnabled: chatEnabled.toString(),
        chatFilter: chatFilterEnabled.toString(),
      })

      router.push(`/game/${roomCode}?${queryParams.toString()}`)
    }, 1000)
  }

  return (
    <DashboardShell>
      <div className="flex flex-col items-center max-w-3xl mx-auto">
        <Card className="w-full border border-border/40">
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Game</CardTitle>
            <CardDescription>Set up your profile and game settings</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Player Profile</TabsTrigger>
                <TabsTrigger value="settings">Game Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Your Name</Label>
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select an Avatar</Label>
                  <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("settings")} className="mt-4">
                    Next: Game Settings
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Board Size</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select the size of the game board</p>

                    <RadioGroup value={boardSize} onValueChange={setBoardSize} className="grid grid-cols-3 gap-4">
                      <Label
                        htmlFor="3x3"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                          boardSize === "3x3" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="3x3" id="3x3" className="sr-only" />
                        <Grid3X3 className="mb-3 h-6 w-6" />
                        <span className="block text-center">3×3</span>
                      </Label>

                      <Label
                        htmlFor="4x4"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                          boardSize === "4x4" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="4x4" id="4x4" className="sr-only" />
                        <Grid3X3 className="mb-3 h-6 w-6" />
                        <span className="block text-center">4×4</span>
                      </Label>

                      <Label
                        htmlFor="5x5"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                          boardSize === "5x5" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="5x5" id="5x5" className="sr-only" />
                        <Grid3X3 className="mb-3 h-6 w-6" />
                        <span className="block text-center">5×5</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <Label className="text-base">Player Count</Label>
                    <p className="text-sm text-muted-foreground mb-3">Select the number of players</p>

                    <RadioGroup value={playerCount} onValueChange={setPlayerCount} className="grid grid-cols-2 gap-4">
                      <Label
                        htmlFor="2-players"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                          playerCount === "2" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="2" id="2-players" className="sr-only" />
                        <Users className="mb-3 h-6 w-6" />
                        <span className="block text-center">2 Players</span>
                      </Label>

                      <Label
                        htmlFor="3-players"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent cursor-pointer ${
                          playerCount === "3" ? "border-primary" : "border-muted"
                        }`}
                      >
                        <RadioGroupItem value="3" id="3-players" className="sr-only" />
                        <Users className="mb-3 h-6 w-6" />
                        <span className="block text-center">
                          3 Players
                          <Badge variant="outline" className="ml-2">
                            Beta
                          </Badge>
                        </span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <Label className="text-base">Chat Settings</Label>
                    <p className="text-sm text-muted-foreground mb-3">Configure in-game chat options</p>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="chat-enabled">Enable Chat</Label>
                        <p className="text-sm text-muted-foreground">Allow players to chat during the game</p>
                      </div>
                      <Switch id="chat-enabled" checked={chatEnabled} onCheckedChange={setChatEnabled} />
                    </div>

                    {chatEnabled && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="chat-filter">Chat Filter</Label>
                          <p className="text-sm text-muted-foreground">Filter inappropriate messages</p>
                        </div>
                        <Switch
                          id="chat-filter"
                          checked={chatFilterEnabled}
                          onCheckedChange={setChatFilterEnabled}
                          disabled={!chatEnabled}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("profile")}>
                    Back to Profile
                  </Button>

                  <Button
                    onClick={handleCreateRoom}
                    disabled={!playerName.trim() || isCreating}
                    className="transition-all hover:bg-primary/90 active:scale-95"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Room...
                      </>
                    ) : (
                      "Create Room"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
