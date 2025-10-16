"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Clock } from "lucide-react"
import type { Voice } from "@/lib/tyros-api"
import { getVoiceIcon } from "@/lib/voice-icons"

interface VoiceCommandPaletteProps {
  open: boolean
  onClose: () => void
  onSelectVoice: (voice: Voice) => void
  voices: Voice[]
  favorites: Voice[]
  recentVoices: Voice[]
}

export function VoiceCommandPalette({
  open,
  onClose,
  onSelectVoice,
  voices,
  favorites,
  recentVoices,
}: VoiceCommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Simple fuzzy search
  const fuzzySearch = (items: Voice[], query: string, limit = 30): Voice[] => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery) ||
          item.sub.toLowerCase().includes(lowerQuery),
      )
      .slice(0, limit)
  }

  const searchResults = searchQuery.trim() ? fuzzySearch(voices, searchQuery, 30) : []

  type Section = {
    title: string
    icon: typeof Search
    color: string
    items: Voice[]
  }

  const sections: Section[] = []
  if (searchQuery.trim()) {
    if (searchResults.length > 0) {
      sections.push({ title: "Search Results", icon: Search, color: "text-amber-500", items: searchResults })
    }
  } else {
    if (favorites.length > 0) {
      sections.push({ title: "Favorites", icon: Star, color: "text-yellow-500", items: favorites.slice(0, 5) })
    }
    if (recentVoices.length > 0) {
      sections.push({ title: "Recent", icon: Clock, color: "text-purple-500", items: recentVoices.slice(0, 5) })
    }
  }

  const allItems = sections.flatMap((s) => s.items)

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % allItems.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + allItems.length) % allItems.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (allItems[selectedIndex]) {
          onSelectVoice(allItems[selectedIndex])
          onClose()
        }
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, selectedIndex, allItems, onSelectVoice, onClose])

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setSearchQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  let currentIndex = 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search voices..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedIndex(0)
              }}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-2">
            {sections.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No voices found</p>
              </div>
            ) : (
              sections.map((section) => {
                const SectionIcon = section.icon
                return (
                  <div key={section.title} className="mb-4">
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                      <SectionIcon className={`h-3 w-3 ${section.color}`} />
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((voice) => {
                        const Icon = getVoiceIcon(voice.category)
                        const isSelected = currentIndex === selectedIndex
                        const itemIndex = currentIndex++

                        return (
                          <button
                            key={`${voice.msb}-${voice.lsb}-${voice.pc}`}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                              isSelected ? "bg-accent" : "hover:bg-accent/50"
                            }`}
                            onClick={() => {
                              onSelectVoice(voice)
                              onClose()
                            }}
                            onMouseEnter={() => setSelectedIndex(itemIndex)}
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{voice.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {voice.category} • {voice.sub}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {voice.category}
                            </Badge>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
