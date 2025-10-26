"use client"

import { useState, useEffect } from "react"
import {
  loadVoiceData,
  getCategories,
  getSubCategories,
  getVoices,
  getAllSubCategories,
  getVoicesBySubCategory,
  type Voice,
} from "@/lib/voice-data"
import { useMIDI } from "@/lib/midi-context"
import { useLayout } from "@/lib/layout-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VoiceCommandPalette } from "@/components/voices/voice-command-palette"
import { cn } from "@/lib/utils"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { Upload } from "lucide-react"

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
  const { voiceNavMode, setVoiceNavMode } = useLayout()
  const [voices, setVoices] = useState<Voice[]>([])
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [keyboardType, setKeyboardType] = useState<string>("Tyros")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [subCategories, setSubCategories] = useState<string[]>([])
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [voiceList, setVoiceList] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allSubCategories, setAllSubCategories] = useState<string[]>([])

  useEffect(() => {
    loadVoiceData().then((data) => {
      setVoices(data)
      setCategories(getCategories(data))
      setAllSubCategories(getAllSubCategories(data))
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
    if (voiceNavMode === "category") {
      if (selectedCategory && selectedSubCategory) {
        const voicesList = getVoices(voices, selectedCategory, selectedSubCategory)
        setVoiceList(voicesList)
      }
    } else {
      if (selectedSubCategory) {
        const voicesList = getVoicesBySubCategory(voices, selectedSubCategory)
        setVoiceList(voicesList)
      }
    }
  }, [selectedCategory, selectedSubCategory, voices, voiceNavMode])

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

  const handleVoiceDoubleClick = (voice: Voice) => {
    setSelectedVoice(voice)
    if (currentPart !== null) {
      api.sendCommand({
        type: "voice",
        action: "assign",
        part: currentPart,
        voice: voice,
      })
      onVoiceAssigned(voice)
    }
  }

  const handleCommandPaletteSelect = (voice: Voice, action?: string) => {
    setSelectedVoice(voice)
    if (action === "assign" && currentPart !== null) {
      api.sendCommand({
        type: "voice",
        action: "assign",
        part: currentPart,
        voice: voice,
      })
      onVoiceAssigned(voice)
    }
  }

  const getCategoryCount = (category: string) => {
    return getSubCategories(voices, category).length
  }

  const getSubCategoryCount = (subCategory: string) => {
    if (voiceNavMode === "category") {
      if (!selectedCategory) return 0
      return getVoices(voices, selectedCategory, subCategory).length
    } else {
      return getVoicesBySubCategory(voices, subCategory).length
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-transparent backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading voice library...</p>
        </div>
      </div>
    )
  }

  if (voiceNavMode === "flat") {
    return (
      <div className="h-full flex flex-col bg-transparent backdrop-blur-sm">
        <VoiceCommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          voices={voices}
          onSelectVoice={handleCommandPaletteSelect}
          currentPart={currentPart}
        />

        <div className="p-6 border-b border-border glossy-panel space-y-4 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button onClick={() => console.log("[v0] Import voice file")} className="glossy-button h-10 px-6">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Select value={keyboardType} onValueChange={setKeyboardType}>
                <SelectTrigger className="w-32 h-10 bg-black/30 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSR">PSR</SelectItem>
                  <SelectItem value="Tyros">Tyros</SelectItem>
                  <SelectItem value="Genos">Genos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 premium-card px-4 py-3 rounded-lg">
              <Label htmlFor="voice-nav-toggle" className="text-sm font-semibold text-white cursor-pointer">
                Category (3-level)
              </Label>
              <Switch
                id="voice-nav-toggle"
                checked={true}
                onCheckedChange={(checked) => setVoiceNavMode(checked ? "flat" : "category")}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="voice-nav-toggle" className="text-sm font-semibold text-white cursor-pointer">
                Flat (2-level)
              </Label>
            </div>
          </div>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full h-16 px-5 flex items-center gap-3 premium-card rounded-2xl shadow-xl shadow-black/10 hover:border-primary hover:shadow-primary/30 transition-all group"
          >
            <span className="text-muted-foreground group-hover:text-primary transition-colors text-base font-medium">
              Quick search (⌘K)
            </span>
            <kbd className="ml-auto px-3 py-1.5 text-xs font-mono text-muted-foreground bg-black/30 rounded border border-border">
              ⌘K
            </kbd>
          </button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-6 py-6 glossy-panel border-2 border-border hover:border-primary text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-primary/20 bg-transparent"
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

        <div className="flex-1 flex flex-col gap-6 p-6 overflow-hidden">
          {!selectedSubCategory ? (
            <div className="flex flex-col gap-4 flex-1 overflow-hidden">
              <h3 className="premium-label text-xs uppercase tracking-widest px-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
                SUB-CATEGORIES
              </h3>
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 pr-3 pb-4">
                  {allSubCategories.map((sub) => {
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className="premium-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 group"
                      >
                        <div className="w-20 h-20 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 group-hover:bg-amber-500/30 transition-colors border-2 border-amber-500/40 group-hover:border-amber-500">
                          <VoiceIcon
                            category=""
                            subcategory={sub}
                            size={56}
                            className="w-14 h-14 opacity-80 group-hover:opacity-100 transition-opacity text-primary"
                          />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                            {sub}
                          </div>
                          <div className="text-xs text-primary/60 mt-1 font-semibold">
                            {getSubCategoryCount(sub)} voices
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1 overflow-hidden">
              <div className="flex items-center gap-3 px-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubCategory(null)}
                  className="px-4 py-2 glossy-panel border-2 border-border hover:border-primary text-white font-semibold rounded-xl transition-all"
                >
                  ← Back
                </Button>
                <h3 className="premium-label text-xs uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
                  {selectedSubCategory} VOICES
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2.5 pr-3">
                  {voiceList.length > 0 ? (
                    voiceList.map((voice, index) => {
                      return (
                        <Button
                          key={index}
                          onClick={() => setSelectedVoice(voice)}
                          onDoubleClick={() => handleVoiceDoubleClick(voice)}
                          className={cn(
                            "w-full justify-start px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 shadow-lg",
                            selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                              ? "glossy-button text-black shadow-2xl shadow-primary/60 scale-[1.02]"
                              : "premium-card text-white border-2 border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
                          )}
                        >
                          <VoiceIcon
                            category={voice.category}
                            subcategory={voice.sub}
                            size={40}
                            className={cn(
                              "w-10 h-10",
                              selectedVoice?.voice === voice.voice ? "text-black" : "text-primary opacity-80",
                            )}
                          />
                          <div className="flex-1 text-left">
                            <div>{voice.voice}</div>
                            <div className="text-xs text-primary/60 mt-0.5">{voice.category}</div>
                          </div>
                        </Button>
                      )
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-center text-zinc-500 py-8 font-medium">No voices found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-transparent backdrop-blur-sm">
      <VoiceCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        voices={voices}
        onSelectVoice={handleCommandPaletteSelect}
        currentPart={currentPart}
      />

      <div className="p-6 border-b border-border glossy-panel space-y-4 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button onClick={() => console.log("[v0] Import voice file")} className="glossy-button h-10 px-6">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Select value={keyboardType} onValueChange={setKeyboardType}>
              <SelectTrigger className="w-32 h-10 bg-black/30 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PSR">PSR</SelectItem>
                <SelectItem value="Tyros">Tyros</SelectItem>
                <SelectItem value="Genos">Genos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 premium-card px-4 py-3 rounded-lg">
            <Label htmlFor="voice-nav-toggle-category" className="text-sm font-semibold text-white cursor-pointer">
              Category (3-level)
            </Label>
            <Switch
              id="voice-nav-toggle-category"
              checked={false}
              onCheckedChange={(checked) => setVoiceNavMode(checked ? "flat" : "category")}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="voice-nav-toggle-category" className="text-sm font-semibold text-white cursor-pointer">
              Flat (2-level)
            </Label>
          </div>
        </div>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full h-16 px-5 flex items-center gap-3 premium-card rounded-2xl shadow-xl shadow-black/10 hover:border-primary hover:shadow-primary/30 transition-all group"
        >
          <span className="text-muted-foreground group-hover:text-primary transition-colors text-base font-medium">
            Quick search (⌘K)
          </span>
          <kbd className="ml-auto px-3 py-1.5 text-xs font-mono text-muted-foreground bg-black/30 rounded border border-border">
            ⌘K
          </kbd>
        </button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6 py-6 glossy-panel border-2 border-border hover:border-primary text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-primary/20 bg-transparent"
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

      <div className="flex-1 grid grid-cols-3 gap-6 p-6 overflow-hidden">
        <div className="flex flex-col gap-4">
          <h3 className="premium-label text-xs uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
            CATEGORIES
          </h3>
          <ScrollArea className="flex-1">
            <div className="space-y-2.5 pr-3">
              {categories.map((category) => {
                return (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    onMouseEnter={() => setSelectedCategory(category)}
                    className={cn(
                      "w-full justify-start px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 group shadow-lg",
                      selectedCategory === category
                        ? "glossy-button text-black shadow-2xl shadow-primary/60 scale-[1.02]"
                        : "premium-card text-white border-2 border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
                    )}
                  >
                    <VoiceIcon
                      category={category}
                      subcategory=""
                      size={48}
                      className={cn(
                        "w-12 h-12",
                        selectedCategory === category ? "text-white opacity-100" : "text-primary opacity-80",
                      )}
                    />
                    <span className="flex-1 text-left">{category}</span>
                    <span
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full font-bold",
                        selectedCategory === category
                          ? "bg-white/20 text-black"
                          : "bg-primary/20 text-primary group-hover:bg-primary/30",
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

        <div className="flex flex-col gap-4">
          <h3 className="premium-label text-xs uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
            SUB-CATEGORIES
          </h3>
          <ScrollArea className="flex-1">
            {selectedCategory ? (
              <div className="space-y-2.5 pr-3">
                {subCategories.map((sub) => {
                  return (
                    <Button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      onMouseEnter={() => setSelectedSubCategory(sub)}
                      className={cn(
                        "w-full justify-start px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 group shadow-lg",
                        selectedSubCategory === sub
                          ? "glossy-button text-black shadow-2xl shadow-primary/60 scale-[1.02]"
                          : "premium-card text-white border-2 border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
                      )}
                    >
                      <VoiceIcon
                        category={selectedCategory}
                        subcategory={sub}
                        size={48}
                        className={cn(
                          "w-12 h-12",
                          selectedSubCategory === sub ? "text-white opacity-100" : "text-primary opacity-80",
                        )}
                      />
                      <span className="flex-1 text-left">{sub}</span>
                      <span
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-full font-bold",
                          selectedSubCategory === sub
                            ? "bg-white/20 text-black"
                            : "bg-primary/20 text-primary group-hover:bg-primary/30",
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

        <div className="flex flex-col gap-4">
          <h3 className="premium-label text-xs uppercase tracking-widest px-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-primary to-primary/70 rounded-full"></span>
            VOICES
          </h3>
          <ScrollArea className="flex-1">
            {selectedSubCategory ? (
              <div className="space-y-2.5 pr-3">
                {voiceList.length > 0 ? (
                  voiceList.map((voice, index) => {
                    return (
                      <Button
                        key={index}
                        onClick={() => setSelectedVoice(voice)}
                        onDoubleClick={() => handleVoiceDoubleClick(voice)}
                        className={cn(
                          "w-full justify-start px-6 py-5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-4 shadow-lg",
                          selectedVoice?.voice === voice.voice && selectedVoice?.msb === voice.msb
                            ? "glossy-button text-black shadow-2xl shadow-primary/60 scale-[1.02]"
                            : "premium-card text-white border-2 border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20",
                        )}
                      >
                        <VoiceIcon
                          category={voice.category}
                          subcategory={voice.sub}
                          size={40}
                          className={cn(
                            "w-10 h-10",
                            selectedVoice?.voice === voice.voice ? "text-black opacity-100" : "text-primary opacity-80",
                          )}
                        />
                        <div className="flex-1 text-left">{voice.voice}</div>
                      </Button>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center text-zinc-500 py-8 font-medium">No voices found</p>
                  </div>
                )}
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
