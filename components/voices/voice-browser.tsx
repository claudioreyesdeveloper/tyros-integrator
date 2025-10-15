"use client"

import { useState, useEffect, useRef } from "react"
import { loadVoiceData, getCategories, getSubCategories, getVoices, type Voice } from "@/lib/voice-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { VoiceCommandPalette } from "./voice-command-palette"
import { ChevronRight, Command, Star, Clock, Menu, X, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMIDI } from "@/lib/midi-context"

interface VoiceBrowserProps {
  currentPart: number | null
  onVoiceAssigned: (voice: Voice) => void
  onCancel: () => void
}

const PART_NAMES = ["Left", "Right 1", "Right 2", "Right 3"]

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { api } = useMIDI()
  const isSelectingFromSearch = useRef(false)

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

  const handleAssign = () => {
    if (selectedVoice && currentPart !== null) {
      api.sendCommand({
        type: "voice",
        action: "assign",
        part: currentPart,
        voice: selectedVoice,
      })
      onVoiceAssigned(selectedVoice)
      setRecentVoices((prev) => {
        const filtered = prev.filter((v) => v.voice !== selectedVoice.voice || v.msb !== selectedVoice.msb)
        return [selectedVoice, ...filtered].slice(0, 10)
      })
    }
  }

  const handleCommandPaletteSelect = (voice: Voice) => {
    isSelectingFromSearch.current = true
    setSelectedVoice(voice)
    setSelectedCategory(voice.category)
    setSelectedSubCategory(voice.sub)
  }

  const toggleFavorite = (voice: Voice) => {
    setFavorites((prev) => {
      const exists = prev.some((v) => v.voice === voice.voice && v.msb === voice.msb)
      if (exists) {
        return prev.filter((v) => v.voice !== voice.voice || v.msb !== voice.msb)
      } else {
        return [voice, ...prev]
      }
    })
  }

  const isFavorite = (voice: Voice) => {
    return favorites.some((v) => v.voice === voice.voice && v.msb === voice.msb)
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="p-4 border-b border-amber-500/20 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-zinc-900/80 border border-amber-500/30 rounded-lg hover:border-amber-500 hover:bg-zinc-800 transition-all group"
          >
            <Command className="w-4 h-4 text-amber-500/70 group-hover:text-amber-500 transition-colors" />
            <span className="text-white text-sm">Search voices...</span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-amber-500/70 bg-zinc-800 rounded border border-amber-500/20">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          <Button
            variant="outline"
            onClick={onCancel}
            className="px-4 bg-zinc-900/80 border border-amber-500/30 hover:border-amber-500 hover:bg-zinc-800 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedVoice || currentPart === null}
            className="glossy-button px-6 font-semibold"
          >
            {selectedVoice && currentPart !== null ? `Assign to ${PART_NAMES[currentPart - 1]}` : "Select Voice"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={cn(
            "w-64 border-r border-amber-500/20 bg-zinc-900/30 backdrop-blur-sm flex flex-col transition-all duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            "absolute lg:relative z-10 h-full lg:z-0",
          )}
        >
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {favorites.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Favorites</h3>
                  </div>
                  <div className="space-y-1">
                    {favorites.slice(0, 5).map((voice, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVoice(voice)
                          setSelectedCategory(voice.category)
                          setSelectedSubCategory(voice.sub)
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-amber-500/10 transition-colors flex items-center gap-2"
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
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider">Recent</h3>
                  </div>
                  <div className="space-y-1">
                    {recentVoices.slice(0, 5).map((voice, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedVoice(voice)
                          setSelectedCategory(voice.category)
                          setSelectedSubCategory(voice.sub)
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-white hover:bg-blue-500/10 transition-colors flex items-center gap-2"
                      >
                        <VoiceIcon subcategory={voice.sub} category={voice.category} size={16} />
                        <span className="truncate">{voice.voice}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Home className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Categories</h3>
                </div>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
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
            <div className="px-6 py-3 border-b border-amber-500/20 bg-zinc-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubCategory(null)
                  }}
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Home
                </button>
                {getBreadcrumbs().map((crumb, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                    <button
                      onClick={() => {
                        if (idx === 0) {
                          setSelectedSubCategory(null)
                        }
                      }}
                      className={cn(
                        "transition-colors",
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
            <div className="p-6">
              {!selectedCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="group relative p-6 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-amber-500/20 hover:border-amber-500/60 transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20"
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-yellow-500/30 transition-all">
                          <VoiceIcon subcategory="" category={category} size={32} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg mb-1">{category}</h3>
                          <p className="text-xs text-zinc-500">{getCategoryCount(category)} sub-categories</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedCategory && !selectedSubCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className="group relative p-6 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-emerald-500/20 hover:border-emerald-500/60 transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                          <VoiceIcon subcategory={sub} category={selectedCategory} size={32} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base mb-1">{sub}</h3>
                          <p className="text-xs text-zinc-500">{getSubCategoryCount(sub)} voices</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedCategory && selectedSubCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {voiceList.map((voice, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVoice(voice)}
                      className={cn(
                        "group relative p-4 rounded-lg transition-all text-left",
                        selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                          ? "bg-gradient-to-br from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50 scale-105"
                          : "bg-zinc-900/60 border border-blue-500/20 hover:border-blue-500/60 hover:bg-zinc-800/80 text-white",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                              ? "bg-black/20"
                              : "bg-blue-500/10 group-hover:bg-blue-500/20",
                          )}
                        >
                          <VoiceIcon subcategory={voice.sub} category={voice.category} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 truncate">{voice.voice}</h4>
                          <p
                            className={cn(
                              "text-xs truncate",
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
                          <Star className="w-4 h-4" fill={isFavorite(voice) ? "currentColor" : "none"} />
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
      />
    </div>
  )
}
