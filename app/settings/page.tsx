"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Badge variant="outline" className="text-xs">
            v2.2
          </Badge>
        </div>

        <Card className="border shadow-md bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <CardHeader className="border-b bg-white/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Settings Temporarily Unavailable</CardTitle>
            </div>
            <CardDescription>We're working on improvements</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Wrench className="h-16 w-16 text-amber-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-medium mb-2">Settings are currently offline</h3>
              <p className="text-muted-foreground max-w-md">
                The settings page is being revamped and will return with improved functionality in the next update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
