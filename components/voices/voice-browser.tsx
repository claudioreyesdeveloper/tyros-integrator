"use client"

import { useState, useEffect, useRef } from "react"
import { loadVoiceData, getCategories, getSubCategories, getVoices, type Voice } from "@/lib/voice-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { VoiceCommandPalette } from "./voice-command-palette"
import { ChevronRight, Command, Star, Clock, Menu, X, Home, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMIDI } from "@/lib/midi-context"

interface VoiceBrowserProps {
  currentPart: number | null
  onVoiceAssigned: (voice: Voice) => void
  onCancel: () => void
}

const PART_NAMES = ["Left", "Right 1", "Right 2", "Right 3"]

const STORAGE_KEYS = {
  FAVORITES: "tyros-voice-favorites",
  RECENT: "tyros-voice-recent",
  USAGE_COUNTS: "tyros-voice-usage-counts",
  SESSION: "tyros-voice-session",
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

function loadFromSessionStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = sessionStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToSessionStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Failed to save to sessionStorage:", error)
  }
}

export function VoiceBrowser({ currentPart, onVoiceAssigned, onCancel }: VoiceBrowserProps) {
  const [voices, setVoices] = useState<Voice[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [subCategories, setSubCategories] = useState<string[]>([])
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [voiceList, setVoiceList] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [recentVoices, setRecentVoices] = useState<Voice[]>([])
  const [favorites, setFavorites] = useState<Voice[]>([])
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({})
  const [sessionVoices, setSessionVoices] = useState<Voice[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { api } = useMIDI()
  const isSelectingFromSearch = useRef(false)

  useEffect(() => {
    setFavorites(loadFromStorage(STORAGE_KEYS.FAVORITES, []))
    setRecentVoices(loadFromStorage(STORAGE_KEYS.RECENT, []))
    setUsageCounts(loadFromStorage(STORAGE_KEYS.USAGE_COUNTS, {}))
    setSessionVoices(loadFromSessionStorage(STORAGE_KEYS.SESSION, []))
  }, [])

  useEffect(() => {
    loadVoiceData().then((data) => {
      setVoices(data)
      setCategories(getCategories(data))
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const subs = getSubCategories(voices, selectedCategory)
      setSubCategories(subs)
      if (!isSelectingFromSearch.current) {
        setSelectedSubCategory(null)
        setVoiceList([])
      }
      isSelectingFromSearch.current = false
    }
  }, [selectedCategory, voices])

  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      const voicesList = getVoices(voices, selectedCategory, selectedSubCategory)
      setVoiceList(voicesList)
    }
  }, [selectedCategory, selectedSubCategory, voices])

  const getCategoryCount = (category: string) => {
    return getSubCategories(voices, category).length
  }

  const getSubCategoryCount = (subCategory: string) => {
    if (!selectedCategory) return 0
    return getVoices(voices, selectedCategory, subCategory).length
  }

  const getVoiceKey = (voice: Voice) => `${voice.voice}-${voice.msb}-${voice.lsb}`

  const getMostUsedVoices = () => {
    const sortedEntries = Object.entries(usageCounts).sort(([, a], [, b]) => b - a)
    return sortedEntries
      .slice(0, 5)
      .map(([key]) => {
        return voices.find((v) => getVoiceKey(v) === key)
      })
      .filter((v): v is Voice => v !== undefined)
  }

  const handleAssign = () => {
    if (selectedVoice && currentPart !== null) {
      api.sendCommand({
        type: "voice",
        action: "assign",
        part: currentPart,
        voice: selectedVoice,
      })
      onVoiceAssigned(selectedVoice)

      const newRecent = [
        selectedVoice,
        ...recentVoices.filter((v) => getVoiceKey(v) !== getVoiceKey(selectedVoice)),
      ].slice(0, 10)
      setRecentVoices(newRecent)
      saveToStorage(STORAGE_KEYS.RECENT, newRecent)

      const voiceKey = getVoiceKey(selectedVoice)
      const newCounts = { ...usageCounts, [voiceKey]: (usageCounts[voiceKey] || 0) + 1 }
      setUsageCounts(newCounts)
      saveToStorage(STORAGE_KEYS.USAGE_COUNTS, newCounts)

      const newSession = [
        selectedVoice,
        ...sessionVoices.filter((v) => getVoiceKey(v) !== getVoiceKey(selectedVoice)),
      ].slice(0, 10)
      setSessionVoices(newSession)
      saveToSessionStorage(STORAGE_KEYS.SESSION, newSession)
    }
  }

  const handleCommandPaletteSelect = (voice: Voice, action?: string) => {
    isSelectingFromSearch.current = true

    setSelectedCategory(voice.category)
    setSelectedSubCategory(voice.sub)
    setSelectedVoice(voice)

    if (action === "assign" && currentPart !== null) {
      handleAssign()
    }
  }

  const toggleFavorite = (voice: Voice) => {
    const newFavorites = favorites.some((v) => getVoiceKey(v) === getVoiceKey(voice))
      ? favorites.filter((v) => getVoiceKey(v) !== getVoiceKey(voice))
      : [voice, ...favorites]

    setFavorites(newFavorites)
    saveToStorage(STORAGE_KEYS.FAVORITES, newFavorites)
  }

  const isFavorite = (voice: Voice) => {
    return favorites.some((v) => getVoiceKey(v) === getVoiceKey(voice))
  }

  const getBreadcrumbs = () => {
    const crumbs = []
    if (selectedCategory) {
      crumbs.push(selectedCategory)
      if (selectedSubCategory) {
        crumbs.push(selectedSubCategory)
      }
    }
    return crumbs
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }

  const handleSubCategorySelect = (sub: string) => {
    setSelectedSubCategory(sub)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }

  const handleSmartCollectionSelect = (voice: Voice) => {
    setSelectedVoice(voice)
    setSelectedCategory(voice.category)
    setSelectedSubCategory(voice.sub)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading voice library...</p>
        </div>
      </div>
    )
  }

  const mostUsedVoices = getMostUsedVoices()

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="p-3 sm:p-4 border-b border-amber-500/20 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 flex-shrink-0"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/80 border border-amber-500/30 rounded-lg hover:border-amber-500 hover:bg-zinc-800 transition-all group min-w-0"
          >
            <Command className="w-4 h-4 text-amber-500/70 group-hover:text-amber-500 transition-colors flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm truncate">Search voices...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-amber-500/70 bg-zinc-800 rounded border border-amber-500/20 flex-shrink-0">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          <Button
            variant="outline"
            onClick={onCancel}
            className="hidden sm:flex px-4 bg-zinc-900/80 border border-amber-500/30 hover:border-amber-500 hover:bg-zinc-800 text-white flex-shrink-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedVoice || currentPart === null}
            className="glossy-button px-3 sm:px-6 font-semibold text-xs sm:text-sm flex-shrink-0"
          >
            <span className="hidden sm:inline">
              {selectedVoice && currentPart !== null ? `Assign to ${PART_NAMES[currentPart - 1]}` : "Select Voice"}
            </span>
            <span className="sm:hidden">{selectedVoice && currentPart !== null ? `Assign` : "Select"}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={cn(
            "w-64 border-r border-amber-500/20 bg-zinc-900/95 backdrop-blur-sm flex flex-col transition-transform duration-300 ease-in-out",
            "fixed lg:relative z-30 lg:z-0 h-full top-0 left-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white">Navigation</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="px-2">
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Smart Collections</h2>
                </div>

                {favorites.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                        Favorites ({favorites.length})
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {favorites.slice(0, 5).map((voice, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSmartCollectionSelect(voice)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-amber-500/10 transition-colors flex items-center gap-2"
                        >
                          <VoiceIcon subcategory={voice.sub} category={voice.category} size={16} />
                          <span className="truncate">{voice.voice}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mostUsedVoices.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <h3 className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Most Used</h3>
                    </div>
                    <div className="space-y-1">
                      {mostUsedVoices.map((voice, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSmartCollectionSelect(voice)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                        >
                          <VoiceIcon subcategory={voice.sub} category={voice.category} size={16} />
                          <span className="truncate flex-1">{voice.voice}</span>
                          <span className="text-[10px] text-purple-500/70 font-mono">
                            {usageCounts[getVoiceKey(voice)]}×
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sessionVoices.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Zap className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">This Session</h3>
                    </div>
                    <div className="space-y-1">
                      {sessionVoices.slice(0, 5).map((voice, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSmartCollectionSelect(voice)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
                        >
                          <VoiceIcon subcategory={voice.sub} category={voice.category} size={16} />
                          <span className="truncate">{voice.voice}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {recentVoices.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Recent</h3>
                    </div>
                    <div className="space-y-1">
                      {recentVoices.slice(0, 5).map((voice, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSmartCollectionSelect(voice)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-blue-500/10 transition-colors flex items-center gap-2"
                        >
                          <VoiceIcon subcategory={voice.sub} category={voice.category} size={16} />
                          <span className="truncate">{voice.voice}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Home className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Categories</h3>
                </div>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group",
                        selectedCategory === category
                          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40"
                          : "text-white hover:bg-zinc-800/50 border border-transparent",
                      )}
                    >
                      <span className="truncate">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">{getCategoryCount(category)}</span>
                        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {getBreadcrumbs().length > 0 && (
            <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-amber-500/20 bg-zinc-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubCategory(null)
                  }}
                  className="text-amber-500 hover:text-amber-400 transition-colors whitespace-nowrap"
                >
                  Home
                </button>
                {getBreadcrumbs().map((crumb, idx) => (
                  <div key={idx} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4 text-zinc-600" />
                    <button
                      onClick={() => {
                        if (idx === 0) {
                          setSelectedSubCategory(null)
                        }
                      }}
                      className={cn(
                        "transition-colors whitespace-nowrap",
                        idx === getBreadcrumbs().length - 1
                          ? "text-white font-medium"
                          : "text-zinc-400 hover:text-white",
                      )}
                    >
                      {crumb}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="p-3 sm:p-6">
              {!selectedCategory && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="group relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-amber-500/20 hover:border-amber-500/60 transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20"
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-yellow-500/30 transition-all">
                          <VoiceIcon subcategory="" category={category} size={24} className="sm:w-8 sm:h-8" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm sm:text-lg mb-0.5 sm:mb-1">{category}</h3>
                          <p className="text-[10px] sm:text-xs text-zinc-500">
                            {getCategoryCount(category)} sub-categories
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedCategory && !selectedSubCategory && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSubCategorySelect(sub)}
                      className="group relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-emerald-500/20 hover:border-emerald-500/60 transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                          <VoiceIcon
                            subcategory={sub}
                            category={selectedCategory}
                            size={24}
                            className="sm:w-8 sm:h-8"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm sm:text-base mb-0.5 sm:mb-1">{sub}</h3>
                          <p className="text-[10px] sm:text-xs text-zinc-500">{getSubCategoryCount(sub)} voices</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedCategory && selectedSubCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {voiceList.map((voice, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVoice(voice)}
                      className={cn(
                        "group relative p-3 sm:p-4 rounded-lg transition-all text-left",
                        selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                          ? "bg-gradient-to-br from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50 scale-105"
                          : "bg-zinc-900/60 border border-blue-500/20 hover:border-blue-500/60 hover:bg-zinc-800/80 text-white",
                      )}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                              ? "bg-black/20"
                              : "bg-blue-500/10 group-hover:bg-blue-500/20",
                          )}
                        >
                          <VoiceIcon
                            subcategory={voice.sub}
                            category={voice.category}
                            size={16}
                            className="sm:w-5 sm:h-5"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">{voice.voice}</h4>
                          <p
                            className={cn(
                              "text-[10px] sm:text-xs truncate",
                              selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                                ? "text-black/70"
                                : "text-zinc-500",
                            )}
                          >
                            MSB: {voice.msb} | PRG: {voice.prg}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(voice)
                          }}
                          className={cn(
                            "flex-shrink-0 transition-colors",
                            isFavorite(voice) ? "text-amber-500" : "text-zinc-600 hover:text-amber-500",
                          )}
                        >
                          <Star
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                            fill={isFavorite(voice) ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <VoiceCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        voices={voices}
        onSelectVoice={handleCommandPaletteSelect}
        recentVoices={recentVoices}
        favorites={favorites}
        currentPart={currentPart}
      />
    </div>
  )
}
