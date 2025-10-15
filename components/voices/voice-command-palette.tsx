"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Voice } from "@/lib/voice-data"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { Search, Clock, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceCommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  voices: Voice[]
  onSelectVoice: (voice: Voice, action?: string) => void
  recentVoices?: Voice[]
  favorites?: Voice[]
  currentPart?: number | null
}

const PART_NAMES = ["Left", "Right 1", "Right 2", "Right 3"]

function fuzzyScore(voiceName: string, searchQuery: string): number {
  const voice = voiceName.toLowerCase()
  const query = searchQuery.toLowerCase().trim()

  if (voice === query) return 1000
  if (voice.startsWith(query)) return 900
  if (voice.includes(query)) return 800

  const queryWords = query.split(/\s+/).filter((w) => w.length > 0)
  const voiceWords = voice.split(/\s+/)

  let score = 0

  for (const qWord of queryWords) {
    let bestWordScore = 0

    for (const vWord of voiceWords) {
      if (vWord === qWord) {
        bestWordScore = Math.max(bestWordScore, 100)
      } else if (vWord.startsWith(qWord)) {
        bestWordScore = Math.max(bestWordScore, 80)
      } else if (vWord.includes(qWord)) {
        bestWordScore = Math.max(bestWordScore, 60)
      } else {
        let matchCount = 0
        let lastIndex = -1
        for (const char of qWord) {
          const index = vWord.indexOf(char, lastIndex + 1)
          if (index > lastIndex) {
            matchCount++
            lastIndex = index
          }
        }
        if (matchCount >= qWord.length * 0.7) {
          bestWordScore = Math.max(bestWordScore, 40)
        }
      }
    }

    score += bestWordScore
  }

  if (queryWords.length > 1) {
    score *= 1.2
  }

  return score
}

function fuzzySearch(voices: Voice[], query: string, limit = 30): Voice[] {
  if (!query.trim()) return []

  const scoredVoices = voices.map((voice) => ({
    voice,
    score: fuzzyScore(voice.voice, query),
  }))

  return scoredVoices
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.voice)
}

export function VoiceCommandPalette({
  isOpen,
  onClose,
  voices,
  onSelectVoice,
  recentVoices = [],
  favorites = [],
  currentPart = null,
}: VoiceCommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const searchResults = searchQuery.trim() ? fuzzySearch(voices, searchQuery, 30) : []

  const sections: Array<{
    title: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    items: Voice[]
  }> = []

  if (searchQuery.trim()) {
    if (searchResults.length > 0) {
      sections.push({ title: "Search Results", icon: Search, color: "text-amber-500", items: searchResults })
    }
  } else {
    if (favorites.length > 0) {
      sections.push({ title: "Favorites", icon: Star, color: "text-amber-500", items: favorites.slice(0, 5) })
    }
    if (recentVoices.length > 0) {
      sections.push({ title: "Recent", icon: Clock, color: "text-blue-500", items: recentVoices.slice(0, 5) })
    }
  }

  const allItems = sections.flatMap((s) => s.items)

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % allItems.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length)
      } else if (e.key === "Enter" && allItems[selectedIndex]) {
        e.preventDefault()
        const action = (e.ctrlKey || e.metaKey) && currentPart !== null ? "assign" : undefined
        onSelectVoice(allItems[selectedIndex], action)
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, allItems, selectedIndex, onSelectVoice, onClose, currentPart])

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
        <div
          className="w-full max-w-2xl mx-4 pointer-events-auto animate-in slide-in-from-top-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-zinc-900 border-2 border-amber-500/40 rounded-t-2xl shadow-2xl shadow-amber-500/20">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-500/20">
              <Search className="w-5 h-5 text-amber-500/70 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search voices... (↑↓ navigate, Enter select, ⌘Enter assign, Esc close)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-lg placeholder:text-zinc-500 outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-amber-500/70 bg-zinc-800 rounded border border-amber-500/20">
                ESC
              </kbd>
            </div>
          </div>

          <div className="bg-zinc-900 border-x-2 border-b-2 border-amber-500/40 rounded-b-2xl shadow-2xl shadow-amber-500/20 max-h-[60vh] overflow-y-auto">
            {allItems.length > 0 ? (
              <div ref={listRef} className="py-2">
                {sections.map((section, sectionIdx) => {
                  const sectionStartIdx = sections.slice(0, sectionIdx).reduce((acc, s) => acc + s.items.length, 0)
                  return (
                    <div key={section.title}>
                      <div className="px-5 py-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                        <section.icon className={cn("w-3.5 h-3.5", section.color)} />
                        <span className={section.color}>{section.title}</span>
                      </div>
                      {section.items.map((voice, itemIdx) => {
                        const globalIdx = sectionStartIdx + itemIdx
                        return (
                          <button
                            key={`${voice.voice}-${voice.msb}-${voice.lsb}-${itemIdx}`}
                            onClick={() => {
                              onSelectVoice(voice)
                              onClose()
                            }}
                            className={cn(
                              "w-full text-left px-5 py-3.5 flex items-center gap-4 transition-all duration-150",
                              selectedIndex === globalIdx
                                ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-l-4 border-amber-500"
                                : "hover:bg-zinc-800/50 border-l-4 border-transparent",
                            )}
                          >
                            <VoiceIcon subcategory={voice.sub} category={voice.category} size={24} />
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold text-base truncate">{voice.voice}</div>
                              <div className="text-amber-500/70 text-sm truncate mt-0.5">
                                {voice.category} → {voice.sub}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-xs text-zinc-500 font-mono">
                              <div>MSB: {voice.msb}</div>
                              <div>LSB: {voice.lsb}</div>
                              <div>PRG: {voice.prg}</div>
                            </div>
                            {currentPart !== null && selectedIndex === globalIdx && (
                              <div className="text-xs text-amber-500/70 font-mono">
                                ⌘↵ to assign to {PART_NAMES[currentPart - 1]}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                {searchQuery.trim() ? (
                  <div className="text-zinc-500">
                    <p className="text-lg font-semibold mb-2">No voices found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-zinc-500">
                    <p className="text-lg font-semibold mb-2">Start typing to search</p>
                    <p className="text-sm">Search across all {voices.length} voices</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
