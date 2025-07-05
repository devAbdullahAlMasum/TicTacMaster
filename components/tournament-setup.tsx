"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { generateRoomCode } from "@/lib/utils"
import { Loader2, Trophy, Calendar, Users, Home, ArrowRight } from "lucide-react"
import { resetGameState, getSettings } from "@/lib/game-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useSoundEffects } from "@/lib/sound-manager"

interface TournamentSetupProps {
  onBack?: () => void
}

export function TournamentSetup({ onBack }: TournamentSetupProps) {
  const router = useRouter()
  const { playClickSound } = useSoundEffects()
  const [playerName, setPlayerName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Event settings
  const [eventName, setEventName] = useState("")
  const [boardSize, setBoardSize] = useState("3")
  const [playerCount, setPlayerCount] = useState("2")
  const [rounds, setRounds] = useState("3")
  const [timeLimit, setTimeLimit] = useState("0") // 0 means no time limit
  const [chatEnabled, setChatEnabled] = useState(true)
  const [chatFilterEnabled, setChatFilterEnabled] = useState(true)
  const [scoreToWin, setScoreToWin] = useState("2")

  // Load default settings
  useEffect(() => {
    const settings = getSettings()
    if (settings.defaultPlayerName) {
      setPlayerName(settings.defaultPlayerName)
    }
    if (settings.defaultAvatarId) {
      setSelectedAvatar(Number(settings.defaultAvatarId))
    }
  }, [])

  // Calculate score to win based on rounds
  useEffect(() => {
    const roundsNum = Number.parseInt(rounds)
    const scoreNeeded = Math.ceil(roundsNum / 2)
    setScoreToWin(scoreNeeded.toString())
  }, [rounds])

  const handleCreateEvent = async () => {
    if (!playerName.trim() || !eventName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name and event name.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    playClickSound()

    // Generate a unique room code
    const roomCode = generateRoomCode()

    // Reset any existing game state for this room with custom settings
    resetGameState(roomCode, boardSize, playerCount, chatEnabled, chatFilterEnabled, true, Number.parseInt(rounds))

    // Store additional event settings in localStorage
    localStorage.setItem(
      `event-${roomCode}`,
      JSON.stringify({
        eventName,
        rounds: Number.parseInt(rounds),
        timeLimit: Number.parseInt(timeLimit),
        scoreToWin: Number.parseInt(scoreToWin),
        createdBy: playerName,
        createdAt: Date.now(),
      }),
    )

    // Redirect to the game room with all settings
    setTimeout(() => {
      const queryParams = new URLSearchParams({
        name: playerName,
        avatar: selectedAvatar.toString(),
        host: "true",
        boardSize: `${boardSize}x${boardSize}`,
        playerCount,
        chatEnabled: chatEnabled.toString(),
        chatFilter: chatFilterEnabled.toString(),
        event: "true",
        eventName,
      })

      router.push(`/game/${roomCode}?${queryParams.toString()}`)
    }, 1000)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 text-white mb-4 sm:mb-6 shadow-2xl">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-purple-600 dark:from-amber-400 dark:via-orange-400 dark:to-purple-400 text-transparent bg-clip-text">
              Tournament Mode
            </h2>
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 text-xs sm:text-sm px-2 sm:px-3 py-1">
              BETA
            </Badge>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4">
            Create a competitive tournament with multiple rounds
          </p>
        </div>
      </div>

      {/* Setup Card */}
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 sm:gap-3">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            Create Tournament Event
          </CardTitle>
          <CardDescription className="text-base sm:text-lg">
            Set up your competitive tournament
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-amber-200 dark:bg-amber-800">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900 text-amber-800 dark:text-amber-200"
              >
                Host Profile
              </TabsTrigger>
              <TabsTrigger
                value="event"
                className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900 text-amber-800 dark:text-amber-200"
              >
                Event Details
              </TabsTrigger>
              <TabsTrigger
                value="rules"
                className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900 text-amber-800 dark:text-amber-200"
              >
                Game Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-amber-700 dark:text-amber-300">
                  Your Name
                </Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-amber-50 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-amber-700 dark:text-amber-300">Select an Avatar</Label>
                <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setActiveTab("event")}
                  className="mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-none"
                >
                  Next: Event Details
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="event" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-amber-700 dark:text-amber-300">
                  Event Name
                </Label>
                <Input
                  id="eventName"
                  placeholder="Enter event name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="bg-amber-50 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-amber-700 dark:text-amber-300">Number of Players</Label>
                <RadioGroup value={playerCount} onValueChange={setPlayerCount} className="grid grid-cols-3 gap-4">
                  <Label
                    htmlFor="tournament-2-players"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-amber-100 dark:hover:bg-amber-800 cursor-pointer ${
                      playerCount === "2"
                        ? "border-amber-500 dark:border-amber-400"
                        : "border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <RadioGroupItem value="2" id="tournament-2-players" className="sr-only" />
                    <Users className="mb-3 h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <span className="block text-center text-amber-700 dark:text-amber-300">2 Players</span>
                  </Label>

                  <Label
                    htmlFor="tournament-3-players"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-amber-100 dark:hover:bg-amber-800 cursor-pointer ${
                      playerCount === "3"
                        ? "border-amber-500 dark:border-amber-400"
                        : "border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <RadioGroupItem value="3" id="tournament-3-players" className="sr-only" />
                    <Users className="mb-3 h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <span className="block text-center text-amber-700 dark:text-amber-300">3 Players</span>
                  </Label>

                  <Label
                    htmlFor="tournament-4-players"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-amber-100 dark:hover:bg-amber-800 cursor-pointer ${
                      playerCount === "4"
                        ? "border-amber-500 dark:border-amber-400"
                        : "border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <RadioGroupItem value="4" id="tournament-4-players" className="sr-only" />
                    <Users className="mb-3 h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <span className="block text-center text-amber-700 dark:text-amber-300">4 Players</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rounds" className="text-amber-700 dark:text-amber-300">
                  Number of Rounds
                </Label>
                <Select value={rounds} onValueChange={setRounds}>
                  <SelectTrigger className="bg-amber-50 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                    <SelectValue placeholder="Select number of rounds" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 3, 5, 7, 9].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Round" : "Rounds"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                  First to win {scoreToWin} rounds wins the event
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="timeLimit" className="text-amber-700 dark:text-amber-300">
                    Time Limit per Move (seconds)
                  </Label>
                  <span className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    {timeLimit === "0" ? "No Limit" : `${timeLimit} seconds`}
                  </span>
                </div>
                <Slider
                  id="timeLimit"
                  min={0}
                  max={60}
                  step={5}
                  value={[Number.parseInt(timeLimit)]}
                  onValueChange={(value) => setTimeLimit(value[0].toString())}
                  className="py-4"
                />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("profile")}
                  className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/50"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setActiveTab("rules")}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-none"
                >
                  Next: Game Rules
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rules" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="boardSize" className="text-amber-700 dark:text-amber-300">
                  Board Size
                </Label>
                <RadioGroup value={boardSize} onValueChange={setBoardSize} className="grid grid-cols-3 gap-4">
                  <Label
                    htmlFor="tournament-3x3"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-amber-100 dark:hover:bg-amber-800 cursor-pointer ${
                      boardSize === "3"
                        ? "border-amber-500 dark:border-amber-400"
                        : "border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <RadioGroupItem value="3" id="tournament-3x3" className="sr-only" />
                    <div className="grid grid-cols-3 gap-1 w-12 h-12 mb-2">
                      {Array(9)
                        .fill(null)
                        .map((_, i) => (
                          <div key={i} className="bg-amber-200 dark:bg-amber-800 rounded-sm"></div>
                        ))}
                    </div>
                    <span className="block text-center text-amber-700 dark:text-amber-300">3×3 Grid</span>
                  </Label>

                  <Label
                    htmlFor="tournament-4x4"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-amber-100 dark:hover:bg-amber-800 cursor-pointer ${
                      boardSize === "4"
                        ? "border-amber-500 dark:border-amber-400"
                        : "border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <RadioGroupItem value="4" id="tournament-4x4" className="sr-only" />
                    <div className="grid grid-cols-4 gap-1 w-12 h-12 mb-2">
                      {Array(16)
                        .fill(null)
                        .map((_, i) => (
                          <div key={i} className="bg-amber-200 dark:bg-amber-800 rounded-sm"></div>
                        ))}
                    </div>
                    <span className="block text-center text-amber-700 dark:text-amber-300">4×4 Grid</span>
                  </Label>

                  <Label
                    htmlFor="tournament-5x5"
                    className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-amber-100 dark:hover:bg-amber-800 cursor-pointer ${
                      boardSize === "5"
                        ? "border-amber-500 dark:border-amber-400"
                        : "border-amber-200 dark:border-amber-800"
                    }`}
                  >
                    <RadioGroupItem value="5" id="tournament-5x5" className="sr-only" />
                    <div className="grid grid-cols-5 gap-1 w-12 h-12 mb-2">
                      {Array(25)
                        .fill(null)
                        .map((_, i) => (
                          <div key={i} className="bg-amber-200 dark:bg-amber-800 rounded-sm"></div>
                        ))}
                    </div>
                    <span className="block text-center text-amber-700 dark:text-amber-300">5×5 Grid</span>
                  </Label>
                </RadioGroup>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                  Win condition: 3 in a row for all board sizes
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="chat-enabled" className="text-amber-700 dark:text-amber-300">
                      Enable Chat
                    </Label>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                      Allow players to chat during the game
                    </p>
                  </div>
                  <Switch id="chat-enabled" checked={chatEnabled} onCheckedChange={setChatEnabled} />
                </div>

                {chatEnabled && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="chat-filter" className="text-amber-700 dark:text-amber-300">
                        Chat Filter
                      </Label>
                      <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                        Filter inappropriate messages
                      </p>
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

              <div className="flex gap-3">
                {onBack && (
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 touch-manipulation"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}

                <Button
                  onClick={handleCreateEvent}
                  disabled={!playerName.trim() || !eventName.trim() || isCreating}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-none transition-all hover:shadow-md active:scale-95 touch-manipulation"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Tournament
                      <Calendar className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}