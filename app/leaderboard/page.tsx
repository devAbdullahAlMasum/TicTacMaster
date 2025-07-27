"use client"

import { useState, useEffect } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { PageLoader } from "@/components/page-loader"
import { 
  Trophy, Crown, Star, Medal, TrendingUp, Users, 
  Calendar, Target, Zap, Award, ChevronUp, ChevronDown
} from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  name: string
  avatar: string
  rank: number
  score: number
  wins: number
  losses: number
  draws: number
  winRate: number
  streak: number
  level: number
  xp: number
  totalGames: number
  lastActive: string
  badges: string[]
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  progress: number
  maxProgress: number
  unlocked: boolean
}

export default function LeaderboardPage() {
  const { settings } = useSettings()
  const { playClickSound } = useSoundEffects()
  const { getStyles, currentTheme } = useThemeSystem()
  
  const [activeTab, setActiveTab] = useState("global")
  const [timeFilter, setTimeFilter] = useState("all")

  // Mock leaderboard data
  const mockPlayers: Player[] = [
    {
      id: "1",
      name: "TicTacMaster",
      avatar: "/avatars/avatar-1.png",
      rank: 1,
      score: 2850,
      wins: 145,
      losses: 23,
      draws: 12,
      winRate: 86.3,
      streak: 15,
      level: 42,
      xp: 8750,
      totalGames: 180,
      lastActive: "2 hours ago",
      badges: ["champion", "streak_master", "perfectionist"]
    },
    {
      id: "2", 
      name: "GridWarrior",
      avatar: "/avatars/avatar-2.png",
      rank: 2,
      score: 2720,
      wins: 132,
      losses: 28,
      draws: 15,
      winRate: 82.1,
      streak: 8,
      level: 38,
      xp: 7650,
      totalGames: 175,
      lastActive: "1 hour ago",
      badges: ["veteran", "consistent"]
    },
    {
      id: "3",
      name: "XOLegend",
      avatar: "/avatars/avatar-3.png", 
      rank: 3,
      score: 2680,
      wins: 128,
      losses: 31,
      draws: 18,
      winRate: 79.5,
      streak: 5,
      level: 36,
      xp: 7200,
      totalGames: 177,
      lastActive: "30 min ago",
      badges: ["strategist", "comeback_king"]
    }
  ]

  // Mock achievements
  const mockAchievements: Achievement[] = [
    {
      id: "first_win",
      name: "First Victory",
      description: "Win your first game",
      icon: "🏆",
      rarity: "common",
      progress: 1,
      maxProgress: 1,
      unlocked: true
    },
    {
      id: "win_streak_10",
      name: "Unstoppable",
      description: "Win 10 games in a row",
      icon: "🔥",
      rarity: "rare",
      progress: 7,
      maxProgress: 10,
      unlocked: false
    },
    {
      id: "perfect_game",
      name: "Perfectionist",
      description: "Win without letting opponent score",
      icon: "💎",
      rarity: "epic",
      progress: 3,
      maxProgress: 5,
      unlocked: false
    }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className={cn("font-bold text-lg", getStyles("text.secondary"))}>{rank}</span>
    }
  }

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
      case "rare":
        return "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
      case "epic":
        return "border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20"
      case "legendary":
        return "border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20"
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
                <Trophy className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">Leaderboard</span>
              </div>
              <p className={cn("text-lg", getStyles("text.secondary"))}>
                Compete with players worldwide and climb the ranks!
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-center">
                <TabsList className={cn("grid w-full max-w-md grid-cols-3", getStyles("card.base"))}>
                  <TabsTrigger value="global" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Global
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Friends
                  </TabsTrigger>
                  <TabsTrigger value="achievements" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Achievements
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="global" className="space-y-6">
                {/* Time Filter */}
                <div className="flex justify-center gap-2">
                  {["all", "week", "month"].map((filter) => (
                    <EnhancedButton
                      key={filter}
                      variant={timeFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTimeFilter(filter)
                        playClickSound()
                      }}
                    >
                      {filter === "all" ? "All Time" : `This ${filter}`}
                    </EnhancedButton>
                  ))}
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {mockPlayers.slice(0, 3).map((player, index) => (
                    <EnhancedCard 
                      key={player.id}
                      variant="elevated"
                      className={cn(
                        "text-center relative overflow-hidden",
                        getStyles("card.base"),
                        index === 0 && "md:order-2 transform md:scale-110",
                        index === 1 && "md:order-1",
                        index === 2 && "md:order-3"
                      )}
                    >
                      {index === 0 && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
                      )}
                      
                      <EnhancedCardContent className="p-6 space-y-4">
                        <div className="flex justify-center">
                          {getRankIcon(player.rank)}
                        </div>
                        
                        <Avatar className="h-16 w-16 mx-auto border-4 border-white shadow-lg">
                          <AvatarImage src={player.avatar} alt={player.name} />
                          <AvatarFallback className={cn("text-lg font-bold", getStyles("text.primary"))}>
                            {player.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className={cn("font-bold text-lg", getStyles("text.primary"))}>
                            {player.name}
                          </h3>
                          <p className={cn("text-sm", getStyles("text.secondary"))}>
                            Level {player.level}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className={cn("text-2xl font-bold", getStyles("text.accent"))}>
                            {player.score.toLocaleString()}
                          </div>
                          <div className="flex justify-center gap-4 text-sm">
                            <div className="text-center">
                              <div className={cn("font-semibold", getStyles("text.primary"))}>
                                {player.wins}
                              </div>
                              <div className={cn("text-xs", getStyles("text.secondary"))}>Wins</div>
                            </div>
                            <div className="text-center">
                              <div className={cn("font-semibold", getStyles("text.primary"))}>
                                {player.winRate}%
                              </div>
                              <div className={cn("text-xs", getStyles("text.secondary"))}>Win Rate</div>
                            </div>
                          </div>
                        </div>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  ))}
                </div>

                {/* Full Leaderboard */}
                <EnhancedCard variant="elevated" className={getStyles("card.base")}>
                  <EnhancedCardHeader>
                    <EnhancedCardTitle>Global Rankings</EnhancedCardTitle>
                    <EnhancedCardDescription>Top players worldwide</EnhancedCardDescription>
                  </EnhancedCardHeader>
                  
                  <EnhancedCardContent className="p-0">
                    <div className="space-y-1">
                      {mockPlayers.map((player, index) => (
                        <div
                          key={player.id}
                          className={cn(
                            "flex items-center gap-4 p-4 hover:bg-opacity-50 transition-colors",
                            getStyles("card.hover"),
                            index < 3 && "bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/20"
                          )}
                        >
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(player.rank)}
                          </div>
                          
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={player.avatar} alt={player.name} />
                            <AvatarFallback>{player.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn("font-semibold", getStyles("text.primary"))}>
                                {player.name}
                              </span>
                              <Badge variant="secondary">Lv.{player.level}</Badge>
                              {player.streak > 5 && (
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                  🔥 {player.streak}
                                </Badge>
                              )}
                            </div>
                            <div className={cn("text-sm", getStyles("text.secondary"))}>
                              {player.wins}W • {player.losses}L • {player.winRate}% WR
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={cn("font-bold text-lg", getStyles("text.accent"))}>
                              {player.score.toLocaleString()}
                            </div>
                            <div className={cn("text-xs", getStyles("text.secondary"))}>
                              {player.lastActive}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {player.rank <= 10 ? (
                              <ChevronUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </EnhancedCardContent>
                </EnhancedCard>
              </TabsContent>

              <TabsContent value="friends" className="space-y-6">
                <EnhancedCard className={getStyles("card.base")}>
                  <EnhancedCardContent className="p-12 text-center">
                    <Users className={cn("h-16 w-16 mx-auto mb-4", getStyles("text.secondary"))} />
                    <h3 className={cn("text-lg font-semibold mb-2", getStyles("text.primary"))}>
                      Connect with Friends
                    </h3>
                    <p className={cn("text-sm mb-6", getStyles("text.secondary"))}>
                      Add friends to see how you rank against them!
                    </p>
                    <EnhancedButton icon={<Users className="h-4 w-4" />}>
                      Add Friends
                    </EnhancedButton>
                  </EnhancedCardContent>
                </EnhancedCard>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockAchievements.map((achievement) => (
                    <EnhancedCard 
                      key={achievement.id}
                      className={cn(
                        "relative overflow-hidden border-2",
                        getRarityColor(achievement.rarity),
                        achievement.unlocked && "ring-2 ring-green-500 ring-opacity-50"
                      )}
                    >
                      <EnhancedCardContent className="p-6 text-center space-y-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        
                        <div>
                          <h3 className={cn("font-bold", getStyles("text.primary"))}>
                            {achievement.name}
                          </h3>
                          <p className={cn("text-sm", getStyles("text.secondary"))}>
                            {achievement.description}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className={getStyles("text.secondary")}>Progress</span>
                            <span className={getStyles("text.primary")}>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <div className={cn("w-full bg-gray-200 rounded-full h-2", getStyles("background.secondary"))}>
                            <div 
                              className={cn("h-2 rounded-full transition-all", getStyles("sidebar.background"))}
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        {achievement.unlocked && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ✓ Unlocked
                          </Badge>
                        )}
                      </EnhancedCardContent>
                    </EnhancedCard>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </EnhancedDashboardShell>
    </PageLoader>
  )
}
