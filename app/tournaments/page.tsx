"use client"

import { useState } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedDashboardShell } from "@/components/enhanced-dashboard-shell"
import { PageLoader } from "@/components/page-loader"
import { 
  Trophy, Crown, Star, Users, Calendar, 
  Clock, Target, Plus, Play, Eye
} from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useSoundEffects } from "@/lib/sound-manager"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function TournamentsPage() {
  const { settings } = useSettings()
  const { playClickSound } = useSoundEffects()
  const { getStyles, currentTheme } = useThemeSystem()
  
  const [activeTab, setActiveTab] = useState("browse")

  const mockTournaments = [
    {
      id: "1",
      name: "Spring Championship 2024",
      description: "The ultimate Tic Tac Toe championship!",
      organizer: "TicTacMaster League",
      participants: 64,
      maxParticipants: 128,
      prizePool: "$1,000",
      status: "upcoming" as const,
      startDate: "2024-04-15T10:00:00Z",
      format: "single-elimination" as const,
      boardSize: 3,
      entryFee: 10,
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Upcoming</Badge>
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Live</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Completed</Badge>
    }
  }

  const joinTournament = () => {
    playClickSound()
    toast.success("Tournament registration coming soon!")
  }

  return (
    <PageLoader>
      <EnhancedDashboardShell>
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-lg",
                getStyles("sidebar.background")
              )}>
                <Trophy className="h-6 w-6 text-white" />
                <span className="text-white font-semibold">Tournaments</span>
              </div>
              <p className={cn("text-lg", getStyles("text.secondary"))}>
                Compete in organized tournaments and climb the competitive ladder!
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-center">
                <TabsList className={cn("grid w-full max-w-md grid-cols-2", getStyles("card.base"))}>
                  <TabsTrigger value="browse">Browse</TabsTrigger>
                  <TabsTrigger value="create">Create</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="browse" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockTournaments.map((tournament) => (
                    <EnhancedCard 
                      key={tournament.id}
                      variant="elevated"
                      className={cn(getStyles("card.base"))}
                    >
                      <EnhancedCardHeader>
                        <EnhancedCardTitle>{tournament.name}</EnhancedCardTitle>
                        <EnhancedCardDescription>{tournament.description}</EnhancedCardDescription>
                      </EnhancedCardHeader>
                      
                      <EnhancedCardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          {getStatusBadge(tournament.status)}
                          <div className={cn("text-lg font-bold", getStyles("text.accent"))}>
                            {tournament.prizePool}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className={cn("h-4 w-4", getStyles("text.accent"))} />
                            <span>{tournament.participants}/{tournament.maxParticipants}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className={cn("h-4 w-4", getStyles("text.accent"))} />
                            <span>{tournament.boardSize}×{tournament.boardSize}</span>
                          </div>
                        </div>

                        <EnhancedButton
                          onClick={joinTournament}
                          className="w-full"
                          icon={<Plus className="h-4 w-4" />}
                        >
                          Register
                        </EnhancedButton>
                      </EnhancedCardContent>
                    </EnhancedCard>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-6">
                <EnhancedCard className={getStyles("card.base")}>
                  <EnhancedCardContent className="p-12 text-center">
                    <Plus className={cn("h-16 w-16 mx-auto mb-4", getStyles("text.secondary"))} />
                    <h3 className={cn("text-lg font-semibold mb-2", getStyles("text.primary"))}>
                      Create Tournament
                    </h3>
                    <p className={cn("text-sm mb-6", getStyles("text.secondary"))}>
                      Tournament creation coming soon!
                    </p>
                    <EnhancedButton 
                      onClick={() => toast.success("Coming soon!")}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Create Tournament
                    </EnhancedButton>
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
