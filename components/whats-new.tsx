"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Check, X, ChevronDown, ChevronUp, Github, Instagram } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function WhatsNew() {
  const [open, setOpen] = useState(false)
  const [expandedVersion, setExpandedVersion] = useState<string | null>("v2.2")

  const handleOpen = () => {
    setOpen(true)
  }

  const toggleVersion = (version: string) => {
    setExpandedVersion(expandedVersion === version ? null : version)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white touch-manipulation"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          What's New
          <Badge className="ml-2 bg-blue-500 hover:bg-blue-600" variant="default">v2.2</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              What's New in TicTacMaster
            </DialogTitle>
            <DialogDescription>Check out the latest features and improvements</DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden px-6">
          <Tabs defaultValue="current" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4 flex-shrink-0">
              <TabsTrigger value="current">Current Update</TabsTrigger>
              <TabsTrigger value="history">Update History</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2 pb-4" style={{ maxHeight: "calc(90vh - 180px)" }}>
              <TabsContent value="current" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    Version 2.2
                    <Badge className="ml-2 bg-blue-500" variant="default">Current</Badge>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVersion("v2.2")}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    {expandedVersion === "v2.2" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedVersion === "v2.2" && (
                  <div className="space-y-4 pl-2">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Hear the Fun! Sound & Haptics Update</h3>
                      <ul className="space-y-2">
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Click sounds have been added to all buttons for a more satisfying feel.</span>
                        </li>
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Hear unique sounds when you make a move, win, or draw a game.</span>
                        </li>
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Feel the game with vibration feedback on your phone.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Smoother Experience</h3>
                      <ul className="space-y-2">
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Fixed a bug that could cause visual glitches when the app first loads.</span>
                        </li>
                        <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>Made sure all sounds play reliably without any errors.</span>
                        </li>
                         <li className="flex gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span>General performance improvements for a faster experience.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Credits section for Current tab */}
                <div className="mt-8 pt-6 border-t text-center">
                  <p className="text-sm font-medium">Created with passion by</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400">Abdullah Al Masum</p>
                  <p className="text-xs text-muted-foreground mt-1">Thanks to him for making this awesome game! 🎮✨</p>

                  <div className="flex justify-center gap-4 mt-3">
                    <a
                      href="https://github.com/devAbdullahAlMasum"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                    <a
                      href="https://instagram.com/abdullah_al_masum_vt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Follow for more awesome projects and updates!</p>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-4">
                {/* Version 2.1 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Version 2.1</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVersion("v2.1")}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      {expandedVersion === "v2.1" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedVersion === "v2.1" && (
                    <div className="space-y-4 pl-2 mt-2">
                      <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
                        <h3 className="text-lg font-semibold mb-2">Local Multiplayer & Optimizations</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Play with friends on the same device plus performance improvements and optimizations!
                        </p>

                        <ul className="space-y-3">
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-green-600">👥</span>
                            <div>
                              <span className="font-medium">Local Multiplayer Mode</span>
                              <p className="text-sm text-muted-foreground">
                                Play with friends on the same device - perfect for face-to-face gaming
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-blue-600">🔄</span>
                            <div>
                              <span className="font-medium">Turn-Based Gameplay</span>
                              <p className="text-sm text-muted-foreground">
                                Automatic turn management for 2-4 players on one device
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-purple-600">📊</span>
                            <div>
                              <span className="font-medium">Score Tracking</span>
                              <p className="text-sm text-muted-foreground">
                                Keep track of wins across multiple rounds in local games
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-amber-600">⚡</span>
                            <div>
                              <span className="font-medium">Performance Optimizations</span>
                              <p className="text-sm text-muted-foreground">
                                Improved game logic and faster rendering for smoother gameplay
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-pink-600">🎨</span>
                            <div>
                              <span className="font-medium">Enhanced UI</span>
                              <p className="text-sm text-muted-foreground">
                                Better visual indicators and improved user experience
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-red-600">🐛</span>
                            <div>
                              <span className="font-medium">Bug Fixes</span>
                              <p className="text-sm text-muted-foreground">
                                Fixed various issues and improved overall stability
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Version 2.0 */}
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Version 2.0</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVersion("v2.0")}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      {expandedVersion === "v2.0" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedVersion === "v2.0" && (
                    <div className="space-y-4 pl-2 mt-2">
                      <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold">Single Player & Enhanced Experience</h3>
                          <p className="text-xs text-muted-foreground">June 1, 2025</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Play against AI opponents with multiple difficulty levels and board sizes, plus stability and
                          visual improvements!
                        </p>

                        <ul className="space-y-3">
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-blue-600">🤖</span>
                            <div>
                              <span className="font-medium">Single Player Mode</span>
                              <p className="text-sm text-muted-foreground">
                                Play against AI with Easy, Medium, and Hard difficulty levels
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-purple-600">📐</span>
                            <div>
                              <span className="font-medium">Multiple Board Sizes</span>
                              <p className="text-sm text-muted-foreground">
                                Choose between 3×3, 4×4, and 5×5 grid sizes for different challenges
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-amber-600">✨</span>
                            <div>
                              <span className="font-medium">Enhanced Win Animations</span>
                              <p className="text-sm text-muted-foreground">
                                Beautiful celebration effects with confetti and particle animations
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-green-600">🔧</span>
                            <div>
                              <span className="font-medium">Improved Stability</span>
                              <p className="text-sm text-muted-foreground">
                                Enhanced game state management and comprehensive error handling
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-pink-600">🎨</span>
                            <div>
                              <span className="font-medium">UI Enhancements</span>
                              <p className="text-sm text-muted-foreground">
                                Better gradients, improved spacing, and modern visual design throughout
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-red-600">🎯</span>
                            <div>
                              <span className="font-medium">Fixed Animation Issues</span>
                              <p className="text-sm text-muted-foreground">
                                Optimized player turn indicator and win celebrations
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-yellow-600">⚡</span>
                            <div>
                              <span className="font-medium">Performance Improvements</span>
                              <p className="text-sm text-muted-foreground">
                                Fixed infinite re-render issues and optimized game logic for smooth gameplay
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-teal-600">🧹</span>
                            <div>
                              <span className="font-medium">Simplified Navigation</span>
                              <p className="text-sm text-muted-foreground">
                                Streamlined sidebar and removed non-functional sign-out buttons
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <span className="flex-shrink-0 font-bold text-indigo-600">📱</span>
                            <div>
                              <span className="font-medium">Responsive Design</span>
                              <p className="text-sm text-muted-foreground">
                                Improved mobile experience with better touch interactions
                              </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Credits section for History tab */}
                <div className="mt-8 pt-6 border-t text-center">
                  <p className="text-sm font-medium">Created with passion by</p>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400">Abdullah Al Masum</p>
                  <p className="text-xs text-muted-foreground mt-1">Thanks to him for making this awesome game! 🎮✨</p>

                  <div className="flex justify-center gap-4 mt-3">
                    <a
                      href="https://github.com/devAbdullahAlMasum"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                    <a
                      href="https://instagram.com/abdullah_al_masum_vt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Follow for more awesome projects and updates!</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="p-6 pt-0">
          <DialogFooter className="sm:justify-between flex-row">
            <Button variant="outline" onClick={() => setOpen(false)} className="touch-manipulation">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={() => setOpen(false)} className="bg-blue-600 hover:bg-blue-700 touch-manipulation">
              <Check className="h-4 w-4 mr-2" />
              Got it
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
