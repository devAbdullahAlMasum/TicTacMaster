"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveSettings, getSettings } from "@/lib/game-store"
import { useTheme } from "next-themes"
import { SettingsIcon, Bell, Gamepad2, Palette } from "lucide-react"

export default function SettingsPage() {
  // Theme settings
  const { setTheme } = useTheme()
  const [themeValue, setThemeValue] = useState("system")

  // Notification settings
  const [gameNotifications, setGameNotifications] = useState(true)
  const [chatNotifications, setChatNotifications] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)

  // Game preferences
  const [defaultBoardSize, setDefaultBoardSize] = useState("3x3")
  const [defaultPlayerName, setDefaultPlayerName] = useState("")
  const [defaultAvatarId, setDefaultAvatarId] = useState("1")

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Load settings on mount
  useEffect(() => {
    const settings = getSettings()
    setThemeValue(settings.theme || "system")
    setGameNotifications(settings.gameNotifications !== false)
    setChatNotifications(settings.chatNotifications !== false)
    setSoundEffects(settings.soundEffects !== false)
    setDefaultBoardSize(settings.defaultBoardSize || "3x3")
    setDefaultPlayerName(settings.defaultPlayerName || "")
    setDefaultAvatarId(settings.defaultAvatarId || "1")

    // Apply theme immediately when component mounts
    setTheme(settings.theme || "system")

    setIsLoading(false)
  }, [setTheme])

  // Save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to a database or localStorage
    const settings = {
      theme: themeValue,
      gameNotifications,
      chatNotifications,
      soundEffects,
      defaultBoardSize,
      defaultPlayerName,
      defaultAvatarId,
    }

    const success = saveSettings(settings)

    if (success) {
      // Apply theme immediately when settings are saved
      setTheme(themeValue)

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
        duration: 3000,
      })
    } else {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your preferences.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Loading your preferences...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
          <div className="flex items-center">
            <SettingsIcon className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                Settings
              </h1>
              <p className="text-blue-600 dark:text-blue-400">Manage your account settings and preferences.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-zinc-200 dark:bg-zinc-800">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900 flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900 flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="game"
              className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-900 flex items-center gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Game Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card className="border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:shadow-md transition-all group overflow-hidden">
              <div className="absolute w-32 h-32 -right-10 -top-10 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl group-hover:bg-blue-300/30 dark:group-hover:bg-blue-700/20 transition-all"></div>

              <CardHeader>
                <CardTitle className="text-xl text-blue-700 dark:text-blue-300">Appearance Settings</CardTitle>
                <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
                  Customize how the application looks
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300">Theme</h3>
                    <Separator className="my-2 bg-blue-200 dark:bg-blue-800" />
                    <RadioGroup
                      value={themeValue}
                      onValueChange={setThemeValue}
                      className="grid grid-cols-3 gap-4 mt-2"
                    >
                      <Label
                        htmlFor="light"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                          themeValue === "light"
                            ? "border-blue-500 dark:border-blue-400"
                            : "border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <div className="h-10 w-10 rounded-full bg-zinc-100 border border-zinc-300"></div>
                        <span className="block text-center mt-2 text-blue-700 dark:text-blue-300">Light</span>
                      </Label>

                      <Label
                        htmlFor="dark"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                          themeValue === "dark"
                            ? "border-blue-500 dark:border-blue-400"
                            : "border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-700"></div>
                        <span className="block text-center mt-2 text-blue-700 dark:text-blue-300">Dark</span>
                      </Label>

                      <Label
                        htmlFor="system"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer ${
                          themeValue === "system"
                            ? "border-blue-500 dark:border-blue-400"
                            : "border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-zinc-100 to-zinc-900 border border-zinc-300"></div>
                        <span className="block text-center mt-2 text-blue-700 dark:text-blue-300">System</span>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card className="border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 hover:shadow-md transition-all group overflow-hidden">
              <div className="absolute w-32 h-32 -right-10 -top-10 bg-amber-200/30 dark:bg-amber-800/20 rounded-full blur-xl group-hover:bg-amber-300/30 dark:group-hover:bg-amber-700/20 transition-all"></div>

              <CardHeader>
                <CardTitle className="text-xl text-amber-700 dark:text-amber-300">Notification Settings</CardTitle>
                <CardDescription className="text-amber-600/80 dark:text-amber-400/80">
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="game-notifications" className="text-amber-700 dark:text-amber-300">
                        Game Notifications
                      </Label>
                      <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                        Receive notifications about game invites and turns
                      </p>
                    </div>
                    <Switch
                      id="game-notifications"
                      checked={gameNotifications}
                      onCheckedChange={setGameNotifications}
                    />
                  </div>

                  <Separator className="bg-amber-200 dark:bg-amber-800" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="chat-notifications" className="text-amber-700 dark:text-amber-300">
                        Chat Notifications
                      </Label>
                      <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                        Receive notifications about new chat messages
                      </p>
                    </div>
                    <Switch
                      id="chat-notifications"
                      checked={chatNotifications}
                      onCheckedChange={setChatNotifications}
                    />
                  </div>

                  <Separator className="bg-amber-200 dark:bg-amber-800" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-effects" className="text-amber-700 dark:text-amber-300">
                        Sound Effects
                      </Label>
                      <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                        Play sound effects for game actions
                      </p>
                    </div>
                    <Switch id="sound-effects" checked={soundEffects} onCheckedChange={setSoundEffects} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game" className="space-y-4 mt-4">
            <Card className="border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 hover:shadow-md transition-all group overflow-hidden">
              <div className="absolute w-32 h-32 -right-10 -top-10 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-xl group-hover:bg-emerald-300/30 dark:group-hover:bg-emerald-700/20 transition-all"></div>

              <CardHeader>
                <CardTitle className="text-xl text-emerald-700 dark:text-emerald-300">Game Preferences</CardTitle>
                <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">
                  Set your default game settings
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="default-board-size" className="text-emerald-700 dark:text-emerald-300">
                      Default Board Size
                    </Label>
                    <RadioGroup
                      value={defaultBoardSize}
                      onValueChange={setDefaultBoardSize}
                      className="grid grid-cols-3 gap-4 mt-2"
                    >
                      <Label
                        htmlFor="3x3"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-emerald-100 dark:hover:bg-emerald-800 cursor-pointer ${
                          defaultBoardSize === "3x3"
                            ? "border-emerald-500 dark:border-emerald-400"
                            : "border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        <RadioGroupItem value="3x3" id="3x3" className="sr-only" />
                        <div className="grid grid-cols-3 gap-1 w-12 h-12">
                          {Array(9)
                            .fill(null)
                            .map((_, i) => (
                              <div key={i} className="bg-emerald-200 dark:bg-emerald-800 rounded-sm"></div>
                            ))}
                        </div>
                        <span className="block text-center mt-2 text-emerald-700 dark:text-emerald-300">3×3</span>
                      </Label>

                      <Label
                        htmlFor="4x4"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-emerald-100 dark:hover:bg-emerald-800 cursor-pointer ${
                          defaultBoardSize === "4x4"
                            ? "border-emerald-500 dark:border-emerald-400"
                            : "border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        <RadioGroupItem value="4x4" id="4x4" className="sr-only" />
                        <div className="grid grid-cols-4 gap-1 w-12 h-12">
                          {Array(16)
                            .fill(null)
                            .map((_, i) => (
                              <div key={i} className="bg-emerald-200 dark:bg-emerald-800 rounded-sm"></div>
                            ))}
                        </div>
                        <span className="block text-center mt-2 text-emerald-700 dark:text-emerald-300">4×4</span>
                      </Label>

                      <Label
                        htmlFor="5x5"
                        className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-emerald-100 dark:hover:bg-emerald-800 cursor-pointer ${
                          defaultBoardSize === "5x5"
                            ? "border-emerald-500 dark:border-emerald-400"
                            : "border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        <RadioGroupItem value="5x5" id="5x5" className="sr-only" />
                        <div className="grid grid-cols-5 gap-1 w-12 h-12">
                          {Array(25)
                            .fill(null)
                            .map((_, i) => (
                              <div key={i} className="bg-emerald-200 dark:bg-emerald-800 rounded-sm"></div>
                            ))}
                        </div>
                        <span className="block text-center mt-2 text-emerald-700 dark:text-emerald-300">5×5</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <Separator className="bg-emerald-200 dark:bg-emerald-800" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-player-name" className="text-emerald-700 dark:text-emerald-300">
                        Default Player Name
                      </Label>
                      <Input
                        id="default-player-name"
                        placeholder="Enter your name"
                        value={defaultPlayerName}
                        onChange={(e) => setDefaultPlayerName(e.target.value)}
                        className="bg-emerald-50 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-avatar" className="text-emerald-700 dark:text-emerald-300">
                        Default Avatar
                      </Label>
                      <Select value={defaultAvatarId} onValueChange={setDefaultAvatarId}>
                        <SelectTrigger className="bg-emerald-50 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                          <SelectValue placeholder="Select avatar" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array(6)
                            .fill(null)
                            .map((_, i) => (
                              <SelectItem key={i} value={(i + 1).toString()}>
                                Avatar {i + 1}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none transition-all hover:shadow-md active:scale-95"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
}
