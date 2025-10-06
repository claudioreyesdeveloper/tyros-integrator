"use client"

import { useState, useEffect } from "react"
import { loadVoiceData, getCategories, getSubCategories, getVoices, type Voice } from "@/lib/voice-data"
import { useMIDI } from "@/lib/midi-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { getVoiceIcon } from "@/lib/voice-icons"

interface VoiceBrowserProps {
  currentPart: number | null
  onVoiceAssigned: (voice: Voice) => void
  onCancel: () => void
}

const PART_NAMES = ["Left", "Right 1", "Right 2", "Right 3"]

export function VoiceBrowser({ currentPart, onVoiceAssigned, onCancel }: VoiceBrowserProps) {
  const { sendProgramChange } = useMIDI()
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
      sendProgramChange(
        currentPart,
        Number.parseInt(selectedVoice.prg),
        Number.parseInt(selectedVoice.msb),
        Number.parseInt(selectedVoice.lsb),
      )
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
    <div className="h-full flex flex-col p-6 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/70" />
          <Input
            type="text"
            placeholder="Search voices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base bg-zinc-900/80 border-2 border-amber-500/30 rounded-xl shadow-lg shadow-amber-500/10 focus:border-amber-500 focus:shadow-amber-500/30 transition-all text-white placeholder:text-zinc-500"
          />
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
          className="px-8 h-14 bg-zinc-900/80 border-2 border-amber-500/30 hover:border-amber-500 hover:bg-zinc-800 text-white rounded-xl shadow-lg transition-all"
        >
          Cancel
        </Button>
        <Button
          size="lg"
          onClick={handleAssign}
          disabled={!selectedVoice || currentPart === null}
          className="glossy-button px-8 h-14 font-semibold text-lg"
        >
          {selectedVoice && currentPart !== null ? `Assign to ${PART_NAMES[currentPart - 1]}` : "Select Voice"}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Column 1: Categories */}
        <div className="glossy-panel overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b-2 border-amber-500/30">
            <h3 className="premium-label text-sm">CATEGORIES</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "w-full text-left px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between group",
                    selectedCategory === category
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50"
                      : "bg-zinc-900/50 hover:bg-zinc-800/80 text-white border border-amber-500/20 hover:border-amber-500/40",
                  )}
                >
                  <span className="truncate">
                    {category} ({getCategoryCount(category)})
                  </span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Column 2: Sub-Categories */}
        <div className="glossy-panel overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b-2 border-amber-500/30">
            <h3 className="premium-label text-sm">SUB-CATEGORIES</h3>
          </div>
          <ScrollArea className="flex-1">
            {selectedCategory ? (
              <div className="p-3 space-y-2">
                {subCategories.map((sub) => {
                  const Icon = getVoiceIcon(sub)

                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={cn(
                        "w-full text-left px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 group",
                        selectedSubCategory === sub
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50"
                          : "bg-zinc-900/50 hover:bg-zinc-800/80 text-white border border-amber-500/20 hover:border-amber-500/40",
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">
                        {sub} ({getSubCategoryCount(sub)})
                      </span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 ml-auto" />
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Select a category
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Column 3: Voices */}
        <div className="glossy-panel overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-b-2 border-amber-500/30">
            <h3 className="premium-label text-sm">VOICES</h3>
          </div>
          <ScrollArea className="flex-1">
            {selectedSubCategory ? (
              <div className="p-3 space-y-2">
                {filteredVoices.map((voice, index) => {
                  const Icon = getVoiceIcon(voice.sub)

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedVoice(voice)}
                      className={cn(
                        "w-full text-left px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3",
                        selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/50"
                          : "bg-zinc-900/50 hover:bg-zinc-800/80 text-white border border-amber-500/20 hover:border-amber-500/40",
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{voice.voice}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Select a sub-category
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
