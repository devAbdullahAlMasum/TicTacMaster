"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Github, Instagram, Heart } from "lucide-react"

export function WhatsNew() {
  const [open, setOpen] = useState(false)
  const [hasSeenUpdate, setHasSeenUpdate] = useState(false)

  // Show popup automatically on first visit
  useEffect(() => {
    const seen = localStorage.getItem("seen-whats-new-v2.1")
    if (!seen) {
      setOpen(true)
      setHasSeenUpdate(false)
    } else {
      setHasSeenUpdate(true)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    localStorage.setItem("seen-whats-new-v2.1", "true")
    setHasSeenUpdate(true)
  }

  const updates = [
    {
      version: "2.1",
      date: "June 11, 2025",
      title: "New Update: Local Multiplayer & Optimizations",
      description: "Play with friends on the same device plus performance improvements and optimizations!",
      features: [
        {
          title: "👥 Local Multiplayer Mode",
          description: "Play with friends on the same device - perfect for face-to-face gaming",
          highlight: true,
        },
        {
          title: "🔄 Turn-Based Gameplay",
          description: "Automatic turn management for 2-4 players on one device",
          highlight: true,
        },
        {
          title: "📊 Score Tracking",
          description: "Keep track of wins across multiple rounds in local games",
          highlight: true,
        },
        {
          title: "⚡ Performance Optimizations",
          description: "Improved game logic and faster rendering for smoother gameplay",
        },
        {
          title: "🎨 Enhanced UI",
          description: "Better visual indicators and improved user experience",
        },
        {
          title: "🐛 Bug Fixes",
          description: "Fixed various issues and improved overall stability",
        },
      ],
    },
    {
      version: "2.0",
      date: "June 1, 2025",
      title: "Major Update: Single Player & Enhanced Experience",
      description:
        "Play against AI opponents with multiple difficulty levels and board sizes, plus stability and visual improvements!",
      features: [
        {
          title: "🤖 Single Player Mode",
          description: "Play against AI with Easy, Medium, and Hard difficulty levels",
          highlight: true,
        },
        {
          title: "📐 Multiple Board Sizes",
          description: "Choose between 3×3, 4×4, and 5×5 grid sizes for different challenges",
          highlight: true,
        },
        {
          title: "✨ Enhanced Win Animations",
          description: "Beautiful celebration effects with confetti and particle animations",
          highlight: true,
        },
        {
          title: "🔧 Improved Stability",
          description: "Enhanced game state management and comprehensive error handling",
          highlight: true,
        },
        {
          title: "🎨 UI Enhancements",
          description: "Better gradients, improved spacing, and modern visual design throughout",
          highlight: true,
        },
        {
          title: "🎯 Fixed Animation Issues",
          description: "Optimized player turn indicator (now 1 blink per 5 seconds) and win celebrations",
        },
        {
          title: "⚡ Performance Improvements",
          description: "Fixed infinite re-render issues and optimized game logic for smooth gameplay",
        },
        {
          title: "🧹 Simplified Navigation",
          description: "Streamlined sidebar and removed non-functional sign-out buttons",
        },
        {
          title: "📱 Responsive Design",
          description: "Improved mobile experience with better touch interactions",
        },
        {
          title: "🚀 Performance Boost",
          description: "Faster loading times, smoother animations, and optimized rendering",
        },
        {
          title: "🎨 Visual Enhancements",
          description: "Improved game board design with gradient effects and smooth transitions",
        },
      ],
    },
  ]

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="relative group bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 hover:border-indigo-500/30 hover:from-indigo-500/20 hover:to-purple-500/20"
      >
        <Sparkles className="h-4 w-4 mr-2 text-indigo-500" />
        What&apos;s New
        {!hasSeenUpdate && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-1.5 py-0.5 text-[10px]">
          2.1
        </Badge>
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 sm:p-6">
      <div className="relative w-full max-w-[95vw] sm:max-w-2xl max-h-[80vh] bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 rounded-lg border border-indigo-500/20 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-50" />
          <div className="relative p-4 sm:p-6">
            <div className="text-left pb-4 mb-4 border-b border-indigo-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-indigo-500" />
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                    What&apos;s New in TicTacMaster
                  </h2>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              <p className="text-muted-foreground mt-2">
                Discover the latest features and improvements we&apos;ve added to make your gaming experience even
                better!
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-[50vh] overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-8">
            {updates.map((update, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none px-3 py-1"
                    variant="outline"
                  >
                    Version {update.version}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{update.date}</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{update.title}</h3>
                <p className="text-muted-foreground mb-6">{update.description}</p>

                <div className="grid gap-4">
                  {update.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className={`relative overflow-hidden rounded-lg border p-4 transition-all ${
                        feature.highlight
                          ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30 shadow-md"
                          : "bg-background border-border hover:border-indigo-500/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-1">{feature.title}</h4>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Credits Section */}
            <div className="mt-12 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-slate-100/50 to-indigo-100/50 dark:from-slate-800/50 dark:to-indigo-900/50 border border-indigo-500/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h3 className="text-xl font-bold">Created with passion by</h3>
                </div>

                <div className="mb-4">
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-2">
                    Abdullah Al Masum
                  </h4>
                  <p className="text-muted-foreground">Thanks to him for making this awesome game! 🎮✨</p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => window.open("https://github.com/devAbdullahAlMasum", "_blank")}
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-pink-900/20 dark:hover:to-purple-900/20"
                    onClick={() => window.open("https://instagram.com/abdullah_al_masum_vt", "_blank")}
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">Follow for more awesome projects and updates!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Enjoy the new features and happy gaming! 🎯</p>
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
