"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { loadVoiceData, getCategories, getSubCategories, getVoices, type Voice } from "@/lib/voice-data"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { X, ChevronRight } from "lucide-react"

interface InlineVoiceSelectorProps {
  currentVoice?: Voice
  onSelectVoice: (voice: Voice) => void
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

export function InlineVoiceSelector({ currentVoice, onSelectVoice, onClose, triggerRef }: InlineVoiceSelectorProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [hoveredSubCategory, setHoveredSubCategory] = useState<string | null>(null)
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 })
  const [voiceSubmenuPosition, setVoiceSubmenuPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const voiceSubmenuRef = useRef<HTMLDivElement>(null)
  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subCategoryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const categories = useMemo(() => (voices.length > 0 ? getCategories(voices) : []), [voices])

  const subCategories = useMemo(
    () => (hoveredCategory ? getSubCategories(voices, hoveredCategory) : []),
    [hoveredCategory, voices],
  )

  const individualVoices = useMemo(
    () => (hoveredCategory && hoveredSubCategory ? getVoices(voices, hoveredCategory, hoveredSubCategory) : []),
    [hoveredCategory, hoveredSubCategory, voices],
  )

  useEffect(() => {
    loadVoiceData().then((data) => {
      setVoices(data)
      setLoading(false)
    })
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
      className="fixed bg-black/40 backdrop-blur-md border-2 border-amber-500 rounded-lg shadow-2xl w-[300px] max-h-[400px] flex flex-col"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 99999,
      }}
      onMouseLeave={handleCategoryLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-amber-500/30">
        <h3 className="text-white font-bold text-sm">Select Voice</h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
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

  const submenuContent = hoveredCategory && subCategories.length > 0 && (
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

  const voiceSubmenuContent = hoveredCategory && hoveredSubCategory && (
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
