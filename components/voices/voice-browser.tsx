"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Clock, TrendingUp, Calendar, ChevronRight, Menu, X, Home } from "lucide-react"
import type { Voice } from "@/lib/tyros-api"
import {
  VOICE_DATABASE,
  getVoiceCategories,
  getVoiceSubCategories,
  getVoicesBySubCategory,
  searchVoices,
} from "@/lib/voice-data"
import { getVoiceIcon } from "@/lib/voice-icons"
import { VoiceCommandPalette } from "./voice-command-palette"

interface VoiceBrowserProps {
  currentPart: number | null
  onVoiceAssigned: (voice: Voice) => void
  onCancel: () => void
}

export function VoiceBrowser({ currentPart, onVoiceAssigned, onCancel }: VoiceBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<Voice | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [favorites, setFavorites] = useState<Voice[]>([])
  const [recentVoices, setRecentVoices] = useState<Voice[]>([])
  const [mostUsed, setMostUsed] = useState<Array<{ voice: Voice; count: number }>>([])
  const [sessionVoices, setSessionVoices] = useState<Voice[]>([])
  const isSelectingFromSearch = useRef(false)

  // Load from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("tyros5-favorites")
    const savedRecent = localStorage.getItem("tyros5-recent")
    const savedUsage = localStorage.getItem("tyros5-usage")
    const savedSession = sessionStorage.getItem("tyros5-session")

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedRecent) setRecentVoices(JSON.parse(savedRecent))
    if (savedUsage) setMostUsed(JSON.parse(savedUsage))
    if (savedSession) setSessionVoices(JSON.parse(savedSession))
  }, [])

  // Reset sub-category when category changes
  useEffect(() => {
    if (!isSelectingFromSearch.current) {
      setSelectedSubCategory(null)
    }
    isSelectingFromSearch.current = false
  }, [selectedCategory])

  // Handle voice selection
  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice)
    onVoiceAssigned(voice)

    // Update recent voices
    const newRecent = [voice, ...recentVoices.filter((v) => v.name !== voice.name)].slice(0, 10)
    setRecentVoices(newRecent)
    localStorage.setItem("tyros5-recent", JSON.stringify(newRecent))

    // Update session voices
    const newSession = [voice, ...sessionVoices.filter((v) => v.name !== voice.name)].slice(0, 10)
    setSessionVoices(newSession)
    sessionStorage.setItem("tyros5-session", JSON.stringify(newSession))

    // Update usage count
    const usage = [...mostUsed]
    const existing = usage.find((u) => u.voice.name === voice.name)
    if (existing) {
      existing.count++
    } else {
      usage.push({ voice, count: 1 })
    }
    usage.sort((a, b) => b.count - a.count)
    const newMostUsed = usage.slice(0, 5)
    setMostUsed(newMostUsed)
    localStorage.setItem("tyros5-usage", JSON.stringify(newMostUsed))

    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  // Handle command palette selection
  const handleCommandPaletteSelect = (voice: Voice) => {
    isSelectingFromSearch.current = true
    setSelectedCategory(voice.category)
    setSelectedSubCategory(voice.sub)
    handleVoiceSelect(voice)
  }

  // Toggle favorite
  const toggleFavorite = (voice: Voice, e: React.MouseEvent) => {
    e.stopPropagation()
    const isFavorite = favorites.some((v) => v.name === voice.name)
    const newFavorites = isFavorite ? favorites.filter((v) => v.name !== voice.name) : [...favorites, voice]
    setFavorites(newFavorites)
    localStorage.setItem("tyros5-favorites", JSON.stringify(newFavorites))
  }

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = []
    if (selectedCategory) crumbs.push(selectedCategory)
    if (selectedSubCategory) crumbs.push(selectedSubCategory)
    return crumbs
  }

  // Get content to display
  const categories = getVoiceCategories()
  const subCategories = selectedCategory ? getVoiceSubCategories(selectedCategory) : []
  const voiceList =
    selectedCategory && selectedSubCategory ? getVoicesBySubCategory(selectedCategory, selectedSubCategory) : []
  const searchResults = searchQuery.trim() ? searchVoices(searchQuery) : []

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex h-full relative">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Voice Browser</h2>
            {currentPart && <p className="text-xs text-muted-foreground">Part {currentPart}</p>}
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Smart Collections */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-2">Smart Collections</h3>

              {favorites.length > 0 && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubCategory(null)
                    setSearchQuery("")
                  }}
                >
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Favorites
                  <Badge variant="secondary" className="ml-auto">
                    {favorites.length}
                  </Badge>
                </Button>
              )}

              {mostUsed.length > 0 && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubCategory(null)
                    setSearchQuery("")
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                  Most Used
                  <Badge variant="secondary" className="ml-auto">
                    {mostUsed.length}
                  </Badge>
                </Button>
              )}

              {sessionVoices.length > 0 && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubCategory(null)
                    setSearchQuery("")
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2 text-green-500" />
                  This Session
                  <Badge variant="secondary" className="ml-auto">
                    {sessionVoices.length}
                  </Badge>
                </Button>
              )}

              {recentVoices.length > 0 && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubCategory(null)
                    setSearchQuery("")
                  }}
                >
                  <Clock className="h-4 w-4 mr-2 text-purple-500" />
                  Recent
                  <Badge variant="secondary" className="ml-auto">
                    {recentVoices.length}
                  </Badge>
                </Button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-2">Categories</h3>
              {categories.map((category) => {
                const Icon = getVoiceIcon(category)
                const count = VOICE_DATABASE.filter((v) => v.category === category).length
                const isActive = selectedCategory === category

                return (
                  <Button
                    key={category}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCategory(category)
                      setSearchQuery("")
                      if (window.innerWidth < 1024) setSidebarOpen(false)
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category}
                    <Badge variant="secondary" className="ml-auto">
                      {count}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden bg-transparent"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voices... (Cmd/Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setCommandPaletteOpen(true)}
                className="pl-9"
              />
            </div>

            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          {/* Breadcrumbs */}
          {getBreadcrumbs().length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null)
                  setSelectedSubCategory(null)
                }}
              >
                <Home className="h-3 w-3" />
              </Button>
              {getBreadcrumbs().map((crumb, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-medium">{crumb}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Search Results ({searchResults.length})</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {searchResults.map((voice) => {
                    const Icon = getVoiceIcon(voice.category)
                    const isFavorite = favorites.some((v) => v.name === voice.name)

                    return (
                      <Card
                        key={`${voice.msb}-${voice.lsb}-${voice.pc}`}
                        className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg cursor-pointer"
                        onClick={() => handleVoiceSelect(voice)}
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm truncate">{voice.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">{voice.category}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => toggleFavorite(voice, e)}
                            >
                              <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : !selectedCategory ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Categories</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => {
                    const Icon = getVoiceIcon(category)
                    const count = VOICE_DATABASE.filter((v) => v.category === category).length

                    return (
                      <Card
                        key={category}
                        className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{category}</h3>
                              <p className="text-sm text-muted-foreground">{count} voices</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : !selectedSubCategory ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{selectedCategory}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {subCategories.map((sub) => {
                    const Icon = getVoiceIcon(selectedCategory)
                    const count = getVoicesBySubCategory(selectedCategory, sub).length

                    return (
                      <Card
                        key={sub}
                        className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg cursor-pointer"
                        onClick={() => setSelectedSubCategory(sub)}
                      >
                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{sub}</h3>
                              <p className="text-sm text-muted-foreground">{count} voices</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{selectedSubCategory}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {voiceList.map((voice) => {
                    const Icon = getVoiceIcon(voice.category)
                    const isFavorite = favorites.some((v) => v.name === voice.name)
                    const isSelected = selectedVoice?.name === voice.name

                    return (
                      <Card
                        key={`${voice.msb}-${voice.lsb}-${voice.pc}`}
                        className={`group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg cursor-pointer ${
                          isSelected ? "border-primary shadow-lg" : ""
                        }`}
                        onClick={() => handleVoiceSelect(voice)}
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm truncate">{voice.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  MSB:{voice.msb} LSB:{voice.lsb} PC:{voice.pc}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => toggleFavorite(voice, e)}
                            >
                              <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Command Palette */}
      <VoiceCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectVoice={handleCommandPaletteSelect}
        voices={VOICE_DATABASE}
        favorites={favorites}
        recentVoices={recentVoices}
      />
    </div>
  )
}
