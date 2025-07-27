"use client"

import { useState, useEffect } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { PageLoader } from "@/components/page-loader"
import { ThemeSelector } from "@/components/theme-selector"
import { 
  Settings, Palette, Volume2, VolumeX, Vibrate, 
  User, Shield, Bell, Download, Upload, RotateCcw,
  Save, Eye, Gamepad2, Zap
} from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { playClickSound, playSuccessSound } = useSoundEffects()
  const { getStyles, currentTheme, themeName } = useThemeSystem()
  
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)
    setHasChanges(hasChanges)
  }, [localSettings, settings])

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
    playClickSound()
  }

  const saveSettings = () => {
    updateSettings(localSettings)
    setHasChanges(false)
    playSuccessSound()
    toast.success("Settings saved successfully!")
  }

  const resetSettings = () => {
    const defaultSettings = {
      soundEnabled: true,
      vibrationEnabled: true,
      highContrastMode: false,
      largeText: false,
      animationsEnabled: true,
      notificationsEnabled: true,
      defaultPlayerName: "Player",
      autoSave: true,
      showHints: true,
      difficulty: "medium",
      boardSize: "3",
      theme: "system",
      volume: 50,
      playerLevel: 1,
      gamesPlayed: 0,
      gamesWon: 0
    }
    setLocalSettings(defaultSettings)
    playClickSound()
    toast.success("Settings reset to defaults!")
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tictacmaster-settings.json'
    link.click()
    playClickSound()
    toast.success("Settings exported!")
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setLocalSettings(imported)
        playSuccessSound()
        toast.success("Settings imported successfully!")
      } catch (error) {
        toast.error("Invalid settings file!")
      }
    }
    reader.readAsText(file)
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
                <Settings className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">Settings</span>
              </div>
              <p className={cn("text-lg", getStyles("text.secondary"))}>
                Customize your TicTacMaster experience
              </p>
            </div>

            {/* Save/Reset Actions */}
            {hasChanges && (
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border-2 border-dashed",
                getStyles("border.accent"), getStyles("background.secondary")
              )}>
                <div>
                  <p className={cn("font-medium", getStyles("text.primary"))}>
                    You have unsaved changes
                  </p>
                  <p className={cn("text-sm", getStyles("text.secondary"))}>
                    Save your settings to apply changes
                  </p>
                </div>
                <div className="flex gap-2">
                  <EnhancedButton
                    onClick={resetSettings}
                    variant="outline"
                    size="sm"
                    icon={<RotateCcw className="h-4 w-4" />}
                  >
                    Reset
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={saveSettings}
                    size="sm"
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </EnhancedButton>
                </div>
              </div>
            )}

            <Tabs defaultValue="appearance" className="space-y-6">
              <TabsList className={cn("grid w-full grid-cols-4", getStyles("card.base"))}>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Audio</span>
                </TabsTrigger>
                <TabsTrigger value="gameplay" className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Gameplay</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-6">
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader>
                    <EnhancedCardTitle className="flex items-center gap-2">
                      <Palette className={cn("h-5 w-5", getStyles("text.accent"))} />
                      Theme & Display
                    </EnhancedCardTitle>
                    <EnhancedCardDescription>Customize the look and feel</EnhancedCardDescription>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-6">
                    {/* Theme Selector */}
                    <div className="space-y-3">
                      <Label>Theme</Label>
                      <ThemeSelector variant="card" />
                      <div className={cn("text-sm", getStyles("text.secondary"))}>
                        Current theme: <Badge variant="secondary">{themeName}</Badge>
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>High Contrast Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Increase contrast for better visibility
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.highContrastMode}
                          onCheckedChange={(checked) => handleSettingChange("highContrastMode", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Large Text</Label>
                          <p className="text-sm text-muted-foreground">
                            Increase text size for better readability
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.largeText}
                          onCheckedChange={(checked) => handleSettingChange("largeText", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Animations</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable smooth animations and transitions
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.animationsEnabled}
                          onCheckedChange={(checked) => handleSettingChange("animationsEnabled", checked)}
                        />
                      </div>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </TabsContent>

              <TabsContent value="audio" className="space-y-6">
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader>
                    <EnhancedCardTitle className="flex items-center gap-2">
                      <Volume2 className={cn("h-5 w-5", getStyles("text.accent"))} />
                      Audio & Haptics
                    </EnhancedCardTitle>
                    <EnhancedCardDescription>Sound effects and vibration settings</EnhancedCardDescription>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          {localSettings.soundEnabled ? (
                            <Volume2 className="h-4 w-4" />
                          ) : (
                            <VolumeX className="h-4 w-4" />
                          )}
                          Sound Effects
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Play sounds for moves, wins, and interactions
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.soundEnabled}
                        onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
                      />
                    </div>

                    {localSettings.soundEnabled && (
                      <div className="space-y-3">
                        <Label>Volume</Label>
                        <div className="px-3">
                          <Slider
                            value={[localSettings.volume || 50]}
                            onValueChange={([value]) => handleSettingChange("volume", value)}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>0%</span>
                          <span>{localSettings.volume || 50}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Vibrate className="h-4 w-4" />
                          Vibration
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Haptic feedback on mobile devices
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.vibrationEnabled}
                        onCheckedChange={(checked) => handleSettingChange("vibrationEnabled", checked)}
                      />
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </TabsContent>

              <TabsContent value="gameplay" className="space-y-6">
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader>
                    <EnhancedCardTitle className="flex items-center gap-2">
                      <Gamepad2 className={cn("h-5 w-5", getStyles("text.accent"))} />
                      Game Settings
                    </EnhancedCardTitle>
                    <EnhancedCardDescription>Configure gameplay preferences</EnhancedCardDescription>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Default Board Size</Label>
                        <Select
                          value={localSettings.boardSize}
                          onValueChange={(value) => handleSettingChange("boardSize", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3×3 (Classic)</SelectItem>
                            <SelectItem value="4">4×4 (Extended)</SelectItem>
                            <SelectItem value="5">5×5 (Challenge)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>AI Difficulty</Label>
                        <Select
                          value={localSettings.difficulty}
                          onValueChange={(value) => handleSettingChange("difficulty", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Show Hints</Label>
                          <p className="text-sm text-muted-foreground">
                            Display helpful tips during gameplay
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.showHints}
                          onCheckedChange={(checked) => handleSettingChange("showHints", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Auto-save Games</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically save game progress
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.autoSave}
                          onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                        />
                      </div>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader>
                    <EnhancedCardTitle className="flex items-center gap-2">
                      <User className={cn("h-5 w-5", getStyles("text.accent"))} />
                      Profile & Data
                    </EnhancedCardTitle>
                    <EnhancedCardDescription>Manage your account and data</EnhancedCardDescription>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Player Name</Label>
                      <Input
                        value={localSettings.defaultPlayerName}
                        onChange={(e) => handleSettingChange("defaultPlayerName", e.target.value)}
                        placeholder="Enter your name"
                        className={cn(getStyles("input.base"), getStyles("input.focus"))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive game invites and updates
                        </p>
                      </div>
                      <Switch
                        checked={localSettings.notificationsEnabled}
                        onCheckedChange={(checked) => handleSettingChange("notificationsEnabled", checked)}
                      />
                    </div>

                    {/* Data Management */}
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className={cn("font-semibold", getStyles("text.primary"))}>
                        Data Management
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EnhancedButton
                          onClick={exportSettings}
                          variant="outline"
                          className="w-full"
                          icon={<Download className="h-4 w-4" />}
                        >
                          Export Settings
                        </EnhancedButton>
                        
                        <div>
                          <input
                            type="file"
                            accept=".json"
                            onChange={importSettings}
                            className="hidden"
                            id="import-settings"
                          />
                          <EnhancedButton
                            onClick={() => document.getElementById('import-settings')?.click()}
                            variant="outline"
                            className="w-full"
                            icon={<Upload className="h-4 w-4" />}
                          >
                            Import Settings
                          </EnhancedButton>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                          {localSettings.playerLevel || 1}
                        </div>
                        <div className={cn("text-sm", getStyles("text.secondary"))}>Level</div>
                      </div>
                      <div className="text-center">
                        <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                          {localSettings.gamesPlayed || 0}
                        </div>
                        <div className={cn("text-sm", getStyles("text.secondary"))}>Games</div>
                      </div>
                      <div className="text-center">
                        <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                          {localSettings.gamesWon || 0}
                        </div>
                        <div className={cn("text-sm", getStyles("text.secondary"))}>Wins</div>
                      </div>
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </EnhancedDashboardShell>
    </PageLoader>
  )
}
