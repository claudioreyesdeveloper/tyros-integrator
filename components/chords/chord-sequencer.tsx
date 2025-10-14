"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import {
  Play,
  StopCircle,
  Download,
  Trash2,
  Plus,
  Minus,
  Music,
  Settings,
  Save,
  FolderOpen,
  Copy,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useMIDI } from "@/lib/midi-context"
import { cn } from "@/lib/utils"

const STYLE_PARTS = [
  "Intro 1",
  "Intro 2",
  "Intro 3",
  "Main A",
  "Main B",
  "Main C",
  "Main D",
  "Fill",
  "Break",
  "Ending 1",
  "Ending 2",
  "Ending 3",
]

const SECTION_COLORS = {
  Intro: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  Verse: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  Chorus: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  Bridge: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  Outro: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
}

const ROOT_NOTES = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"]

const CHORD_QUALITIES = ["Major", "Minor", "Dominant", "Diminished", "Augmented", "Suspended"]

const CHORD_EXTENSIONS: Record<string, string[]> = {
  Major: ["none", "6", "maj7", "add9", "9", "maj9", "6/9", "maj7(#11)", "maj13"],
  Minor: ["none", "m6", "m7", "m9", "m11", "m(maj7)", "m7(b5)"],
  Dominant: ["7", "9", "11", "13", "7sus4", "7(b9)", "7(#9)", "7(b5)", "7(#5)", "7(b13)"],
  Diminished: ["dim", "dim7"],
  Augmented: ["aug", "aug7", "maj7(#5)"],
  Suspended: ["sus2", "sus4", "7sus2", "7sus4"],
}

const BASS_NOTES = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"]

const SECTION_TYPES = ["Intro", "Verse", "Chorus", "Bridge", "Outro"]

const STYLE_CATEGORIES = ["Pop/Rock", "Ballad", "Jazz", "Dance", "Latin", "Country", "R&B", "World"]

const STYLES_BY_CATEGORY: Record<string, string[]> = {
  "Pop/Rock": ["8BeatModern", "16Beat", "PopShuffle", "RockShuffle"],
  Ballad: ["6/8ModernEP", "PianoBallad", "OrganBallad"],
  Jazz: ["BigBandFast", "JazzClub", "SwingFast"],
  Dance: ["EuroTrance", "ClubDance", "Ibiza"],
  Latin: ["Bossanova", "Samba", "Mambo"],
  Country: ["CountryPop", "CountrySwing"],
  "R&B": ["Soul", "Motown", "6/8Soul"],
  World: ["Reggae", "Ska", "Calypso"],
}

type Resolution = "whole" | "half" | "quarter"

interface Chord {
  id: string
  symbol: string
  beat: number
  duration: number
}

interface Section {
  id: string
  name: string
  bars: number
  stylePart: string
  color: string
  chords: Chord[]
}

interface ChordSequencerProps {
  chordState: {
    sections: Section[]
    activeSection: string
    resolution: Resolution
    selectedCategory: string
    selectedStyle: string
    tempo: number
    localControl: boolean
    clockSource: "internal" | "external"
    accompaniment: boolean
  }
  setChordState: React.Dispatch<React.SetStateAction<ChordSequencerProps["chordState"]>>
}

export function ChordSequencer({ chordState, setChordState }: ChordSequencerProps) {
  const { api } = useMIDI()
  const { toast } = useToast()

  const {
    sections,
    activeSection,
    resolution,
    selectedCategory,
    selectedStyle,
    tempo,
    localControl,
    clockSource,
    accompaniment,
  } = chordState

  const setSections = (updater: Section[] | ((prev: Section[]) => Section[])) => {
    setChordState((prev) => ({
      ...prev,
      sections: typeof updater === "function" ? updater(prev.sections) : updater,
    }))
  }

  const setActiveSection = (value: string) => {
    setChordState((prev) => ({ ...prev, activeSection: value }))
  }

  const setResolution = (value: Resolution) => {
    setChordState((prev) => ({ ...prev, resolution: value }))
  }

  const setSelectedCategory = (value: string) => {
    setChordState((prev) => ({ ...prev, selectedCategory: value }))
  }

  const setSelectedStyle = (value: string) => {
    setChordState((prev) => ({ ...prev, selectedStyle: value }))
  }

  const setTempo = (value: number) => {
    setChordState((prev) => ({ ...prev, tempo: value }))
  }

  const setLocalControl = (value: boolean) => {
    setChordState((prev) => ({ ...prev, localControl: value }))
  }

  const setClockSource = (value: "internal" | "external") => {
    setChordState((prev) => ({ ...prev, clockSource: value }))
  }

  const setAccompaniment = (value: boolean) => {
    setChordState((prev) => ({ ...prev, accompaniment: value }))
  }

  // Keep local UI state that doesn't need to persist
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const [editingCell, setEditingCell] = useState<{ sectionId: string; beat: number } | null>(null)
  const [chordInput, setChordInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const [showChordWheel, setShowChordWheel] = useState(false)
  const [wheelSection, setWheelSection] = useState<string | null>(null)
  const [wheelBeat, setWheelBeat] = useState<number>(0)
  const [selectedRoot, setSelectedRoot] = useState("C")
  const [selectedQuality, setSelectedQuality] = useState("Major")
  const [selectedExtension, setSelectedExtension] = useState("none")
  const [selectedBass, setSelectedBass] = useState<string | null>(null)
  const [selectedChordDuration, setSelectedChordDuration] = useState(4) // Default to 1 bar (4 beats)

  const [resizingSection, setResizingSection] = useState<string | null>(null)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartBars, setResizeStartBars] = useState(0)

  const [showStylePartMenu, setShowStylePartMenu] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  // Removed: const [selectedCategory, setSelectedCategory] = useState("Pop/Rock")
  // Removed: const [selectedStyle, setSelectedStyle] = useState("8BeatModern")
  // Removed: const [localControl, setLocalControl] = useState(true)
  // Removed: const [clockSource, setClockSource] = useState<"internal" | "external">("internal")
  // Removed: const [accompaniment, setAccompaniment] = useState(true)
  // Removed: const [tempo, setTempo] = useState(120)

  const [showMobileControls, setShowMobileControls] = useState(false)

  const [clipboardChord, setClipboardChord] = useState<Chord | null>(null)

  const [activeChordControls, setActiveChordControls] = useState<string | null>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [chordMenuOpen, setChordMenuOpen] = useState<string | null>(null)

  const [draggingChord, setDraggingChord] = useState<{ sectionId: string; chordId: string } | null>(null)
  const [dragOverBeat, setDragOverBeat] = useState<number | null>(null)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingCell])

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }
    checkTouch()
    window.addEventListener("resize", checkTouch)
    return () => window.removeEventListener("resize", checkTouch)
  }, [])

  useEffect(() => {
    if (resizingSection) {
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - resizeStartX
        const barWidth = 40 // 40px per bar as per spec
        const deltaBars = Math.round(deltaX / barWidth)
        const newBars = Math.max(1, resizeStartBars + deltaBars)
        handleUpdateSection(resizingSection, { bars: newBars })
      }

      const handleMouseUp = () => {
        setResizingSection(null)
      }

      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [resizingSection, resizeStartX, resizeStartBars])

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: "New Section",
      bars: 4,
      stylePart: "Main A",
      color: SECTION_COLORS.Verse,
      chords: [],
    }
    setSections([...sections, newSection])
    toast({
      title: "Section Added",
      description: "New section added to arrangement",
    })
  }

  const handleUpdateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const handleCycleStylePart = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const currentIndex = STYLE_PARTS.indexOf(section.stylePart)
    const nextIndex = (currentIndex + 1) % STYLE_PARTS.length
    const nextPart = STYLE_PARTS[nextIndex]

    handleUpdateSection(sectionId, { stylePart: nextPart })
    toast({
      title: "Style Part Changed",
      description: `${nextPart} selected`,
    })
  }

  const handleStylePartLongPress = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowStylePartMenu(sectionId)
  }

  const handleResizeStart = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    setResizingSection(sectionId)
    setResizeStartX(e.clientX)
    setResizeStartBars(section.bars)
  }

  const handleCellClick = (sectionId: string, beat: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const existingChord = section.chords.find((c) => c.beat === beat)
    if (existingChord) {
      setChordInput(existingChord.symbol)
    } else {
      setChordInput("")
    }
    setEditingCell({ sectionId, beat })
  }

  const handleChordInputSubmit = () => {
    if (!editingCell || !chordInput.trim()) {
      setEditingCell(null)
      return
    }

    const { sectionId, beat } = editingCell
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const resolutionDuration = resolution === "whole" ? 4 : resolution === "half" ? 2 : 1

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      symbol: chordInput.trim(),
      beat,
      duration: resolutionDuration,
    }

    const filteredChords = section.chords.filter((c) => c.beat !== beat)

    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, chords: [...filteredChords, newChord].sort((a, b) => a.beat - b.beat) } : s,
      ),
    )

    setEditingCell(null)
    setChordInput("")
    toast({
      title: "Chord Added",
      description: `${chordInput.trim()} added to section`,
    })
  }

  const handleChordInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleChordInputSubmit()
    } else if (e.key === "Escape") {
      setEditingCell(null)
      setChordInput("")
    } else if (e.key === "Tab" && editingCell) {
      e.preventDefault()
      const section = sections.find((s) => s.id === editingCell.sectionId)
      if (!section) return

      const nextBeat = editingCell.beat + 1
      if (nextBeat < section.bars * 4) {
        handleChordInputSubmit()
        handleCellClick(editingCell.sectionId, nextBeat)
      }
    } else if (e.key === "ArrowRight" && editingCell) {
      e.preventDefault()
      const section = sections.find((s) => s.id === editingCell.sectionId)
      if (!section) return

      const nextBeat = editingCell.beat + 1
      if (nextBeat < section.bars * 4) {
        handleChordInputSubmit()
        handleCellClick(editingCell.sectionId, nextBeat)
      }
    } else if (e.key === "ArrowLeft" && editingCell) {
      e.preventDefault()
      const prevBeat = editingCell.beat - 1
      if (prevBeat >= 0) {
        handleChordInputSubmit()
        handleCellClick(editingCell.sectionId, prevBeat)
      }
    }
  }

  const handleSaveSong = () => {
    const songData = {
      sections,
      metadata: {
        category: selectedCategory,
        style: selectedStyle,
        tempo,
        savedAt: new Date().toISOString(),
      },
    }

    const dataStr = JSON.stringify(songData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tyros-song-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Song Saved",
      description: "Song exported as JSON file",
    })
  }

  const handleOpenSong = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const songData = JSON.parse(event.target?.result as string)
          if (songData.sections) {
            setSections(songData.sections)
            if (songData.sections.length > 0) {
              setActiveSection(songData.sections[0].id)
            }
          }
          if (songData.metadata) {
            if (songData.metadata.category) setSelectedCategory(songData.metadata.category)
            if (songData.metadata.style) setSelectedStyle(songData.metadata.style)
            if (songData.metadata.tempo) setTempo(songData.metadata.tempo)
          }
          toast({
            title: "Song Loaded",
            description: "Song imported successfully",
          })
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load song file",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleOpenChordWheel = (sectionId: string, beat: number) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    // Check if there's an existing chord at this beat
    const existingChord = section.chords.find((c) => c.beat === beat)
    if (existingChord) {
      setSelectedChordDuration(existingChord.duration)

      const symbol = existingChord.symbol

      // Extract root note (first 1-2 characters)
      let root = symbol[0]
      if (symbol[1] === "#" || symbol[1] === "b") {
        root += symbol[1]
      }
      // Convert to display format (e.g., "C#" to "C#/Db")
      const rootIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(
        root.replace("b", "#"),
      )
      if (rootIndex !== -1) {
        setSelectedRoot(ROOT_NOTES[rootIndex])
      }

      // Determine quality and extension
      if (symbol.includes("dim7")) {
        setSelectedQuality("Diminished")
        setSelectedExtension("dim7")
      } else if (symbol.includes("dim")) {
        setSelectedQuality("Diminished")
        setSelectedExtension("dim")
      } else if (symbol.includes("aug7")) {
        setSelectedQuality("Augmented")
        setSelectedExtension("aug7")
      } else if (symbol.includes("aug")) {
        setSelectedQuality("Augmented")
        setSelectedExtension("aug")
      } else if (symbol.includes("7sus4")) {
        setSelectedQuality("Suspended")
        setSelectedExtension("7sus4")
      } else if (symbol.includes("7sus2")) {
        setSelectedQuality("Suspended")
        setSelectedExtension("7sus2")
      } else if (symbol.includes("sus4")) {
        setSelectedQuality("Suspended")
        setSelectedExtension("sus4")
      } else if (symbol.includes("sus2")) {
        setSelectedQuality("Suspended")
        setSelectedExtension("sus2")
      } else if (symbol.match(/[^m]7/)) {
        // Dominant 7th (not m7)
        setSelectedQuality("Dominant")
        if (symbol.includes("7(b9)")) setSelectedExtension("7(b9)")
        else if (symbol.includes("7(#9)")) setSelectedExtension("7(#9)")
        else if (symbol.includes("7(b5)")) setSelectedExtension("7(b5)")
        else if (symbol.includes("7(#5)")) setSelectedExtension("7(#5)")
        else if (symbol.includes("13")) setSelectedExtension("13")
        else if (symbol.includes("11")) setSelectedExtension("11")
        else if (symbol.includes("9")) setSelectedExtension("9")
        else setSelectedExtension("7")
      } else if (symbol.includes("m(maj7)")) {
        setSelectedQuality("Minor")
        setSelectedExtension("m(maj7)")
      } else if (symbol.includes("m7(b5)")) {
        setSelectedQuality("Minor")
        setSelectedExtension("m7(b5)")
      } else if (symbol.includes("m11")) {
        setSelectedQuality("Minor")
        setSelectedExtension("m11")
      } else if (symbol.includes("m9")) {
        setSelectedQuality("Minor")
        setSelectedExtension("m9")
      } else if (symbol.includes("m7")) {
        setSelectedQuality("Minor")
        setSelectedExtension("m7")
      } else if (symbol.includes("m6")) {
        setSelectedQuality("Minor")
        setSelectedExtension("m6")
      } else if (symbol.includes("m")) {
        setSelectedQuality("Minor")
        setSelectedExtension("none")
      } else if (symbol.includes("maj7(#11)")) {
        setSelectedQuality("Major")
        setSelectedExtension("maj7(#11)")
      } else if (symbol.includes("maj13")) {
        setSelectedQuality("Major")
        setSelectedExtension("maj13")
      } else if (symbol.includes("maj9")) {
        setSelectedQuality("Major")
        setSelectedExtension("maj9")
      } else if (symbol.includes("maj7")) {
        setSelectedQuality("Major")
        setSelectedExtension("maj7")
      } else if (symbol.includes("6/9")) {
        setSelectedQuality("Major")
        setSelectedExtension("6/9")
      } else if (symbol.includes("add9")) {
        setSelectedQuality("Major")
        setSelectedExtension("add9")
      } else if (symbol.includes("6")) {
        setSelectedQuality("Major")
        setSelectedExtension("6")
      } else if (symbol.includes("9")) {
        setSelectedQuality("Major")
        setSelectedExtension("9")
      } else {
        setSelectedQuality("Major")
        setSelectedExtension("none")
      }

      // Extract bass note
      if (symbol.includes("/")) {
        const bassNote = symbol.split("/")[1]
        // Convert to display format
        const bassIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(
          bassNote.replace("b", "#"),
        )
        if (bassIndex !== -1) {
          setSelectedBass(BASS_NOTES[bassIndex])
        }
      } else {
        setSelectedBass(null)
      }
    } else {
      setSelectedChordDuration(4)

      // Reset to defaults for new chord
      setSelectedRoot("C")
      setSelectedQuality("Major")
      setSelectedExtension("none")
      setSelectedBass(null)
    }

    setWheelSection(sectionId)
    setWheelBeat(beat)
    setShowChordWheel(true)
  }

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality)
    // Reset extension to first valid option for this quality
    const validExtensions = CHORD_EXTENSIONS[quality] || ["none"]
    setSelectedExtension(validExtensions[0])
  }

  const handleConfirmChordWheel = () => {
    if (!wheelSection) return

    let chordSymbol = selectedRoot.split("/")[0] // Use first part of root (e.g., "C#" from "C#/Db")

    // Build chord symbol based on quality and extension
    if (selectedQuality === "Major") {
      if (selectedExtension === "none") {
        // Just the root for major triad
      } else {
        chordSymbol += selectedExtension
      }
    } else if (selectedQuality === "Minor") {
      if (selectedExtension === "none") {
        chordSymbol += "m"
      } else {
        chordSymbol += selectedExtension
      }
    } else if (selectedQuality === "Dominant") {
      chordSymbol += selectedExtension
    } else if (selectedQuality === "Diminished") {
      chordSymbol += selectedExtension
    } else if (selectedQuality === "Augmented") {
      chordSymbol += selectedExtension
    } else if (selectedQuality === "Suspended") {
      chordSymbol += selectedExtension
    }

    if (selectedBass) {
      chordSymbol += `/${selectedBass.split("/")[0]}`
    }

    const section = sections.find((s) => s.id === wheelSection)
    if (!section) return

    const existingChord = section.chords.find((c) => c.beat === wheelBeat)

    const chordDuration = selectedChordDuration

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      symbol: chordSymbol,
      beat: wheelBeat,
      duration: chordDuration,
    }

    const filteredChords = section.chords.filter((c) => c.beat !== wheelBeat)

    setSections(
      sections.map((s) =>
        s.id === wheelSection ? { ...s, chords: [...filteredChords, newChord].sort((a, b) => a.beat - b.beat) } : s,
      ),
    )

    setShowChordWheel(false)
    toast({
      title: "Chord Added",
      description: `${chordSymbol} added to section`,
    })
  }

  const handleDeleteChord = (sectionId: string, chordId: string) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, chords: s.chords.filter((c) => c.id !== chordId) } : s)),
    )
    toast({
      title: "Chord Deleted",
      description: "Chord removed from section",
    })
  }

  const handleIncreaseChordDuration = (sectionId: string, chordId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s

        const targetChord = s.chords.find((c) => c.id === chordId)
        if (!targetChord) return s

        const oldDuration = targetChord.duration
        const newDuration = Math.min(4, oldDuration + 1) // Max 4 beats (1 bar)
        const durationChange = newDuration - oldDuration

        // If no change, return as is
        if (durationChange === 0) return s

        // Update the target chord and shift all subsequent chords forward
        return {
          ...s,
          chords: s.chords
            .map((c) => {
              if (c.id === chordId) {
                // Update the target chord's duration
                return { ...c, duration: newDuration }
              } else if (c.beat > targetChord.beat) {
                // Shift subsequent chords forward
                return { ...c, beat: c.beat + durationChange }
              }
              return c
            })
            .sort((a, b) => a.beat - b.beat),
        }
      }),
    )
    toast({
      title: "Duration Increased",
      description: "Chord duration extended, subsequent chords adjusted",
    })
  }

  const handleDecreaseChordDuration = (sectionId: string, chordId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s

        const targetChord = s.chords.find((c) => c.id === chordId)
        if (!targetChord) return s

        const oldDuration = targetChord.duration
        const newDuration = Math.max(1, oldDuration - 1) // Min 1 beat (1/4 bar)

        // If no change, return as is
        if (newDuration === oldDuration) return s

        // Update the target chord's duration, do NOT shift subsequent chords
        // This leaves empty space that can be filled with new chords
        return {
          ...s,
          chords: s.chords
            .map((c) => {
              if (c.id === chordId) {
                // Update the target chord's duration
                return { ...c, duration: newDuration }
              }
              return c
            })
            .sort((a, b) => a.beat - b.beat),
        }
      }),
    )
    toast({
      title: "Duration Decreased",
      description: "Chord duration reduced, empty space available for new chords",
    })
  }

  const handleCopyChord = (sectionId: string, chordId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const chord = section.chords.find((c) => c.id === chordId)
    if (!chord) return

    setClipboardChord(chord)
    toast({
      title: "Chord Copied",
      description: `${chord.symbol} copied to clipboard`,
    })
  }

  const handlePasteChord = (sectionId: string, beat: number) => {
    if (!clipboardChord) return

    const section = sections.find((s) => s.id === sectionId)
    if (!section) return

    const newChord: Chord = {
      id: `chord-${Date.now()}`,
      symbol: clipboardChord.symbol,
      beat,
      duration: clipboardChord.duration,
    }

    const filteredChords = section.chords.filter((c) => c.beat !== beat)

    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, chords: [...filteredChords, newChord].sort((a, b) => a.beat - b.beat) } : s,
      ),
    )

    setClipboardChord(null)

    toast({
      title: "Chord Pasted",
      description: `${clipboardChord.symbol} pasted to section`,
    })
  }

  const cycleResolution = () => {
    const resolutions: Resolution[] = ["whole", "half", "quarter"]
    const currentIndex = resolutions.indexOf(resolution)
    const nextIndex = (currentIndex + 1) % resolutions.length
    setResolution(resolutions[nextIndex])
  }

  const handlePlay = () => {
    setIsPlaying(true)
    toast({
      title: "Playback Started",
      description: "Playing arrangement",
    })
  }

  const handleStop = () => {
    setIsPlaying(false)
    toast({
      title: "Playback Stopped",
      description: "Arrangement stopped",
    })
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast({
        title: "Recording Started",
        description: "Capturing MIDI output from Tyros5",
      })
    } else {
      toast({
        title: "Recording Stopped",
        description: "MIDI clip ready to drag to DAW",
      })
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    const styles = STYLES_BY_CATEGORY[category]
    if (styles && styles.length > 0) {
      setSelectedStyle(styles[0])
    }
  }

  const handleTempoChange = (delta: number) => {
    setTempo(Math.max(40, Math.min(240, tempo + delta)))
  }

  const activeS = sections.find((s) => s.id === activeSection)

  // const handleChordTap = (chordId: string, e: React.MouseEvent | React.TouchEvent) => {
  //   e.stopPropagation()
  //   if (isTouchDevice) {
  //     // Toggle controls visibility on touch devices
  //     setActiveChordControls(activeChordControls === chordId ? null : chordId)
  //   }
  // }

  // Add drag-and-drop handlers for chords
  const handleChordDragStart = (e: React.DragEvent, sectionId: string, chordId: string) => {
    e.stopPropagation()
    setDraggingChord({ sectionId, chordId })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleChordDragEnd = () => {
    setDraggingChord(null)
    setDragOverBeat(null)
    setIsDragging(false)
    // setLastTapTime(0) // Reset tap timers on drag end - REMOVED
    // setLastTapChordId(null) - REMOVED
  }

  const handleCellDragOver = (e: React.DragEvent, beat: number) => {
    if (!draggingChord) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverBeat(beat)
  }

  const handleCellDrop = (e: React.DragEvent, sectionId: string, targetBeat: number) => {
    e.preventDefault()
    if (!draggingChord) return

    const { sectionId: sourceSectionId, chordId } = draggingChord

    // Find the chord being dragged
    const sourceSection = sections.find((s) => s.id === sourceSectionId)
    if (!sourceSection) return

    const chord = sourceSection.chords.find((c) => c.id === chordId)
    if (!chord) return

    // If dropping in the same position, do nothing
    if (sourceSectionId === sectionId && chord.beat === targetBeat) {
      handleChordDragEnd()
      return
    }

    // Update sections
    setSections(
      sections.map((s) => {
        if (s.id === sourceSectionId) {
          // Remove chord from source section
          const remainingChords = s.chords.filter((c) => c.id !== chordId)

          if (sourceSectionId === sectionId) {
            // Moving within same section
            const newChord = { ...chord, beat: targetBeat }
            const allChords = [...remainingChords, newChord].sort((a, b) => a.beat - b.beat)

            // Adjust positions to prevent overlaps
            const adjustedChords = allChords.reduce((acc, curr, idx) => {
              if (idx === 0) {
                acc.push(curr)
              } else {
                const prev = acc[idx - 1]
                const minBeat = prev.beat + prev.duration
                if (curr.beat < minBeat) {
                  acc.push({ ...curr, beat: minBeat })
                } else {
                  acc.push(curr)
                }
              }
              return acc
            }, [] as Chord[])

            return { ...s, chords: adjustedChords }
          } else {
            // Moving to different section - just remove from source
            return { ...s, chords: remainingChords }
          }
        } else if (s.id === sectionId && sourceSectionId !== sectionId) {
          // Add chord to target section
          const newChord = { ...chord, beat: targetBeat, id: `chord-${Date.now()}` }
          const allChords = [...s.chords, newChord].sort((a, b) => a.beat - b.beat)

          // Adjust positions to prevent overlaps
          const adjustedChords = allChords.reduce((acc, curr, idx) => {
            if (idx === 0) {
              acc.push(curr)
            } else {
              const prev = acc[idx - 1]
              const minBeat = prev.beat + prev.duration
              if (curr.beat < minBeat) {
                acc.push({ ...curr, beat: minBeat })
              } else {
                acc.push(curr)
              }
            }
            return acc
          }, [] as Chord[])

          return { ...s, chords: adjustedChords }
        }
        return s
      }),
    )

    toast({
      title: "Chord Moved",
      description: "Chord repositioned and surrounding chords adjusted",
    })

    handleChordDragEnd()
  }

  const handleChordTouchStart = (e: React.TouchEvent, sectionId: string, chordId: string) => {
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggingChord({ sectionId, chordId })
    setIsDragging(true)
    // Set tap timers here too, for when touch move doesn't trigger a drag but a tap
    // setLastTapTime(Date.now()) // REMOVED
    // setLastTapChordId(chordId) // REMOVED
  }

  const handleChordTouchMove = (e: React.TouchEvent) => {
    if (!draggingChord || !touchStartPos) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)

    // Only start dragging if moved more than 10px
    if (deltaX > 10 || deltaY > 10) {
      setIsDragging(true)

      // Find the element under the touch point
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const beatCell = element?.closest("[data-beat]")
      if (beatCell) {
        const beat = Number.parseInt(beatCell.getAttribute("data-beat") || "0")
        setDragOverBeat(beat)
      }
    }
  }

  const handleChordTouchEnd = (e: React.TouchEvent, sectionId: string) => {
    if (!draggingChord || !isDragging || dragOverBeat === null) {
      handleChordDragEnd()
      return
    }

    // Perform the drop
    handleCellDrop(e as any, sectionId, dragOverBeat)
  }

  const availableExtensions = CHORD_EXTENSIONS[selectedQuality] || ["none"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
              Tyros Composer
            </h1>
          </div>

          <Button
            onClick={() => setShowMobileControls(!showMobileControls)}
            className="lg:hidden bg-amber-500 hover:bg-amber-600 text-black"
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Controls
          </Button>
        </div>

        {/* Style & Category - moved to top */}
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 shadow-xl">
          <h3 className="text-lg font-bold text-amber-500 uppercase mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
            Style & Category
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block font-semibold">Category</label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/30 text-white h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block font-semibold">Style</label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/30 text-white h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES_BY_CATEGORY[selectedCategory]?.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Song Timeline */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-amber-500 flex items-center gap-2">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  Song Timeline
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenSong}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Open Song
                  </Button>
                  <Button
                    onClick={handleSaveSong}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Song
                  </Button>
                  <Button
                    onClick={handleAddSection}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Section
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/50 scrollbar-track-zinc-800">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "relative rounded-xl cursor-pointer transition-all flex-shrink-0 shadow-lg hover:shadow-2xl",
                      "border-2 hover:scale-105",
                      activeSection === section.id ? "border-amber-500 ring-2 ring-amber-500/50" : "border-transparent",
                    )}
                    style={{
                      width: "280px",
                      background: SECTION_COLORS[section.name as keyof typeof SECTION_COLORS] || section.color,
                      minWidth: "280px",
                    }}
                  >
                    <div className="p-4 h-full flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-white/80 mb-1 block uppercase tracking-wide">
                          Song Structure
                        </label>
                        <Select
                          value={section.name}
                          onValueChange={(value) => {
                            handleUpdateSection(section.id, {
                              name: value,
                              color: SECTION_COLORS[value as keyof typeof SECTION_COLORS] || section.color,
                            })
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs bg-black/40 border-none text-white font-bold backdrop-blur-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTION_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-white/80 mb-1 block uppercase tracking-wide">
                          Style Element
                        </label>
                        <Select
                          value={section.stylePart}
                          onValueChange={(value) => handleUpdateSection(section.id, { stylePart: value })}
                        >
                          <SelectTrigger className="h-9 text-xs bg-black/40 border-none text-white font-bold backdrop-blur-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STYLE_PARTS.map((part) => (
                              <SelectItem key={part} value={part}>
                                {part}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-white/80 mb-1 block uppercase tracking-wide">
                          Number of Bars
                        </label>
                        <Select
                          value={section.bars.toString()}
                          onValueChange={(value) => handleUpdateSection(section.id, { bars: Number.parseInt(value) })}
                        >
                          <SelectTrigger className="h-9 text-xs bg-black/40 border-none text-white font-bold backdrop-blur-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? "bar" : "bars"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Resize Handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-black/30 flex items-center justify-center rounded-r-xl transition-colors"
                      onMouseDown={(e) => handleResizeStart(section.id, e)}
                    >
                      <div className="w-1 h-8 bg-white/60 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chord Grid */}
            {activeS && (
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-400">Editing Section</div>
                    <div className="text-lg font-bold text-white">
                      {activeS.name} • {activeS.stylePart}
                    </div>
                  </div>

                  <div className="text-sm text-gray-400">
                    Resolution: {resolution === "whole" ? "1 bar" : resolution === "half" ? "½ bar" : "¼ bar"}
                  </div>
                </div>

                <div className="relative">
                  <div className="grid grid-cols-4 gap-px bg-zinc-700 rounded-lg overflow-hidden">
                    {Array.from({ length: activeS.bars * 4 }, (_, beatIndex) => {
                      // Check if this beat is occupied by a chord
                      const chord = activeS.chords.find((c) => beatIndex >= c.beat && beatIndex < c.beat + c.duration)
                      const isChordStart = chord && chord.beat === beatIndex
                      const isBeingDragged = draggingChord?.chordId === chord?.id
                      const isDropTarget = dragOverBeat === beatIndex && !isBeingDragged

                      return (
                        <div
                          key={beatIndex}
                          data-beat={beatIndex}
                          onClick={() => {
                            if (!chord && clipboardChord) {
                              handlePasteChord(activeS.id, beatIndex)
                            } else if (!chord) {
                              handleOpenChordWheel(activeS.id, beatIndex)
                            }
                          }}
                          onDragOver={(e) => handleCellDragOver(e, beatIndex)}
                          onDrop={(e) => handleCellDrop(e, activeS.id, beatIndex)}
                          className={cn(
                            "h-56 flex items-center justify-center cursor-pointer transition-all relative bg-zinc-800/50",
                            !chord &&
                              clipboardChord &&
                              "hover:bg-green-500/20 border-2 border-dashed border-green-500/50",
                            !chord && !clipboardChord && "hover:bg-blue-500/20",
                            chord && isChordStart && "hover:ring-2 hover:ring-amber-400",
                            beatIndex % 4 === 0 && "border-l-4 border-l-amber-500",
                            isDropTarget && "bg-amber-500/30 ring-2 ring-amber-500",
                            isBeingDragged && "opacity-50",
                          )}
                          style={{
                            gridColumn: isChordStart ? `span ${chord.duration}` : undefined,
                            display: chord && !isChordStart ? "none" : "flex",
                          }}
                        >
                          {isChordStart && chord ? (
                            <div
                              draggable={!isTouchDevice}
                              onDragStart={(e) => handleChordDragStart(e, activeS.id, chord.id)}
                              onDragEnd={handleChordDragEnd}
                              onTouchStart={(e) => {
                                // Only start drag if not tapping controls
                                const target = e.target as HTMLElement
                                if (!target.closest("button")) {
                                  handleChordTouchStart(e, activeS.id, chord.id)
                                }
                              }}
                              onTouchMove={handleChordTouchMove}
                              onTouchEnd={(e) => handleChordTouchEnd(e, activeS.id)}
                              className="relative w-full h-full flex flex-col bg-gradient-to-br from-amber-500 to-amber-600 text-black cursor-move overflow-hidden"
                            >
                              {/* Drag Handle - Top Left */}
                              <div className="absolute top-3 left-3 opacity-60 pointer-events-none">
                                <GripVertical className="w-6 h-6 text-black" />
                              </div>

                              {/* Chord Name - Center */}
                              <div className="flex-1 flex flex-col items-center justify-center pt-4">
                                <span className="font-bold text-4xl mb-2">{chord.symbol}</span>
                                <span className="text-base text-black/70 font-semibold">
                                  {chord.duration === 4
                                    ? "1 bar"
                                    : chord.duration === 2
                                      ? "½ bar"
                                      : chord.duration === 3
                                        ? "¾ bar"
                                        : "¼ bar"}
                                </span>
                              </div>

                              {/* Control Buttons - Bottom Row */}
                              <div className="flex items-center justify-center gap-2 p-3 bg-black/20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenChordWheel(activeS.id, beatIndex)
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleOpenChordWheel(activeS.id, beatIndex)
                                  }}
                                  className="h-12 w-12 bg-purple-500/80 hover:bg-purple-600 active:scale-95 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg"
                                  title="Edit chord"
                                >
                                  <Music className="w-6 h-6 text-white" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDecreaseChordDuration(activeS.id, chord.id)
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleDecreaseChordDuration(activeS.id, chord.id)
                                  }}
                                  disabled={chord.duration <= 1}
                                  className={cn(
                                    "h-12 w-12 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg",
                                    chord.duration <= 1
                                      ? "bg-black/30 cursor-not-allowed opacity-40"
                                      : "bg-black/50 hover:bg-black/70 active:scale-95",
                                  )}
                                  title="Decrease duration"
                                >
                                  <Minus className="w-6 h-6 text-white" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleIncreaseChordDuration(activeS.id, chord.id)
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleIncreaseChordDuration(activeS.id, chord.id)
                                  }}
                                  disabled={chord.duration >= 4}
                                  className={cn(
                                    "h-12 w-12 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg",
                                    chord.duration >= 4
                                      ? "bg-black/30 cursor-not-allowed opacity-40"
                                      : "bg-black/50 hover:bg-black/70 active:scale-95",
                                  )}
                                  title="Increase duration"
                                >
                                  <Plus className="w-6 h-6 text-white" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopyChord(activeS.id, chord.id)
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleCopyChord(activeS.id, chord.id)
                                  }}
                                  className="h-12 w-12 bg-blue-500/80 hover:bg-blue-600 active:scale-95 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg"
                                  title="Copy chord"
                                >
                                  <Copy className="w-6 h-6 text-white" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteChord(activeS.id, chord.id)
                                  }}
                                  onTouchEnd={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleDeleteChord(activeS.id, chord.id)
                                  }}
                                  className="h-12 w-12 bg-red-500/80 hover:bg-red-600 active:scale-95 rounded-lg flex items-center justify-center transition-all touch-manipulation shadow-lg"
                                  title="Delete chord"
                                >
                                  <Trash2 className="w-6 h-6 text-white" />
                                </button>
                              </div>
                            </div>
                          ) : !chord ? (
                            <div className="text-center">
                              {clipboardChord ? (
                                <>
                                  <Copy className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                  <span className="text-xs text-green-500">Paste</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                                  <span className="text-xs text-gray-500">Add</span>
                                </>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Transport Controls */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 shadow-xl">
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  onClick={isPlaying ? handleStop : handlePlay}
                  className={cn(
                    "h-14 px-8 font-bold text-base shadow-lg",
                    isPlaying
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
                  )}
                >
                  {isPlaying ? (
                    <>
                      <StopCircle className="w-5 h-5 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleRecord}
                  className={cn(
                    "h-14 px-8 font-bold text-base shadow-lg",
                    isRecording
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700",
                  )}
                >
                  <div className="w-3 h-3 rounded-full bg-white mr-2"></div>
                  Record
                </Button>

                {isRecording && (
                  <div className="p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 rounded-lg flex items-center justify-center gap-3 cursor-move shadow-lg">
                    <Download className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-500">Drag to DAW</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tyros Control */}
          <div className={cn("space-y-6", "lg:block", showMobileControls ? "block" : "hidden lg:block")}>
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 shadow-xl">
              <h3 className="text-sm font-bold text-amber-500 uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                Tyros Control
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setLocalControl(!localControl)}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md",
                    localControl
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-zinc-800 text-gray-400 hover:bg-zinc-700",
                  )}
                >
                  Local Control: {localControl ? "ON" : "OFF"}
                </button>

                <button
                  onClick={() => setClockSource(clockSource === "internal" ? "external" : "internal")}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md",
                    clockSource === "external"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "bg-zinc-800 text-gray-400 hover:bg-zinc-700",
                  )}
                >
                  Clock: {clockSource === "internal" ? "Internal" : "External"}
                </button>

                <button
                  onClick={() => setAccompaniment(!accompaniment)}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-md",
                    accompaniment
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "bg-zinc-800 text-gray-400 hover:bg-zinc-700",
                  )}
                >
                  Accompaniment: {accompaniment ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Tempo */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 shadow-xl">
              <h3 className="text-sm font-bold text-amber-500 uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                Tempo
              </h3>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleTempoChange(-1)}
                  size="sm"
                  className="bg-zinc-800 hover:bg-zinc-700 h-12 w-12 p-0 shadow-md"
                >
                  <Minus className="w-5 h-5" />
                </Button>

                <input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(Number.parseInt(e.target.value) || 120)}
                  className="flex-1 h-12 bg-zinc-800 border border-amber-500/30 rounded-lg text-center font-bold text-xl text-white shadow-md"
                  min="40"
                  max="240"
                />

                <Button
                  onClick={() => handleTempoChange(1)}
                  size="sm"
                  className="bg-zinc-800 hover:bg-zinc-700 h-12 w-12 p-0 shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 mt-2">BPM (40-240)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chord Builder Wheel - Redesigned to follow musical theory */}
      {showChordWheel && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowChordWheel(false)}
        >
          <div
            className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 max-w-5xl w-full border-2 border-amber-500/30 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-amber-500 mb-2 text-center flex items-center justify-center gap-3">
              <Music className="w-7 h-7" />
              Chord Builder
            </h3>
            <p className="text-sm text-gray-400 text-center mb-8">Build chords following proper musical theory</p>

            {/* Preview */}
            <div className="p-8 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-2 border-amber-500 rounded-xl text-center mb-6 shadow-xl">
              <p className="text-sm text-amber-400 mb-2 font-semibold uppercase tracking-wide">Chord Preview</p>
              <p className="text-6xl font-bold text-amber-500 mb-2">
                {selectedRoot.split("/")[0]}
                {selectedQuality === "Major" && selectedExtension === "none" && ""}
                {selectedQuality === "Minor" && selectedExtension === "none" && "m"}
                {selectedQuality === "Major" && selectedExtension !== "none" && selectedExtension}
                {selectedQuality === "Minor" && selectedExtension !== "none" && selectedExtension}
                {selectedQuality === "Dominant" && selectedExtension}
                {selectedQuality === "Diminished" && selectedExtension}
                {selectedQuality === "Augmented" && selectedExtension}
                {selectedQuality === "Suspended" && selectedExtension}
                {selectedBass && `/${selectedBass.split("/")[0]}`}
              </p>
              <p className="text-sm text-gray-400">
                {selectedQuality} {selectedExtension !== "none" && `• ${selectedExtension}`}
                {selectedBass && ` • Bass: ${selectedBass.split("/")[0]}`}
              </p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-bold text-amber-500 mb-3 block uppercase tracking-wide">
                Chord Duration
              </label>
              <Select
                value={selectedChordDuration.toString()}
                onValueChange={(value) => setSelectedChordDuration(Number.parseInt(value))}
              >
                <SelectTrigger className="h-14 bg-zinc-800 border-amber-500/30 text-white text-lg font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1/4 bar (1 beat)</SelectItem>
                  <SelectItem value="2">1/2 bar (2 beats)</SelectItem>
                  <SelectItem value="3">3/4 bar (3 beats)</SelectItem>
                  <SelectItem value="4">1 bar (4 beats)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button
                onClick={() => setShowChordWheel(false)}
                variant="outline"
                className="flex-1 h-14 border-amber-500/50 hover:bg-amber-500/10 text-base font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmChordWheel}
                className="flex-1 h-14 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-600 hover:to-amber-700 font-bold shadow-lg text-base"
              >
                Confirm Chord
              </Button>
            </div>

            {/* Root Selection */}
            <div className="mb-8">
              <label className="text-sm font-bold text-amber-500 mb-3 block uppercase tracking-wide">
                Step 1: Select Root Note
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {ROOT_NOTES.map((root) => (
                  <Button
                    key={root}
                    onClick={() => setSelectedRoot(root)}
                    className={cn(
                      "font-bold h-16 text-base transition-all shadow-md",
                      selectedRoot === root
                        ? "bg-gradient-to-br from-amber-500 to-amber-600 text-black scale-105 ring-2 ring-amber-400"
                        : "bg-zinc-800 text-white hover:bg-zinc-700",
                    )}
                  >
                    {root}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quality Selection */}
            <div className="mb-8">
              <label className="text-sm font-bold text-amber-500 mb-3 block uppercase tracking-wide">
                Step 2: Select Chord Quality
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {CHORD_QUALITIES.map((quality) => (
                  <Button
                    key={quality}
                    onClick={() => handleQualityChange(quality)}
                    className={cn(
                      "font-bold h-16 text-base transition-all shadow-md",
                      selectedQuality === quality
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white scale-105 ring-2 ring-blue-400"
                        : "bg-zinc-800 text-white hover:bg-zinc-700",
                    )}
                  >
                    {quality}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                {selectedQuality === "Major" && "Major triads and extensions (6, maj7, 9, etc.)"}
                {selectedQuality === "Minor" && "Minor triads and extensions (m6, m7, m9, etc.)"}
                {selectedQuality === "Dominant" && "Dominant 7th chords and alterations (7, 9, 13, etc.)"}
                {selectedQuality === "Diminished" && "Diminished triads and 7th chords"}
                {selectedQuality === "Augmented" && "Augmented triads and 7th chords"}
                {selectedQuality === "Suspended" && "Suspended chords (sus2, sus4, 7sus4, etc.)"}
              </p>
            </div>

            {/* Extension Selection - Contextual based on quality */}
            <div className="mb-8">
              <label className="text-sm font-bold text-amber-500 mb-3 block uppercase tracking-wide">
                Step 3: Select Extension/Alteration
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableExtensions.map((extension) => (
                  <Button
                    key={extension}
                    onClick={() => setSelectedExtension(extension)}
                    className={cn(
                      "font-bold h-16 text-sm transition-all shadow-md",
                      selectedExtension === extension
                        ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white scale-105 ring-2 ring-purple-400"
                        : "bg-zinc-800 text-white hover:bg-zinc-700",
                    )}
                  >
                    {extension === "none" ? "Basic" : extension}
                  </Button>
                ))}
              </div>
            </div>

            {/* Bass Selection */}
            <div className="mb-8">
              <label className="text-sm font-bold text-amber-500 mb-3 block uppercase tracking-wide">
                Step 4: Select Bass Note (Optional)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                {BASS_NOTES.map((bass) => (
                  <Button
                    key={bass}
                    onClick={() => setSelectedBass(selectedBass === bass ? null : bass)}
                    className={cn(
                      "font-bold h-14 text-sm transition-all shadow-md",
                      selectedBass === bass
                        ? "bg-gradient-to-br from-green-500 to-green-600 text-white scale-105 ring-2 ring-green-400"
                        : "bg-zinc-800 text-white hover:bg-zinc-700",
                    )}
                  >
                    {bass.split("/")[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style Part Menu */}
      {showStylePartMenu && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowStylePartMenu(null)}
        >
          <div
            className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-6 max-w-md w-full border-2 border-amber-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-amber-500 mb-4">Select Style Part</h3>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PARTS.map((part) => (
                <Button
                  key={part}
                  onClick={() => {
                    handleUpdateSection(showStylePartMenu, { stylePart: part })
                    setShowStylePartMenu(null)
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm h-12 font-semibold shadow-md"
                >
                  {part}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
