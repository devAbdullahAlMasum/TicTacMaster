"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarSelector } from "@/components/avatar-selector"
import { generateRoomCode } from "@/lib/utils"
import { Loader2, Trophy, Calendar, AlertTriangle, Users } from "lucide-react"
import { resetGameState, getSettings } from "@/lib/game-store"
import { DashboardShell } from "@/components/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function CreateEventPage() {
  const router = useRouter()
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
    <DashboardShell>
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-md transition-all group overflow-hidden">
          <div className="absolute w-40 h-40 -right-10 -top-10 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-xl group-hover:bg-purple-300/30 dark:group-hover:bg-purple-700/20 transition-all"></div>
          <div className="absolute w-32 h-32 right-40 bottom-10 bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-xl group-hover:bg-indigo-300/20 dark:group-hover:bg-indigo-700/10 transition-all"></div>

          <div className="absolute top-4 right-4">
            <Badge className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">BETA</Badge>
          </div>

          <CardHeader>
            <CardTitle className="text-2xl flex items-center text-purple-700 dark:text-purple-300">
              <Trophy className="mr-2 h-6 w-6" />
              Create Tournament Event
            </CardTitle>
            <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
              Set up a fully customizable game event
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-6 bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Beta Feature</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Tournament mode is currently in beta. We've fixed the round counting bug.
              </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-purple-200 dark:bg-purple-800">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  Host Profile
                </TabsTrigger>
                <TabsTrigger
                  value="event"
                  className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  Event Details
                </TabsTrigger>
                <TabsTrigger
                  value="rules"
                  className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 text-purple-800 dark:text-purple-200"
                >
                  Game Rules
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="playerName" className="text-purple-700 dark:text-purple-300">
                    Your Name
                  </Label>
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-700 dark:text-purple-300">Select an Avatar</Label>
                  <AvatarSelector selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setActiveTab("event")}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none"
                  >
                    Next: Event Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="event" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="eventName" className="text-purple-700 dark:text-purple-300">
                    Event Name
                  </Label>
                  <Input
                    id="eventName"
                    placeholder="Enter event name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-700 dark:text-purple-300">Number of Players</Label>
                  <RadioGroup value={playerCount} onValueChange={setPlayerCount} className="grid grid-cols-3 gap-4">
                    <Label
                      htmlFor="event-2-players"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                        playerCount === "2"
                          ? "border-purple-500 dark:border-purple-400"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <RadioGroupItem value="2" id="event-2-players" className="sr-only" />
                      <Users className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <span className="block text-center text-purple-700 dark:text-purple-300">2 Players</span>
                    </Label>

                    <Label
                      htmlFor="event-3-players"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                        playerCount === "3"
                          ? "border-purple-500 dark:border-purple-400"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <RadioGroupItem value="3" id="event-3-players" className="sr-only" />
                      <Users className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <div className="flex flex-col items-center">
                        <span className="block text-center text-purple-700 dark:text-purple-300">3 Players</span>
                        <Badge className="mt-1 bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                          BETA
                        </Badge>
                      </div>
                    </Label>

                    <Label
                      htmlFor="event-4-players"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                        playerCount === "4"
                          ? "border-purple-500 dark:border-purple-400"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <RadioGroupItem value="4" id="event-4-players" className="sr-only" />
                      <Users className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <div className="flex flex-col items-center">
                        <span className="block text-center text-purple-700 dark:text-purple-300">4 Players</span>
                        <span className="text-xs text-purple-600/80 dark:text-purple-400/80">(Teams)</span>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rounds" className="text-purple-700 dark:text-purple-300">
                    Number of Rounds
                  </Label>
                  <Select value={rounds} onValueChange={setRounds}>
                    <SelectTrigger className="bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
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
                  <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
                    First to win {scoreToWin} rounds wins the event
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timeLimit" className="text-purple-700 dark:text-purple-300">
                      Time Limit per Move (seconds)
                    </Label>
                    <span className="text-sm text-purple-600/80 dark:text-purple-400/80">
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
                    className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-200/50 dark:hover:bg-purple-800/50"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setActiveTab("rules")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none"
                  >
                    Next: Game Rules
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="rules" className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="boardSize" className="text-purple-700 dark:text-purple-300">
                    Board Size
                  </Label>
                  <RadioGroup value={boardSize} onValueChange={setBoardSize} className="grid grid-cols-3 gap-4">
                    <Label
                      htmlFor="event-3x3"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                        boardSize === "3"
                          ? "border-purple-500 dark:border-purple-400"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <RadioGroupItem value="3" id="event-3x3" className="sr-only" />
                      <div className="grid grid-cols-3 gap-1 w-12 h-12 mb-2">
                        {Array(9)
                          .fill(null)
                          .map((_, i) => (
                            <div key={i} className="bg-purple-200 dark:bg-purple-800 rounded-sm"></div>
                          ))}
                      </div>
                      <span className="block text-center text-purple-700 dark:text-purple-300">3×3 Grid</span>
                    </Label>

                    <Label
                      htmlFor="event-4x4"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                        boardSize === "4"
                          ? "border-purple-500 dark:border-purple-400"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <RadioGroupItem value="4" id="event-4x4" className="sr-only" />
                      <div className="grid grid-cols-4 gap-1 w-12 h-12 mb-2">
                        {Array(16)
                          .fill(null)
                          .map((_, i) => (
                            <div key={i} className="bg-purple-200 dark:bg-purple-800 rounded-sm"></div>
                          ))}
                      </div>
                      <span className="block text-center text-purple-700 dark:text-purple-300">4×4 Grid</span>
                    </Label>

                    <Label
                      htmlFor="event-5x5"
                      className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-purple-100 dark:hover:bg-purple-800 cursor-pointer ${
                        boardSize === "5"
                          ? "border-purple-500 dark:border-purple-400"
                          : "border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      <RadioGroupItem value="5" id="event-5x5" className="sr-only" />
                      <div className="grid grid-cols-5 gap-1 w-12 h-12 mb-2">
                        {Array(25)
                          .fill(null)
                          .map((_, i) => (
                            <div key={i} className="bg-purple-200 dark:bg-purple-800 rounded-sm"></div>
                          ))}
                      </div>
                      <span className="block text-center text-purple-700 dark:text-purple-300">5×5 Grid</span>
                    </Label>
                  </RadioGroup>
                  <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
                    Win condition: 3 in a row for all board sizes
                  </p>
                </div>

                <Separator className="my-4 bg-purple-200 dark:bg-purple-800" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="chat-enabled" className="text-purple-700 dark:text-purple-300">
                        Enable Chat
                      </Label>
                      <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                        Allow players to chat during the game
                      </p>
                    </div>
                    <Switch id="chat-enabled" checked={chatEnabled} onCheckedChange={setChatEnabled} />
                  </div>

                  {chatEnabled && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="chat-filter" className="text-purple-700 dark:text-purple-300">
                          Chat Filter
                        </Label>
                        <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
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

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("event")}
                    className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-200/50 dark:hover:bg-purple-800/50"
                  >
                    Back
                  </Button>

                  <Button
                    onClick={handleCreateEvent}
                    disabled={!playerName.trim() || !eventName.trim() || isCreating}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none transition-all hover:shadow-md active:scale-95"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      <>
                        Create Event
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
    </DashboardShell>
  )
}
