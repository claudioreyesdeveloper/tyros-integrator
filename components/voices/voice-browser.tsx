"use client"

import { useState, useEffect, useRef } from "react"
import { loadVoiceData, getCategories, getSubCategories, getVoices, type Voice } from "@/lib/voice-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { VoiceCommandPalette } from "./voice-command-palette"
import { ChevronRight, Command } from "lucide-react"
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
    <div className="h-full flex flex-col p-4 md:p-5 lg:p-6 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="mb-4 md:mb-5 lg:mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex-1 flex items-center gap-3 px-5 py-4 bg-zinc-900/80 border-2 border-amber-500/30 rounded-xl hover:border-amber-500 hover:bg-zinc-800 transition-all group"
        >
          <Command className="w-5 h-5 text-amber-500/70 group-hover:text-amber-500 transition-colors" />
          <span className="text-white text-sm md:text-base">Search voices...</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-amber-500/70 bg-zinc-800 rounded border border-amber-500/20">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
          className="px-6 md:px-7 lg:px-8 h-12 md:h-13 lg:h-14 text-sm md:text-base bg-zinc-900/80 border-2 border-amber-500/30 hover:border-amber-500 hover:bg-zinc-800 text-white rounded-xl shadow-lg transition-all"
        >
          Cancel
        </Button>
        <Button
          size="lg"
          onClick={handleAssign}
          disabled={!selectedVoice || currentPart === null}
          className="glossy-button px-6 md:px-7 lg:px-8 h-12 md:h-13 lg:h-14 font-semibold text-sm md:text-base lg:text-lg"
        >
          {selectedVoice && currentPart !== null ? `Assign to ${PART_NAMES[currentPart - 1]}` : "Select Voice"}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 overflow-hidden">
        <div className="glossy-panel overflow-hidden flex flex-col">
          <div className="px-4 md:px-5 lg:px-6 py-3 md:py-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b-2 border-amber-500/30">
            <h3 className="premium-label text-xs md:text-sm">CATEGORIES</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 md:p-3 space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center justify-between group",
                    selectedCategory === category
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50"
                      : "bg-zinc-900/50 hover:bg-zinc-800/80 text-white border border-amber-500/20 hover:border-amber-500/40",
                  )}
                >
                  <span className="truncate">
                    {category} ({getCategoryCount(category)})
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="glossy-panel overflow-hidden flex flex-col">
          <div className="px-4 md:px-5 lg:px-6 py-3 md:py-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b-2 border-amber-500/30">
            <h3 className="premium-label text-xs md:text-sm">SUB-CATEGORIES</h3>
          </div>
          <ScrollArea className="flex-1">
            {selectedCategory ? (
              <div className="p-2 md:p-3 space-y-2">
                {subCategories.map((sub) => {
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={cn(
                        "w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 md:gap-3 group",
                        selectedSubCategory === sub
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50"
                          : "bg-zinc-900/50 hover:bg-zinc-800/80 text-white border border-amber-500/20 hover:border-amber-500/40",
                      )}
                    >
                      <VoiceIcon subcategory={sub} category={selectedCategory} size={20} />
                      <span className="truncate">
                        {sub} ({getSubCategoryCount(sub)})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 ml-auto" />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-sm">
                Select a category
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="glossy-panel overflow-hidden flex flex-col">
          <div className="px-4 md:px-5 lg:px-6 py-3 md:py-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b-2 border-amber-500/30">
            <h3 className="premium-label text-xs md:text-sm">VOICES</h3>
          </div>
          <ScrollArea className="flex-1">
            {selectedSubCategory ? (
              <div className="p-2 md:p-3 space-y-2">
                {voiceList.length > 0 ? (
                  voiceList.map((voice, index) => {
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedVoice(voice)}
                        className={cn(
                          "w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-2 md:gap-3",
                          selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50"
                            : "bg-zinc-900/50 hover:bg-zinc-800/80 text-white border border-amber-500/20 hover:border-amber-500/40",
                        )}
                      >
                        <VoiceIcon subcategory={voice.sub} category={voice.category} size={20} />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{voice.voice}</div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-sm p-4 text-center">
                    No voices found
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs md:text-sm">
                Select a sub-category
              </div>
            )}
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
