"use client"

import { useState, useEffect } from "react"
import { loadVoiceData, getCategories, getSubCategories, getVoices, type Voice } from "@/lib/voice-data"
import { useMIDI } from "@/lib/midi-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { getVoiceIcon, getSubCategoryColor } from "@/lib/voice-icons"
import Icon from "@mdi/react"

interface VoiceBrowserProps {
  currentPart: number | null
  onVoiceAssigned: (voice: Voice) => void
  onCancel: () => void
}

const PART_NAMES = ["Left", "Right 1", "Right 2", "Right 3"]

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Piano: "text-blue-400",
    "E.Piano": "text-purple-400",
    Organ: "text-red-400",
    Accordion: "text-orange-400",
    "Chromatic Perc": "text-yellow-400",
    Guitar: "text-amber-400",
    Bass: "text-green-400",
    Strings: "text-emerald-400",
    Ensemble: "text-teal-400",
    Brass: "text-cyan-400",
    "Reed/Pipe": "text-sky-400",
    "Synth Lead": "text-indigo-400",
    "Synth Pad": "text-violet-400",
    "Synth Comping": "text-fuchsia-400",
    "Synth SFX": "text-pink-400",
    Ethnic: "text-rose-400",
    Percussive: "text-orange-400",
    "Sound Effect": "text-lime-400",
    "Choir/Vox": "text-blue-300",
    Woodwind: "text-green-300",
  }
  return colors[category] || "text-amber-400"
}

export function VoiceBrowser({ currentPart, onVoiceAssigned, onCancel }: VoiceBrowserProps) {
  const { api } = useMIDI()
  const [voices, setVoices] = useState<Voice[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [subCategories, setSubCategories] = useState<string[]>([])
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [voiceList, setVoiceList] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadVoiceData().then((data) => {
      setVoices(data)
      setCategories(getCategories(data))
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const subs = getSubCategories(voices, selectedCategory)
      setSubCategories(subs)
      setSelectedSubCategory(null)
      setVoiceList([])
    }
  }, [selectedCategory, voices])

  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      const voicesList = getVoices(voices, selectedCategory, selectedSubCategory)
      setVoiceList(voicesList)
    }
  }, [selectedCategory, selectedSubCategory, voices])

  const filteredVoices = searchQuery
    ? voices.filter((voice) => voice.voice.toLowerCase().includes(searchQuery.toLowerCase()))
    : voiceList

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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black via-zinc-950 to-zinc-900">
      {/* Header */}
      <div className="p-6 border-b border-amber-500/20 bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-zinc-900/80 backdrop-blur-xl space-y-4 shadow-2xl shadow-black/50">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/70 group-focus-within:text-amber-400 transition-colors" />
          <Input
            type="text"
            placeholder="Search voices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-16 text-base bg-zinc-900/90 border-2 border-amber-500/30 rounded-2xl shadow-xl shadow-amber-500/10 focus:border-amber-500 focus:shadow-amber-500/30 transition-all text-white placeholder:text-zinc-500 font-medium"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6 py-6 bg-zinc-900/90 border-2 border-amber-500/30 hover:border-amber-500 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-amber-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedVoice || currentPart === null}
            className="flex-1 glossy-button font-bold text-base py-6 rounded-xl shadow-xl"
          >
            {selectedVoice && currentPart !== null ? `Assign to ${PART_NAMES[currentPart - 1]}` : "Select Voice"}
          </Button>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex-1 grid grid-cols-3 gap-6 p-6 overflow-hidden">
        {/* Column 1: Categories */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></span>
            CATEGORIES
          </h3>
          <ScrollArea className="flex-1">
            <div className="space-y-2.5 pr-3">
              {categories.map((category) => {
                const iconPath = getVoiceIcon(category)
                const iconColor = getCategoryColor(category)

                return (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "w-full justify-start px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 group shadow-lg",
                      selectedCategory === category
                        ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black shadow-2xl shadow-amber-500/60 scale-[1.02]"
                        : "bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 hover:from-zinc-800/90 hover:to-zinc-800/60 text-white border-2 border-amber-500/20 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        selectedCategory === category ? "bg-black/20" : "bg-zinc-800/50 group-hover:bg-zinc-700/50",
                      )}
                    >
                      <Icon
                        path={iconPath}
                        size={0.9}
                        className={cn("flex-shrink-0", selectedCategory === category ? "text-black" : iconColor)}
                      />
                    </div>
                    <span className="flex-1 text-left">{category}</span>
                    <span
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full font-bold",
                        selectedCategory === category
                          ? "bg-black/30 text-black"
                          : "bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30",
                      )}
                    >
                      {getCategoryCount(category)}
                    </span>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Column 2: Sub-Categories */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></span>
            SUB-CATEGORIES
          </h3>
          <ScrollArea className="flex-1">
            {selectedCategory ? (
              <div className="space-y-2.5 pr-3">
                {subCategories.map((sub) => {
                  const iconPath = getVoiceIcon(sub, selectedCategory)
                  const iconColor = getSubCategoryColor(sub, selectedCategory)

                  return (
                    <Button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={cn(
                        "w-full justify-start px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 group shadow-lg",
                        selectedSubCategory === sub
                          ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black shadow-2xl shadow-amber-500/60 scale-[1.02]"
                          : "bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 hover:from-zinc-800/90 hover:to-zinc-800/60 text-white border-2 border-amber-500/20 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20",
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          selectedSubCategory === sub ? "bg-black/20" : "bg-zinc-800/50 group-hover:bg-zinc-700/50",
                        )}
                      >
                        <Icon
                          path={iconPath}
                          size={0.9}
                          className={cn("flex-shrink-0", selectedSubCategory === sub ? "text-black" : iconColor)}
                        />
                      </div>
                      <span className="flex-1 text-left">{sub}</span>
                      <span
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full font-bold",
                          selectedSubCategory === sub
                            ? "bg-black/30 text-black"
                            : "bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30",
                        )}
                      >
                        {getSubCategoryCount(sub)}
                      </span>
                    </Button>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-zinc-500 py-8 font-medium">Select a category</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Column 3: Voices */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></span>
            VOICES
          </h3>
          <ScrollArea className="flex-1">
            {selectedSubCategory ? (
              <div className="space-y-2.5 pr-3">
                {filteredVoices.map((voice, index) => {
                  const iconPath = getVoiceIcon(voice.sub, selectedCategory || undefined)
                  const iconColor = getSubCategoryColor(voice.sub, selectedCategory || undefined)

                  return (
                    <Button
                      key={index}
                      onClick={() => setSelectedVoice(voice)}
                      className={cn(
                        "w-full justify-start px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 shadow-lg",
                        selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                          ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black shadow-2xl shadow-amber-500/60 scale-[1.02]"
                          : "bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 hover:from-zinc-800/90 hover:to-zinc-800/60 text-white border-2 border-amber-500/20 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20",
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          selectedVoice?.voice === voice.voice
                            ? "bg-black/20"
                            : "bg-zinc-800/50 group-hover:bg-zinc-700/50",
                        )}
                      >
                        <Icon
                          path={iconPath}
                          size={0.9}
                          className={cn(
                            "flex-shrink-0",
                            selectedVoice?.voice === voice.voice ? "text-black" : iconColor,
                          )}
                        />
                      </div>
                      <span className="text-left">{voice.voice}</span>
                    </Button>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-zinc-500 py-8 font-medium">Select a sub-category</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
