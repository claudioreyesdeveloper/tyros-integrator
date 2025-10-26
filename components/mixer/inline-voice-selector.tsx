"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { loadVoiceData, getCategories, getSubCategories, getVoices, type Voice } from "@/lib/voice-data"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { X, ChevronRight, Search } from "lucide-react"

interface InlineVoiceSelectorProps {
  currentVoice?: Voice
  onSelectVoice: (voice: Voice) => void
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  mode?: "search" | "navigation"
}

function fuzzySearch(query: string, voices: Voice[]): Voice[] {
  if (!query.trim()) return []

  const lowerQuery = query.toLowerCase()
  const scored = voices.map((voice) => {
    const lowerVoice = voice.voice.toLowerCase()
    let score = 0

    // Exact match gets highest score
    if (lowerVoice === lowerQuery) {
      score = 1000
    }
    // Starts with query gets high score
    else if (lowerVoice.startsWith(lowerQuery)) {
      score = 500
    }
    // Contains query gets medium score
    else if (lowerVoice.includes(lowerQuery)) {
      score = 250
    }
    // Fuzzy match - all characters in order
    else {
      let queryIndex = 0
      for (let i = 0; i < lowerVoice.length && queryIndex < lowerQuery.length; i++) {
        if (lowerVoice[i] === lowerQuery[queryIndex]) {
          queryIndex++
          score += 10
        }
      }
      if (queryIndex !== lowerQuery.length) score = 0
    }

    return { voice, score }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50) // Limit to top 50 results
    .map((item) => item.voice)
}

export function InlineVoiceSelector({
  currentVoice,
  onSelectVoice,
  onClose,
  triggerRef,
  mode = "navigation",
}: InlineVoiceSelectorProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [hoveredSubCategory, setHoveredSubCategory] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 })
  const [voiceSubmenuPosition, setVoiceSubmenuPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const voiceSubmenuRef = useRef<HTMLDivElement>(null)
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subCategoryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const categories = useMemo(() => (voices.length > 0 ? getCategories(voices) : []), [voices])

  const subCategories = useMemo(
    () => (hoveredCategory ? getSubCategories(voices, hoveredCategory) : []),
    [hoveredCategory, voices],
  )

  const individualVoices = useMemo(
    () => (hoveredCategory && hoveredSubCategory ? getVoices(voices, hoveredCategory, hoveredSubCategory) : []),
    [hoveredCategory, hoveredSubCategory, voices],
  )

  const searchResults = useMemo(() => fuzzySearch(searchQuery, voices), [searchQuery, voices])

  useEffect(() => {
    loadVoiceData().then((data) => {
      setVoices(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      })
    }
  }, [triggerRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        submenuRef.current &&
        !submenuRef.current.contains(event.target as Node) &&
        voiceSubmenuRef.current &&
        !voiceSubmenuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose, triggerRef])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose])

  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current)
      if (subCategoryTimeoutRef.current) clearTimeout(subCategoryTimeoutRef.current)
    }
  }, [])

  const handleCategoryHover = (category: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current)
      categoryTimeoutRef.current = null
    }
    setHoveredCategory(category)
    setHoveredSubCategory(null)
    const rect = event.currentTarget.getBoundingClientRect()
    setSubmenuPosition({
      top: rect.top,
      left: rect.right + 4,
    })
  }

  const handleCategoryLeave = () => {
    categoryTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null)
      setHoveredSubCategory(null)
    }, 300)
  }

  const handleSubCategoryHover = (subCategory: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (subCategoryTimeoutRef.current) {
      clearTimeout(subCategoryTimeoutRef.current)
      subCategoryTimeoutRef.current = null
    }
    setHoveredSubCategory(subCategory)
    const rect = event.currentTarget.getBoundingClientRect()
    setVoiceSubmenuPosition({
      top: rect.top,
      left: rect.right + 4,
    })
  }

  const handleSubCategoryLeave = () => {
    subCategoryTimeoutRef.current = setTimeout(() => {
      setHoveredSubCategory(null)
    }, 300)
  }

  const handleVoiceClick = (voice: Voice) => {
    onSelectVoice(voice)
    onClose()
  }

  const handleSubmenuEnter = () => {
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current)
      categoryTimeoutRef.current = null
    }
  }

  const handleVoiceSubmenuEnter = () => {
    if (subCategoryTimeoutRef.current) {
      clearTimeout(subCategoryTimeoutRef.current)
      subCategoryTimeoutRef.current = null
    }
  }

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed bg-black/40 backdrop-blur-md border-2 border-amber-500 rounded-lg shadow-2xl w-[300px] max-h-[500px] flex flex-col"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
      }}
      onMouseLeave={handleCategoryLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-amber-500/30">
        <h3 className="text-white font-bold text-sm">{mode === "search" ? "Search Voices" : "Select Voice"}</h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {mode === "search" && (
        <div className="p-3 border-b border-amber-500/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search voices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-black/30 border border-amber-500/30 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
        ) : mode === "search" ? (
          <div className="p-2">
            {searchQuery.trim() === "" ? (
              <div className="p-4 text-center text-zinc-500 text-sm">Type to search voices...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm">No voices found</div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs text-zinc-400">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </div>
                {searchResults.map((voice) => (
                  <button
                    key={`${voice.category}-${voice.sub}-${voice.voice}`}
                    onClick={() => handleVoiceClick(voice)}
                    className={`w-full flex items-center gap-3 p-3 rounded hover:bg-white/10 transition-colors text-left ${
                      currentVoice?.voice === voice.voice ? "bg-white/10" : ""
                    }`}
                  >
                    <VoiceIcon category={voice.category} subcategory={voice.sub} size={24} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{voice.voice}</div>
                      <div className="text-zinc-500 text-xs truncate">
                        {voice.category} › {voice.sub}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="p-2">
            {categories.map((category) => (
              <button
                key={category}
                onMouseEnter={(e) => handleCategoryHover(category, e)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded hover:bg-white/10 transition-colors text-left ${
                  hoveredCategory === category ? "bg-white/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <VoiceIcon category={category} subcategory="" size={24} />
                  <span className="text-white text-sm font-medium">{category}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const submenuContent = mode === "navigation" && hoveredCategory && subCategories.length > 0 && (
    <div
      ref={submenuRef}
      className="fixed bg-black/40 backdrop-blur-md border-2 border-amber-500 rounded-lg shadow-2xl w-[300px] max-h-[400px] overflow-y-auto"
      style={{
        top: `${submenuPosition.top}px`,
        left: `${submenuPosition.left}px`,
        zIndex: 99999,
      }}
      onMouseEnter={handleSubmenuEnter}
      onMouseLeave={handleSubCategoryLeave}
    >
      <div className="p-2">
        {subCategories.map((subCategory) => (
          <button
            key={subCategory}
            onMouseEnter={(e) => handleSubCategoryHover(subCategory, e)}
            className={`w-full flex items-center justify-between gap-3 p-3 rounded hover:bg-white/10 transition-colors text-left ${
              hoveredSubCategory === subCategory ? "bg-white/10" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <VoiceIcon category={hoveredCategory} subcategory={subCategory} size={24} />
              <span className="text-white text-sm font-medium">{subCategory}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        ))}
      </div>
    </div>
  )

  const voiceSubmenuContent = mode === "navigation" && hoveredCategory && hoveredSubCategory && (
    <div
      key={`${hoveredCategory}-${hoveredSubCategory}`}
      ref={voiceSubmenuRef}
      className="fixed bg-black/40 backdrop-blur-md border-2 border-amber-500 rounded-lg shadow-2xl w-[300px] max-h-[400px] overflow-y-auto"
      style={{
        top: `${voiceSubmenuPosition.top}px`,
        left: `${voiceSubmenuPosition.left}px`,
        zIndex: 99999,
      }}
      onMouseEnter={handleVoiceSubmenuEnter}
      onMouseLeave={() => setHoveredSubCategory(null)}
    >
      <div className="p-2">
        {individualVoices.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-sm">No voices found</div>
        ) : (
          individualVoices.map((voice) => (
            <button
              key={`${voice.category}-${voice.sub}-${voice.voice}`}
              onClick={() => handleVoiceClick(voice)}
              className={`w-full flex items-center gap-3 p-3 rounded hover:bg-white/10 transition-colors text-left ${
                currentVoice?.voice === voice.voice ? "bg-white/10" : ""
              }`}
            >
              <VoiceIcon category={voice.category} subcategory={voice.sub} size={24} />
              <span className="text-white text-sm font-medium">{voice.voice}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )

  return typeof document !== "undefined"
    ? createPortal(
        <>
          {dropdownContent}
          {submenuContent}
          {voiceSubmenuContent}
        </>,
        document.body,
      )
    : null
}
