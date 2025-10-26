"use client"

import type React from "react"

import { useState } from "react"
import {
  Play,
  Square,
  RotateCcw,
  Search,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Music2,
  Ear,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type ChordDuration = "whole" | "half" | "quarter" | "eighth"

interface ChordWithDuration {
  chord: string
  duration: ChordDuration
}

interface ChordProgression {
  id: string
  type: string // Main genre (Country Grooves, Pop Rock, Jazz Ballads, etc.)
  subtype: string // Sub-style (Ballad, Swing, Shuffle, etc.)
  subSubtype: string // Performance nuance (Big Ballad, Gentle Swing, etc.)
  section: string // Musical section (Intro, Verse, Chorus, Bridge, Ending)
  variation: string // Variation number (Variation_01, Variation_02, etc.)
  bars: number
  key: string
  timeSignature: string
  tempo: number
  chords: string[] // Keep for backward compatibility
  chordsWithDuration: ChordWithDuration[] // New field with duration data
}

const MOCK_PROGRESSIONS: ChordProgression[] = [
  // Country Grooves → Ballad → Big Ballad
  {
    id: "country_ballad_big_intro_v1",
    type: "Country Grooves",
    subtype: "Ballad",
    subSubtype: "Big Ballad",
    section: "Intro",
    variation: "Variation_01",
    bars: 4,
    key: "C",
    timeSignature: "4/4",
    tempo: 72,
    chords: ["C", "Am7", "F", "G7"],
    chordsWithDuration: [
      { chord: "C", duration: "whole" },
      { chord: "Am7", duration: "whole" },
      { chord: "F", duration: "whole" },
      { chord: "G7", duration: "whole" },
    ],
  },
  {
    id: "country_ballad_big_verse_v2",
    type: "Country Grooves",
    subtype: "Ballad",
    subSubtype: "Big Ballad",
    section: "Verse",
    variation: "Variation_02",
    bars: 7,
    key: "C",
    timeSignature: "4/4",
    tempo: 72,
    chords: ["C", "G/B", "Am7", "F", "Dm7", "G7", "C"],
    chordsWithDuration: [
      { chord: "C", duration: "whole" },
      { chord: "G/B", duration: "half" },
      { chord: "Am7", duration: "half" },
      { chord: "F", duration: "whole" },
      { chord: "Dm7", duration: "half" },
      { chord: "G7", duration: "half" },
      { chord: "C", duration: "whole" },
    ],
  },
  {
    id: "country_ballad_big_chorus_v3",
    type: "Country Grooves",
    subtype: "Ballad",
    subSubtype: "Big Ballad",
    section: "Chorus",
    variation: "Variation_03",
    bars: 5,
    key: "C",
    timeSignature: "4/4",
    tempo: 72,
    chords: ["F", "C/E", "Dm7", "G7", "C"],
    chordsWithDuration: [
      { chord: "F", duration: "whole" },
      { chord: "C/E", duration: "half" },
      { chord: "Dm7", duration: "half" },
      { chord: "G7", duration: "whole" },
      { chord: "C", duration: "whole" },
    ],
  },
  {
    id: "country_ballad_big_bridge_v1",
    type: "Country Grooves",
    subtype: "Ballad",
    subSubtype: "Big Ballad",
    section: "Bridge",
    variation: "Variation_01",
    bars: 4,
    key: "C",
    timeSignature: "4/4",
    tempo: 72,
    chords: ["Am7", "Dm7", "G7", "Cmaj7"],
    chordsWithDuration: [
      { chord: "Am7", duration: "whole" },
      { chord: "Dm7", duration: "whole" },
      { chord: "G7", duration: "whole" },
      { chord: "Cmaj7", duration: "whole" },
    ],
  },
  // Country Grooves → Ballad → Nashville Style
  {
    id: "country_ballad_nash_intro_v1",
    type: "Country Grooves",
    subtype: "Ballad",
    subSubtype: "Nashville Style",
    section: "Intro",
    variation: "Variation_01",
    bars: 4,
    key: "C",
    timeSignature: "4/4",
    tempo: 76,
    chords: ["C", "F", "G", "C"],
    chordsWithDuration: [
      { chord: "C", duration: "whole" },
      { chord: "F", duration: "whole" },
      { chord: "G", duration: "whole" },
      { chord: "C", duration: "whole" },
    ],
  },
  {
    id: "country_ballad_nash_verse_v2",
    type: "Country Grooves",
    subtype: "Ballad",
    subSubtype: "Nashville Style",
    section: "Verse",
    variation: "Variation_02",
    bars: 5,
    key: "C",
    timeSignature: "4/4",
    tempo: 76,
    chords: ["C", "Am", "F", "G", "C"],
    chordsWithDuration: [
      { chord: "C", duration: "whole" },
      { chord: "Am", duration: "half" },
      { chord: "F", duration: "half" },
      { chord: "G", duration: "whole" },
      { chord: "C", duration: "whole" },
    ],
  },
  {
    id: "country_ballad_nash_chorus_v3",
    type: "Country Grooves",
    subtype: "Ballad",
    subSubtype: "Nashville Style",
    section: "Chorus",
    variation: "Variation_03",
    bars: 7,
    key: "C",
    timeSignature: "4/4",
    tempo: 76,
    chords: ["F", "G", "C", "Am", "Dm", "G", "C"],
    chordsWithDuration: [
      { chord: "F", duration: "half" },
      { chord: "G", duration: "half" },
      { chord: "C", duration: "whole" },
      { chord: "Am", duration: "half" },
      { chord: "Dm", duration: "quarter" },
      { chord: "G", duration: "quarter" },
      { chord: "C", duration: "whole" },
    ],
  },
  // Country Grooves → Waltz → Acoustic Waltz
  {
    id: "country_waltz_acoustic_intro_v1",
    type: "Country Grooves",
    subtype: "Waltz",
    subSubtype: "Acoustic Waltz",
    section: "Intro",
    variation: "Variation_01",
    bars: 3,
    key: "C",
    timeSignature: "3/4",
    tempo: 96,
    chords: ["C", "G7", "C"],
    chordsWithDuration: [
      { chord: "C", duration: "whole" },
      { chord: "G7", duration: "whole" },
      { chord: "C", duration: "whole" },
    ],
  },
  {
    id: "country_waltz_acoustic_verse_v1",
    type: "Country Grooves",
    subtype: "Waltz",
    subSubtype: "Acoustic Waltz",
    section: "Verse",
    variation: "Variation_01",
    bars: 4,
    key: "C",
    timeSignature: "3/4",
    tempo: 96,
    chords: ["C", "F", "G7", "C"],
    chordsWithDuration: [
      { chord: "C", duration: "whole" },
      { chord: "F", duration: "whole" },
      { chord: "G7", duration: "whole" },
      { chord: "C", duration: "whole" },
    ],
  },
  // Pop Rock → Straight 8ths → Vintage Pop
  {
    id: "pop_straight_vintage_intro_v1",
    type: "Pop Rock",
    subtype: "Straight 8ths",
    subSubtype: "Vintage Pop",
    section: "Intro",
    variation: "Variation_01",
    bars: 4,
    key: "G",
    timeSignature: "4/4",
    tempo: 120,
    chords: ["G", "D/F#", "Em", "C"],
    chordsWithDuration: [
      { chord: "G", duration: "whole" },
      { chord: "D/F#", duration: "whole" },
      { chord: "Em", duration: "whole" },
      { chord: "C", duration: "whole" },
    ],
  },
  {
    id: "pop_straight_vintage_verse_v2",
    type: "Pop Rock",
    subtype: "Straight 8ths",
    subSubtype: "Vintage Pop",
    section: "Verse",
    variation: "Variation_02",
    bars: 5,
    key: "G",
    timeSignature: "4/4",
    tempo: 120,
    chords: ["G", "C", "Am", "D", "G"],
    chordsWithDuration: [
      { chord: "G", duration: "whole" },
      { chord: "C", duration: "half" },
      { chord: "Am", duration: "half" },
      { chord: "D", duration: "whole" },
      { chord: "G", duration: "whole" },
    ],
  },
  {
    id: "pop_straight_vintage_chorus_v3",
    type: "Pop Rock",
    subtype: "Straight 8ths",
    subSubtype: "Vintage Pop",
    section: "Chorus",
    variation: "Variation_03",
    bars: 7,
    key: "G",
    timeSignature: "4/4",
    tempo: 120,
    chords: ["C", "D", "G", "Em", "C", "D", "G"],
    chordsWithDuration: [
      { chord: "C", duration: "half" },
      { chord: "D", duration: "half" },
      { chord: "G", duration: "whole" },
      { chord: "Em", duration: "half" },
      { chord: "C", duration: "quarter" },
      { chord: "D", duration: "quarter" },
      { chord: "G", duration: "whole" },
    ],
  },
  // Pop Rock → Uptempo → Modern Rock
  {
    id: "pop_uptempo_modern_verse_v1",
    type: "Pop Rock",
    subtype: "Uptempo",
    subSubtype: "Modern Rock",
    section: "Verse",
    variation: "Variation_01",
    bars: 4,
    key: "A",
    timeSignature: "4/4",
    tempo: 140,
    chords: ["A", "F#m", "D", "E"],
    chordsWithDuration: [
      { chord: "A", duration: "whole" },
      { chord: "F#m", duration: "whole" },
      { chord: "D", duration: "whole" },
      { chord: "E", duration: "whole" },
    ],
  },
  {
    id: "pop_uptempo_modern_chorus_v2",
    type: "Pop Rock",
    subtype: "Uptempo",
    subSubtype: "Modern Rock",
    section: "Chorus",
    variation: "Variation_02",
    bars: 4,
    key: "A",
    timeSignature: "4/4",
    tempo: 140,
    chords: ["D", "A", "E", "F#m"],
    chordsWithDuration: [
      { chord: "D", duration: "half" },
      { chord: "A", duration: "half" },
      { chord: "E", duration: "half" },
      { chord: "F#m", duration: "half" },
    ],
  },
  // Jazz Ballads → Swing → Gentle Swing
  {
    id: "jazz_swing_gentle_intro_v1",
    type: "Jazz Ballads",
    subtype: "Swing",
    subSubtype: "Gentle Swing",
    section: "Intro",
    variation: "Variation_01",
    bars: 4,
    key: "C",
    timeSignature: "4/4",
    tempo: 88,
    chords: ["Cmaj7", "A7", "Dm7", "G13"],
    chordsWithDuration: [
      { chord: "Cmaj7", duration: "whole" },
      { chord: "A7", duration: "whole" },
      { chord: "Dm7", duration: "whole" },
      { chord: "G13", duration: "whole" },
    ],
  },
  {
    id: "jazz_swing_gentle_verse_v2",
    type: "Jazz Ballads",
    subtype: "Swing",
    subSubtype: "Gentle Swing",
    section: "Verse",
    variation: "Variation_02",
    bars: 8,
    key: "C",
    timeSignature: "4/4",
    tempo: 88,
    chords: ["Cmaj7", "A7", "Dm7", "G7", "Cmaj7", "E7", "Am7", "D7"],
    chordsWithDuration: [
      { chord: "Cmaj7", duration: "whole" },
      { chord: "A7", duration: "whole" },
      { chord: "Dm7", duration: "whole" },
      { chord: "G7", duration: "whole" },
      { chord: "Cmaj7", duration: "whole" },
      { chord: "E7", duration: "whole" },
      { chord: "Am7", duration: "whole" },
      { chord: "D7", duration: "whole" },
    ],
  },
  {
    id: "jazz_swing_gentle_bridge_v3",
    type: "Jazz Ballads",
    subtype: "Swing",
    subSubtype: "Gentle Swing",
    section: "Bridge",
    variation: "Variation_03",
    bars: 7,
    key: "C",
    timeSignature: "4/4",
    tempo: 88,
    chords: ["Fmaj7", "G7", "Em7", "A7", "Dm7", "G7", "Cmaj7"],
    chordsWithDuration: [
      { chord: "Fmaj7", duration: "whole" },
      { chord: "G7", duration: "half" },
      { chord: "Em7", duration: "half" },
      { chord: "A7", duration: "whole" },
      { chord: "Dm7", duration: "half" },
      { chord: "G7", duration: "half" },
      { chord: "Cmaj7", duration: "whole" },
    ],
  },
  // Jazz Ballads → Swing → Lounge Swing
  {
    id: "jazz_swing_lounge_chorus_v1",
    type: "Jazz Ballads",
    subtype: "Swing",
    subSubtype: "Lounge Swing",
    section: "Chorus",
    variation: "Variation_01",
    bars: 7,
    key: "C",
    timeSignature: "4/4",
    tempo: 92,
    chords: ["Fmaj7", "Bb13", "Ebmaj7", "Ab13", "Dbmaj7", "G7", "Cmaj7"],
    chordsWithDuration: [
      { chord: "Fmaj7", duration: "whole" },
      { chord: "Bb13", duration: "whole" },
      { chord: "Ebmaj7", duration: "whole" },
      { chord: "Ab13", duration: "whole" },
      { chord: "Dbmaj7", duration: "whole" },
      { chord: "G7", duration: "whole" },
      { chord: "Cmaj7", duration: "whole" },
    ],
  },
  // Latin Pop → Bossa → Smooth Latin
  {
    id: "latin_bossa_smooth_verse_v1",
    type: "Latin Pop",
    subtype: "Bossa",
    subSubtype: "Smooth Latin",
    section: "Verse",
    variation: "Variation_01",
    bars: 4,
    key: "G",
    timeSignature: "4/4",
    tempo: 110,
    chords: ["Am7", "D7", "Gmaj7", "Cmaj7"],
    chordsWithDuration: [
      { chord: "Am7", duration: "whole" },
      { chord: "D7", duration: "whole" },
      { chord: "Gmaj7", duration: "whole" },
      { chord: "Cmaj7", duration: "whole" },
    ],
  },
  {
    id: "latin_bossa_smooth_chorus_v1",
    type: "Latin Pop",
    subtype: "Bossa",
    subSubtype: "Smooth Latin",
    section: "Chorus",
    variation: "Variation_01",
    bars: 4,
    key: "G",
    timeSignature: "4/4",
    tempo: 110,
    chords: ["Fmaj7", "E7", "Am7", "D9"],
    chordsWithDuration: [
      { chord: "Fmaj7", duration: "half" },
      { chord: "E7", duration: "half" },
      { chord: "Am7", duration: "half" },
      { chord: "D9", duration: "half" },
    ],
  },
  // Latin Pop → Bossa → Contemporary Latin
  {
    id: "latin_bossa_contemp_verse_v1",
    type: "Latin Pop",
    subtype: "Bossa",
    subSubtype: "Contemporary Latin",
    section: "Verse",
    variation: "Variation_01",
    bars: 4,
    key: "C",
    timeSignature: "4/4",
    tempo: 115,
    chords: ["Cmaj7", "A7", "Dm7", "G13"],
    chordsWithDuration: [
      { chord: "Cmaj7", duration: "whole" },
      { chord: "A7", duration: "whole" },
      { chord: "Dm7", duration: "whole" },
      { chord: "G13", duration: "whole" },
    ],
  },
  {
    id: "latin_bossa_contemp_bridge_v1",
    type: "Latin Pop",
    subtype: "Bossa",
    subSubtype: "Contemporary Latin",
    section: "Bridge",
    variation: "Variation_01",
    bars: 4,
    key: "C",
    timeSignature: "4/4",
    tempo: 115,
    chords: ["Fmaj7", "G7", "Em7", "A7"],
    chordsWithDuration: [
      { chord: "Fmaj7", duration: "half" },
      { chord: "G7", duration: "half" },
      { chord: "Em7", duration: "half" },
      { chord: "A7", duration: "half" },
    ],
  },
]

const getDurationWidth = (duration: ChordDuration): number => {
  switch (duration) {
    case "whole":
      return 100 // Full bar width
    case "half":
      return 50 // Half bar width
    case "quarter":
      return 25 // Quarter bar width
    case "eighth":
      return 12.5 // Eighth bar width
    default:
      return 25
  }
}

interface ProportionalChordDisplayProps {
  chordsWithDuration: ChordWithDuration[]
  timeSignature: string
  isCompact?: boolean
  currentChordIndex?: number
  className?: string
}

function ProportionalChordDisplay({
  chordsWithDuration,
  timeSignature,
  isCompact = false,
  currentChordIndex = -1,
  className,
}: ProportionalChordDisplayProps) {
  const beatsPerBar = Number.parseInt(timeSignature.split("/")[0])

  return (
    <div className={cn("relative w-full", className)}>
      {/* Background grid */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: beatsPerBar }).map((_, i) => (
          <div key={i} className="flex-1 border-r border-white/10" style={{ opacity: 0.3 }} />
        ))}
      </div>

      {/* Chord blocks */}
      <div className="relative flex items-stretch" style={{ minHeight: isCompact ? "40px" : "64px" }}>
        {chordsWithDuration.map((item, idx) => {
          const width = getDurationWidth(item.duration)
          const isActive = idx === currentChordIndex

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-center rounded transition-all",
                isCompact ? "text-sm py-1" : "text-xl py-3",
                isActive
                  ? "glossy-button text-black font-bold scale-105 z-10"
                  : "bg-gray-700/60 text-primary border border-primary/30 font-bold",
              )}
              style={{
                width: `${width}%`,
                marginRight: idx < chordsWithDuration.length - 1 ? "2px" : "0",
              }}
            >
              {item.chord}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface PhraseRibbonDisplayProps {
  chordsWithDuration: ChordWithDuration[]
  timeSignature: string
  bars: number
  isCompact?: boolean
  currentChordIndex?: number
  isPlaying?: boolean
  className?: string
  onChordClick?: (index: number) => void
}

function PhraseRibbonDisplay({
  chordsWithDuration,
  timeSignature,
  bars,
  isCompact = false,
  currentChordIndex = -1,
  isPlaying = false,
  className,
  onChordClick,
}: PhraseRibbonDisplayProps) {
  const [hoveredChordIndex, setHoveredChordIndex] = useState<number>(-1)

  // Calculate total duration in bars
  const totalBars = bars
  const phraseLength = 4 // Phrase markers every 4 bars
  const numPhrases = Math.ceil(totalBars / phraseLength)

  // Calculate cumulative positions for each chord
  const chordPositions: { chord: string; start: number; end: number; index: number }[] = []
  let currentPosition = 0

  chordsWithDuration.forEach((item, idx) => {
    const durationInBars = getDurationWidth(item.duration) / 100 // Convert percentage to bars
    chordPositions.push({
      chord: item.chord,
      start: currentPosition,
      end: currentPosition + durationInBars,
      index: idx,
    })
    currentPosition += durationInBars
  })

  // Normalize positions to fit within totalBars
  const actualTotalBars = currentPosition
  const scale = totalBars / actualTotalBars
  const normalizedPositions = chordPositions.map((pos) => ({
    ...pos,
    start: pos.start * scale,
    end: pos.end * scale,
  }))

  const ribbonHeight = isCompact ? 40 : 64
  const ribbonPadding = isCompact ? 6 : 12

  return (
    <div className={cn("relative w-full", className)}>
      {/* Phrase labels (optional, only in full size) */}
      {!isCompact && (
        <div className="flex mb-1.5">
          {Array.from({ length: numPhrases }).map((_, i) => {
            const startBar = i * phraseLength + 1
            const endBar = Math.min((i + 1) * phraseLength, totalBars)
            return (
              <div
                key={i}
                className="text-[10px] text-gray-500 font-light"
                style={{
                  width: `${(phraseLength / totalBars) * 100}%`,
                  paddingLeft: i === 0 ? "0" : "4px",
                }}
              >
                Bars {startBar}–{endBar}
              </div>
            )
          })}
        </div>
      )}

      {/* Ribbon container */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          height: `${ribbonHeight}px`,
          background: "linear-gradient(to right, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))",
        }}
      >
        {/* Phrase markers */}
        {Array.from({ length: numPhrases - 1 }).map((_, i) => {
          const position = (((i + 1) * phraseLength) / totalBars) * 100
          return <div key={i} className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${position}%` }} />
        })}

        {/* Playback cursor */}
        {isPlaying && currentChordIndex >= 0 && currentChordIndex < normalizedPositions.length && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg shadow-primary/50 transition-all duration-300 ease-linear z-20"
            style={{
              left: `${(normalizedPositions[currentChordIndex].start / totalBars) * 100}%`,
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/50" />
          </div>
        )}

        {/* Chord labels positioned along the ribbon */}
        {normalizedPositions.map((pos) => {
          const leftPercent = (pos.start / totalBars) * 100
          const widthPercent = ((pos.end - pos.start) / totalBars) * 100
          const isActive = pos.index === currentChordIndex
          const isHovered = pos.index === hoveredChordIndex

          return (
            <button
              key={pos.index}
              onClick={() => onChordClick?.(pos.index)}
              onMouseEnter={() => setHoveredChordIndex(pos.index)}
              onMouseLeave={() => setHoveredChordIndex(-1)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200",
                "font-bold cursor-pointer whitespace-nowrap",
                isCompact ? "text-xs px-1.5 py-0.5" : "text-base px-2 py-1",
                isActive && "scale-110 z-10",
                isHovered && !isActive && "scale-105",
              )}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                color: isActive ? "#fbbf24" : isHovered ? "#ffffff" : "#e5e7eb",
                textShadow: isActive || isHovered ? "0 0 8px rgba(251, 191, 36, 0.8)" : "0 1px 2px rgba(0,0,0,0.5)",
                fontSize: widthPercent < 15 ? (isCompact ? "10px" : "12px") : undefined,
              }}
            >
              {pos.chord}
            </button>
          )
        })}

        {/* Ribbon base line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30"
          style={{ marginBottom: `${ribbonPadding / 2}px` }}
        />
      </div>

      {/* Bar count indicator */}
      <div className="flex justify-between mt-1 text-[10px] text-gray-600">
        <span>Start</span>
        <span>{totalBars} bars</span>
      </div>
    </div>
  )
}

// Removed Mode type definition

interface TimelineBlock {
  id: string
  progression: ChordProgression
  position: number
}

export function ChordStudio() {
  // const [mode, setMode] = useState<Mode>("library")

  const [timelineBlocks, setTimelineBlocks] = useState<TimelineBlock[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedSubSubtype, setSelectedSubSubtype] = useState<{
    type: string
    subtype: string
    subSubtype: string
  } | null>(null)
  const [selectedProgressionId, setSelectedProgressionId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null)
  const [currentBar, setCurrentBar] = useState(0)
  const [currentChordIndex, setCurrentChordIndex] = useState(0)
  const [globalStyle, setGlobalStyle] = useState("Acoustic Ballad")
  const [globalKey, setGlobalKey] = useState("C")
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null)
  const [auditioningId, setAuditioningId] = useState<string | null>(null)

  const filteredProgressions = searchQuery
    ? MOCK_PROGRESSIONS.filter(
        (p) =>
          p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subtype.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subSubtype.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.variation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.chords.some((chord) => chord.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : []

  const buildTreeStructure = () => {
    const tree: Record<string, any> = {}

    const progressionsToUse = searchQuery ? filteredProgressions : MOCK_PROGRESSIONS

    progressionsToUse.forEach((progression) => {
      if (!tree[progression.type]) {
        tree[progression.type] = {}
      }
      if (!tree[progression.type][progression.subtype]) {
        tree[progression.type][progression.subtype] = {}
      }
      if (!tree[progression.type][progression.subtype][progression.subSubtype]) {
        tree[progression.type][progression.subtype][progression.subSubtype] = []
      }
      tree[progression.type][progression.subtype][progression.subSubtype].push(progression)
    })

    return tree
  }

  const treeStructure = buildTreeStructure()

  const selectedProgressions = selectedSubSubtype
    ? MOCK_PROGRESSIONS.filter(
        (p) =>
          p.type === selectedSubSubtype.type &&
          p.subtype === selectedSubSubtype.subtype &&
          p.subSubtype === selectedSubSubtype.subSubtype,
      )
    : []

  const selectedProgression = selectedProgressionId
    ? MOCK_PROGRESSIONS.find((p) => p.id === selectedProgressionId)
    : null

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleSelectSubSubtype = (type: string, subtype: string, subSubtype: string) => {
    setSelectedSubSubtype({ type, subtype, subSubtype })
    setSelectedProgressionId(null)
  }

  const handleAudition = (progression: ChordProgression) => {
    console.log("[v0] Auditioning progression:", progression.id)
    setAuditioningId(progression.id)
    setIsPlaying(true)
    setTimeout(() => {
      setAuditioningId(null)
      setIsPlaying(false)
    }, 2000)
  }

  const handleDoubleClickProgression = (progression: ChordProgression) => {
    console.log("[v0] Double-clicked progression, importing to timeline:", progression.id)
    handleLoadToTimeline(progression)
  }

  const handleLoadToTimeline = (progression: ChordProgression) => {
    const newBlock: TimelineBlock = {
      id: `block_${Date.now()}`,
      progression,
      position: timelineBlocks.length,
    }
    setTimelineBlocks([...timelineBlocks, newBlock])
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentBar(0)
    setCurrentBlockId(null)
    setCurrentChordIndex(0)
  }

  const handleDuplicateBlock = (blockId: string) => {
    const block = timelineBlocks.find((b) => b.id === blockId)
    if (block) {
      const newBlock: TimelineBlock = {
        id: `block_${Date.now()}`,
        progression: block.progression,
        position: timelineBlocks.length,
      }
      setTimelineBlocks([...timelineBlocks, newBlock])
    }
  }

  const handleDeleteBlock = (blockId: string) => {
    setTimelineBlocks(timelineBlocks.filter((b) => b.id !== blockId))
  }

  const handleImport = () => {
    console.log("[v0] Import MIDI/EZkeys file")
  }

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlockId(blockId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    setDragOverBlockId(blockId)
  }

  const handleDragEnd = () => {
    setDraggedBlockId(null)
    setDragOverBlockId(null)
  }

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault()
    if (!draggedBlockId || draggedBlockId === targetBlockId) return

    const draggedIndex = timelineBlocks.findIndex((b) => b.id === draggedBlockId)
    const targetIndex = timelineBlocks.findIndex((b) => b.id === targetBlockId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newBlocks = [...timelineBlocks]
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(targetIndex, 0, draggedBlock)

    newBlocks.forEach((block, idx) => {
      block.position = idx
    })

    setTimelineBlocks(newBlocks)
    setDraggedBlockId(null)
    setDragOverBlockId(null)
  }

  const handleChordClick = (progression: ChordProgression, chordIndex: number) => {
    console.log("[v0] Clicked chord:", progression.chordsWithDuration[chordIndex].chord)
    handleAudition(progression)
  }

  return (
    <div className="h-full flex flex-col bg-transparent backdrop-blur-sm">
      <div className="px-6 py-3 border-b border-border/50 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Style:</span>
              <Select value={globalStyle} onValueChange={setGlobalStyle}>
                <SelectTrigger className="w-48 h-9 bg-black/30 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Acoustic Ballad">Acoustic Ballad</SelectItem>
                  <SelectItem value="Bossa Nova">Bossa Nova</SelectItem>
                  <SelectItem value="Pop Rock">Pop Rock</SelectItem>
                  <SelectItem value="Swing">Swing</SelectItem>
                  <SelectItem value="Country">Country</SelectItem>
                  <SelectItem value="Jazz">Jazz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Key:</span>
              <Select value={globalKey} onValueChange={setGlobalKey}>
                <SelectTrigger className="w-32 h-9 bg-black/30 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">C Major</SelectItem>
                  <SelectItem value="C#">C# Major</SelectItem>
                  <SelectItem value="D">D Major</SelectItem>
                  <SelectItem value="Eb">Eb Major</SelectItem>
                  <SelectItem value="E">E Major</SelectItem>
                  <SelectItem value="F">F Major</SelectItem>
                  <SelectItem value="F#">F# Major</SelectItem>
                  <SelectItem value="G">G Major</SelectItem>
                  <SelectItem value="Ab">Ab Major</SelectItem>
                  <SelectItem value="A">A Major</SelectItem>
                  <SelectItem value="Bb">Bb Major</SelectItem>
                  <SelectItem value="B">B Major</SelectItem>
                  <SelectItem value="Cm">C Minor</SelectItem>
                  <SelectItem value="Am">A Minor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-xs text-gray-500">Global settings apply to all playback and imports</div>
        </div>
      </div>

      <div className="p-6 border-b border-border glossy-panel shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Chord Studio</h2>
            <p className="text-sm text-gray-400 mt-1">Browse progressions and arrange your timeline</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Library section - left side */}
        <div className="w-80 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search progressions..."
              className="pl-10 bg-black/30 border-white/10 text-white placeholder:text-gray-500 h-11"
            />
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-0.5 pr-2">
              {Object.keys(treeStructure).map((type) => {
                const typeId = `type-${type}`
                const isTypeExpanded = expandedNodes.has(typeId)

                return (
                  <div key={type}>
                    <button
                      onClick={() => toggleNode(typeId)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-white hover:bg-white/5 rounded transition-colors"
                    >
                      {isTypeExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                      {isTypeExpanded ? (
                        <FolderOpen className="w-4 h-4 flex-shrink-0 text-amber-400" />
                      ) : (
                        <Folder className="w-4 h-4 flex-shrink-0 text-amber-400" />
                      )}
                      <span className="truncate">{type}</span>
                    </button>

                    {isTypeExpanded && (
                      <div className="ml-4">
                        {Object.keys(treeStructure[type]).map((subtype) => {
                          const subtypeId = `subtype-${type}-${subtype}`
                          const isSubtypeExpanded = expandedNodes.has(subtypeId)

                          return (
                            <div key={subtype}>
                              <button
                                onClick={() => toggleNode(subtypeId)}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-white hover:bg-white/5 rounded transition-colors"
                              >
                                {isSubtypeExpanded ? (
                                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                )}
                                {isSubtypeExpanded ? (
                                  <FolderOpen className="w-4 h-4 flex-shrink-0 text-blue-400" />
                                ) : (
                                  <Folder className="w-4 h-4 flex-shrink-0 text-blue-400" />
                                )}
                                <span className="truncate">{subtype}</span>
                              </button>

                              {isSubtypeExpanded && (
                                <div className="ml-4">
                                  {Object.keys(treeStructure[type][subtype]).map((subSubtype) => {
                                    const isSelected =
                                      selectedSubSubtype?.type === type &&
                                      selectedSubSubtype?.subtype === subtype &&
                                      selectedSubSubtype?.subSubtype === subSubtype

                                    return (
                                      <button
                                        key={subSubtype}
                                        onClick={() => handleSelectSubSubtype(type, subtype, subSubtype)}
                                        className={cn(
                                          "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors",
                                          isSelected
                                            ? "bg-primary/20 text-primary font-medium"
                                            : "text-white hover:bg-white/5",
                                        )}
                                      >
                                        <Folder className="w-4 h-4 flex-shrink-0 text-teal-400" />
                                        <span className="truncate">{subSubtype}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Progressions list - middle section */}
        <div className="flex-1 flex flex-col gap-4">
          {selectedSubSubtype ? (
            <>
              <div className="premium-card p-4">
                <div className="text-sm text-gray-400 mb-1">Selected Category</div>
                <div className="text-lg font-bold text-white">
                  {selectedSubSubtype.type} › {selectedSubSubtype.subtype} › {selectedSubSubtype.subSubtype}
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  {selectedProgressions.map((progression) => (
                    <div
                      key={progression.id}
                      onClick={() => setSelectedProgressionId(progression.id)}
                      onDoubleClick={() => handleDoubleClickProgression(progression)}
                      className={cn(
                        "premium-card p-4 cursor-pointer transition-all relative",
                        selectedProgressionId === progression.id
                          ? "ring-2 ring-primary bg-primary/10"
                          : "hover:bg-white/5",
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAudition(progression)
                        }}
                        className={cn(
                          "absolute top-4 right-4 p-2 rounded-lg border transition-all group",
                          auditioningId === progression.id
                            ? "bg-primary/40 border-primary scale-110 shadow-lg shadow-primary/50"
                            : "bg-black/40 hover:bg-primary/20 border-primary/30 hover:border-primary",
                        )}
                        title="Audition progression"
                      >
                        <Ear
                          className={cn(
                            "w-5 h-5 transition-all",
                            auditioningId === progression.id
                              ? "text-white animate-pulse"
                              : "text-primary group-hover:scale-110",
                          )}
                        />
                      </button>

                      <div className="flex items-start justify-between mb-3 pr-12">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">
                            {progression.section} ({progression.variation})
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{progression.key}</span>
                            <span>•</span>
                            <span>{progression.tempo} BPM</span>
                            <span>•</span>
                            <span>{progression.timeSignature}</span>
                            <span>•</span>
                            <span>{progression.bars} bars</span>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1.5 rounded bg-primary/20 text-primary font-medium">
                          {progression.section}
                        </span>
                      </div>

                      <PhraseRibbonDisplay
                        chordsWithDuration={progression.chordsWithDuration}
                        timeSignature={progression.timeSignature}
                        bars={progression.bars}
                        isCompact={true}
                        className="mt-3"
                        onChordClick={(idx) => handleChordClick(progression, idx)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Music2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a category from the tree to view progressions</p>
              </div>
            </div>
          )}
        </div>

        {/* Timeline section - right side */}
        <div className="w-96 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Timeline</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlay}
                size="sm"
                className={cn("w-20 h-9", isPlaying ? "glossy-button" : "premium-card")}
              >
                {isPlaying ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? "Stop" : "Play"}
              </Button>

              <Button
                onClick={() => setIsLooping(!isLooping)}
                size="sm"
                className={cn("h-9 w-9 p-0", isLooping ? "glossy-button" : "premium-card")}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {timelineBlocks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center premium-card p-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">No sections in timeline</p>
                <p className="text-xs text-gray-500">Double-click a progression to add it</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-3 pb-4">
                {timelineBlocks.map((block) => (
                  <div
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, block.id)}
                    onDragOver={(e) => handleDragOver(e, block.id)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, block.id)}
                    className={cn(
                      "premium-card p-4 transition-all cursor-move relative",
                      currentBlockId === block.id && "ring-2 ring-primary shadow-2xl shadow-primary/30",
                      draggedBlockId === block.id && "opacity-50",
                      dragOverBlockId === block.id && "ring-2 ring-blue-400",
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-primary truncate uppercase tracking-wide">
                          {block.progression.section}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{block.progression.variation}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/10">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicateBlock(block.id)}>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteBlock(block.id)} className="text-red-400">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <PhraseRibbonDisplay
                      chordsWithDuration={block.progression.chordsWithDuration}
                      timeSignature={block.progression.timeSignature}
                      bars={block.progression.bars}
                      currentChordIndex={currentBlockId === block.id ? currentChordIndex : -1}
                      isPlaying={isPlaying && currentBlockId === block.id}
                      isCompact={true}
                      className="mb-3"
                      onChordClick={(idx) => handleChordClick(block.progression, idx)}
                    />

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/10">
                      <span>{block.progression.key}</span>
                      <span>{block.progression.bars} bars</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
