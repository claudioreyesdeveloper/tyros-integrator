"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  GripVertical,
  Save,
  Undo2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  Volume2,
  VolumeX,
  Download,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { RotaryKnob } from "@/components/ui/rotary-knob"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useMIDI } from "@/lib/midi-context"
import { cn } from "@/lib/utils"

const STYLE_CATEGORIES = ["Pop & Rock", "Ballad", "Dance", "R&B", "Jazz", "Latin", "Country", "World", "Traditional"]

const STYLE_NAMES: Record<string, string[]> = {
  "Pop & Rock": ["Canadian Rock", "British Pop", "American Rock", "Euro Pop", "Indie Rock"],
  Ballad: ["Slow Ballad", "Power Ballad", "Piano Ballad", "Acoustic Ballad"],
  Dance: ["House", "Techno", "Trance", "EDM", "Disco"],
  "R&B": ["Soul", "Funk", "Motown", "Contemporary R&B"],
  Jazz: ["Swing", "Bebop", "Smooth Jazz", "Latin Jazz"],
  Latin: ["Salsa", "Bossa Nova", "Samba", "Tango"],
  Country: ["Country Rock", "Bluegrass", "Nashville", "Western"],
  World: ["Celtic", "African", "Middle Eastern", "Asian"],
  Traditional: ["Waltz", "Polka", "March", "Folk"],
}

const STYLE_SECTIONS = [
  "Intro 1",
  "Intro 2",
  "Intro 3",
  "Main A",
  "Main B",
  "Main C",
  "Main D",
  "Fill",
  "Outro 1",
  "Outro 2",
  "Outro 3",
]

const STYLE_TRACKS = ["Rhythm 1", "Rhythm 2", "Bass", "Chord 1", "Chord 2", "Pad", "Phrase 1", "Phrase 2"]

const NTR_OPTIONS = ["Root", "Bass", "Melodic", "Harmonic Minor", "Melodic Minor", "Natural Minor"]
const NTT_OPTIONS = ["Bypass", "Melody", "Chord", "Bass", "Melodic Minor", "Harmonic Minor"]

const CHORD_ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const CHORD_TYPES = ["Major", "Minor", "7th", "maj7", "m7", "dim", "aug", "sus4", "sus2", "add9"]
const CHORD_INVERSIONS = ["Root", "1st", "2nd"]
const STYLE_SECTIONS_FULL = [
  "Intro 1",
  "Intro 2",
  "Intro 3",
  "Main A",
  "Main B",
  "Main C",
  "Main D",
  "Ending 1",
  "Ending 2",
  "Ending 3",
]

interface DragData {
  section: string
  track: string
  isSource: boolean
}

// Added chord sequencer interface
interface ChordEvent {
  id: string
  bar: number
  beat: number
  root: string
  type: string
  inversion: string
  duration: number // in beats
}

export function StyleEditor() {
  const { sendProgramChange, sendSysEx, sendControlChange } = useMIDI()
  const { toast } = useToast()

  const [sourceCategory, setSourceCategory] = useState("Pop & Rock")
  const [sourceStyle, setSourceStyle] = useState("Canadian Rock")
  const [isPlaying, setIsPlaying] = useState(false)
  const [soloedTrack, setSoloedTrack] = useState<string | null>(null)
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set())

  const [selectedTrack, setSelectedTrack] = useState("Bass")
  const [ntrRule, setNtrRule] = useState("Root")
  const [nttRule, setNttRule] = useState("Bypass")
  const [rtrEnabled, setRtrEnabled] = useState(false)
  const [noteLimitLow, setNoteLimitLow] = useState(0)
  const [noteLimitHigh, setNoteLimitHigh] = useState(127)

  const [styleVolumes, setStyleVolumes] = useState<number[]>(Array(8).fill(100))
  const [stylePans, setStylePans] = useState<number[]>(Array(8).fill(64))
  const [styleReverbs, setStyleReverbs] = useState<number[]>(Array(8).fill(40))
  const [styleChorus, setStyleChorus] = useState<number[]>(Array(8).fill(0))

  const [keyboardVolumes, setKeyboardVolumes] = useState({ right1: 100, right2: 100, right3: 100, left: 100 })
  const [keyboardPans, setKeyboardPans] = useState({ right1: 64, right2: 64, right3: 64, left: 64 })
  const [touchSense, setTouchSense] = useState(64)
  const [vibratoSpeed, setVibratoSpeed] = useState(64)
  const [vibratoDelay, setVibratoDelay] = useState(64)

  const [draggedItem, setDraggedItem] = useState<DragData | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    source: DragData | null
    target: DragData | null
  }>({ open: false, source: null, target: null })

  const [lastAction, setLastAction] = useState<{ source: DragData; target: DragData } | null>(null)
  const [commitStatus, setCommitStatus] = useState<"ready" | "saving" | "saved">("ready")
  const [assemblyHistory, setAssemblyHistory] = useState<Array<{ source: DragData; target: DragData }>>([])

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Main A"]))
  const [quickSection, setQuickSection] = useState("Main A")

  const [touchDragData, setTouchDragData] = useState<DragData | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)
  const touchTargetRef = useRef<{ section: string; track: string } | null>(null)

  const [copiedParts, setCopiedParts] = useState<Record<string, { section: string; track: string }>>({})

  const [midiPort, setMidiPort] = useState("Digitalworkstation Port 1")
  const [styleChannel, setStyleChannel] = useState("9")
  const [selectedSection, setSelectedSection] = useState("Main A")
  const [chordEvents, setChordEvents] = useState<ChordEvent[]>([])
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null)
  const [selectedRoot, setSelectedRoot] = useState("C")
  const [selectedType, setSelectedType] = useState("Major")
  const [selectedInversion, setSelectedInversion] = useState("Root")
  const [timelineLength, setTimelineLength] = useState(8) // bars

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const handleQuickSectionChange = (section: string) => {
    setQuickSection(section)
    setExpandedSections(new Set([section]))
  }

  const handleSourceStyleChange = (category: string, style: string) => {
    setSourceCategory(category)
    setSourceStyle(style)

    const categoryIndex = STYLE_CATEGORIES.indexOf(category)
    const styleIndex = STYLE_NAMES[category]?.indexOf(style) || 0

    sendProgramChange(0, categoryIndex, 0)
    sendProgramChange(0, styleIndex, 32)
    sendProgramChange(0, styleIndex)

    toast({
      title: "Source Style Loaded",
      description: `${category} - ${style} loaded for assembly`,
    })
  }

  const handlePlayStop = () => {
    if (isPlaying) {
      sendControlChange(0, 0xfa, 0) // MIDI Stop
      setIsPlaying(false)
    } else {
      sendControlChange(0, 0xf8, 0) // MIDI Start
      setIsPlaying(true)
    }
  }

  const handleSolo = (track: string) => {
    if (soloedTrack === track) {
      setSoloedTrack(null)
      sendSysEx([0x43, 0x10, 0x4c, 0x00, 0xff]) // Clear solo
    } else {
      setSoloedTrack(track)
      const trackIdx = STYLE_TRACKS.indexOf(track)
      sendSysEx([0x43, 0x10, 0x4c, 0x01, trackIdx]) // Solo track
    }
  }

  const handleMute = (track: string) => {
    const newMuted = new Set(mutedTracks)
    if (newMuted.has(track)) {
      newMuted.delete(track)
    } else {
      newMuted.add(track)
    }
    setMutedTracks(newMuted)

    const trackIdx = STYLE_TRACKS.indexOf(track)
    sendSysEx([0x43, 0x10, 0x4c, 0x02, trackIdx, newMuted.has(track) ? 0x00 : 0x7f])
  }

  const handleNTRChange = (value: string) => {
    setNtrRule(value)
    const trackIdx = STYLE_TRACKS.indexOf(selectedTrack)
    const ruleIdx = NTR_OPTIONS.indexOf(value)
    sendSysEx([0x43, 0x10, 0x4c, 0x10, trackIdx, ruleIdx])
  }

  const handleNTTChange = (value: string) => {
    setNttRule(value)
    const trackIdx = STYLE_TRACKS.indexOf(selectedTrack)
    const ruleIdx = NTT_OPTIONS.indexOf(value)
    sendSysEx([0x43, 0x10, 0x4c, 0x11, trackIdx, ruleIdx])
  }

  const handleRTRChange = (enabled: boolean) => {
    setRtrEnabled(enabled)
    const trackIdx = STYLE_TRACKS.indexOf(selectedTrack)
    sendSysEx([0x43, 0x10, 0x4c, 0x12, trackIdx, enabled ? 0x01 : 0x00])
  }

  const handleStyleVolumeChange = (index: number, value: number[]) => {
    const newVolumes = [...styleVolumes]
    newVolumes[index] = value[0]
    setStyleVolumes(newVolumes)
    sendSysEx([0x43, 0x10, 0x4c, 0x20, index, value[0]])
  }

  const handleStylePanChange = (index: number, value: number) => {
    const newPans = [...stylePans]
    newPans[index] = value
    setStylePans(newPans)
    sendSysEx([0x43, 0x10, 0x4c, 0x21, index, value])
  }

  const handleDragStart = (e: React.DragEvent, section: string, track: string, isSource: boolean) => {
    const data: DragData = { section, track, isSource }
    setDraggedItem(data)
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("application/json", JSON.stringify(data))
  }

  const handleDragOver = (e: React.DragEvent, section: string, track: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    if (draggedItem?.isSource) {
      setHoveredCell(`${section}-${track}`)
    }
  }

  const handleDragLeave = () => {
    setHoveredCell(null)
  }

  const handleDrop = (e: React.DragEvent, section: string, track: string) => {
    e.preventDefault()
    setHoveredCell(null)

    if (draggedItem?.isSource) {
      const target: DragData = { section, track, isSource: false }
      // Execute copy immediately
      // Set confirmDialog state to open the dialog
      setConfirmDialog({ open: true, source: draggedItem, target: target })
    }
    setDraggedItem(null)
  }

  const handleTouchStart = (e: React.TouchEvent, section: string, track: string, isSource: boolean) => {
    if (!isSource) return // Only allow dragging from source

    const touch = e.touches[0]
    const data: DragData = { section, track, isSource }
    setTouchDragData(data)
    setTouchPosition({ x: touch.clientX, y: touch.clientY })

    // Prevent scrolling while dragging
    e.preventDefault()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragData) return

    const touch = e.touches[0]
    setTouchPosition({ x: touch.clientX, y: touch.clientY })

    // Find element under touch point
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const dropZone = element?.closest("[data-drop-zone]")

    if (dropZone) {
      const section = dropZone.getAttribute("data-section")
      const track = dropZone.getAttribute("data-track")
      if (section && track) {
        setHoveredCell(`${section}-${track}`)
        touchTargetRef.current = { section, track }
      }
    } else {
      setHoveredCell(null)
      touchTargetRef.current = null
    }

    e.preventDefault()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchDragData || !touchTargetRef.current) {
      setTouchDragData(null)
      setTouchPosition(null)
      setHoveredCell(null)
      touchTargetRef.current = null
      return
    }

    const { section, track } = touchTargetRef.current
    const target: DragData = { section, track, isSource: false }

    // Set confirmDialog state to open the dialog
    setConfirmDialog({ open: true, source: touchDragData, target: target })

    // Reset touch drag state
    setTouchDragData(null)
    setTouchPosition(null)
    setHoveredCell(null)
    touchTargetRef.current = null
  }

  const executeCopy = async (source: DragData, target: DragData) => {
    const sourceSectionIdx = STYLE_SECTIONS.indexOf(source.section)
    const sourceTrackIdx = STYLE_TRACKS.indexOf(source.track)
    const targetSectionIdx = STYLE_SECTIONS.indexOf(target.section)
    const targetTrackIdx = STYLE_TRACKS.indexOf(target.track)

    sendSysEx([0x43, 0x10, 0x4c, sourceSectionIdx, sourceTrackIdx, targetSectionIdx, targetTrackIdx])

    const targetKey = `${target.section}-${target.track}`
    setCopiedParts((prev) => ({
      ...prev,
      [targetKey]: { section: source.section, track: source.track },
    }))

    const action = { source, target }
    setLastAction(action)
    setAssemblyHistory((prev) => [...prev, action])
    setCommitStatus("ready")

    toast({
      title: "Pattern Copied",
      description: `${source.section} - ${source.track} → ${target.section} - ${target.track}`,
      duration: 3000,
    })
  }

  const handleConfirmCopy = () => {
    if (confirmDialog.source && confirmDialog.target) {
      executeCopy(confirmDialog.source, confirmDialog.target)
    }
    setConfirmDialog({ open: false, source: null, target: null })
  }

  const handleUndo = () => {
    if (!lastAction) return

    sendSysEx([0x43, 0x10, 0x4d, 0x00])

    const targetKey = `${lastAction.target.section}-${lastAction.target.track}`
    setCopiedParts((prev) => {
      const newCopied = { ...prev }
      delete newCopied[targetKey]
      return newCopied
    })

    setAssemblyHistory((prev) => prev.slice(0, -1))
    setLastAction(assemblyHistory[assemblyHistory.length - 2] || null)

    toast({
      title: "Action Reverted",
      description: "Last pattern copy has been undone",
    })
  }

  const handleCommitSave = async () => {
    setCommitStatus("saving")

    sendSysEx([0x43, 0x7e, 0x00, 0x01])

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setCommitStatus("saved")
    setAssemblyHistory([])
    setLastAction(null)
    setCopiedParts({})

    toast({
      title: "Style Saved!",
      description: "New hybrid style has been saved to Tyros5 User Style memory",
      duration: 5000,
    })

    setTimeout(() => setCommitStatus("ready"), 3000)
  }

  const handleAddChord = (bar: number, beat: number) => {
    const newChord: ChordEvent = {
      id: `chord-${Date.now()}`,
      bar,
      beat,
      root: selectedRoot,
      type: selectedType,
      inversion: selectedInversion,
      duration: 4, // default 4 beats (1 bar)
    }
    setChordEvents([...chordEvents, newChord])
    setSelectedChordId(newChord.id)

    // Send MIDI chord
    sendChordToTyros(newChord)
  }

  const handleDeleteChord = (id: string) => {
    setChordEvents(chordEvents.filter((c) => c.id !== id))
    if (selectedChordId === id) {
      setSelectedChordId(null)
    }
  }

  const handleUpdateChord = (id: string, updates: Partial<ChordEvent>) => {
    setChordEvents(chordEvents.map((c) => (c.id === id ? { ...c, ...updates } : c)))
    const updatedChord = chordEvents.find((c) => c.id === id)
    if (updatedChord) {
      sendChordToTyros({ ...updatedChord, ...updates })
    }
  }

  const sendChordToTyros = (chord: ChordEvent) => {
    const channel = Number.parseInt(styleChannel) - 1
    const rootNote = CHORD_ROOTS.indexOf(chord.root) + 60 // Middle C = 60

    // Send chord notes based on type and inversion
    // This is a simplified implementation
    const chordNotes = getChordNotes(rootNote, chord.type, chord.inversion)
    chordNotes.forEach((note) => {
      sendControlChange(channel, 0x90, note) // Note On
      sendControlChange(channel, note, 100) // Velocity
    })
  }

  const getChordNotes = (root: number, type: string, inversion: string): number[] => {
    let intervals: number[] = []

    switch (type) {
      case "Major":
        intervals = [0, 4, 7]
        break
      case "Minor":
        intervals = [0, 3, 7]
        break
      case "7th":
        intervals = [0, 4, 7, 10]
        break
      case "maj7":
        intervals = [0, 4, 7, 11]
        break
      case "m7":
        intervals = [0, 3, 7, 10]
        break
      case "dim":
        intervals = [0, 3, 6]
        break
      case "aug":
        intervals = [0, 4, 8]
        break
      case "sus4":
        intervals = [0, 5, 7]
        break
      case "sus2":
        intervals = [0, 2, 7]
        break
      case "add9":
        intervals = [0, 4, 7, 14]
        break
      default:
        intervals = [0, 4, 7]
    }

    let notes = intervals.map((i) => root + i)

    // Apply inversion
    if (inversion === "1st" && notes.length >= 2) {
      notes = [notes[1], notes[2], notes[0] + 12]
    } else if (inversion === "2nd" && notes.length >= 3) {
      notes = [notes[2], notes[0] + 12, notes[1] + 12]
    }

    return notes
  }

  const handleExportToDAW = () => {
    // Create MIDI data blob for download
    const midiData = createMIDIFile(chordEvents)
    const blob = new Blob([midiData], { type: "audio/midi" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chord-progression.mid"
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "MIDI Exported",
      description: "Chord progression exported as MIDI file",
    })
  }

  const createMIDIFile = (chords: ChordEvent[]): Uint8Array => {
    // Simplified MIDI file creation
    // In a real implementation, this would create a proper MIDI file format
    return new Uint8Array([0x4d, 0x54, 0x68, 0x64]) // "MThd" header
  }

  const handleSectionChange = (section: string) => {
    setSelectedSection(section)
    const sectionIdx = STYLE_SECTIONS_FULL.indexOf(section)
    sendSysEx([0x43, 0x10, 0x4c, 0x50, sectionIdx])

    toast({
      title: "Style Section Changed",
      description: `Now playing: ${section}`,
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Floating touch drag indicator */}
      {touchDragData && touchPosition && (
        <div
          className="fixed pointer-events-none z-[10000] bg-green-500/90 border-2 border-green-400 rounded-lg p-3 shadow-2xl"
          style={{
            left: touchPosition.x - 60,
            top: touchPosition.y - 30,
            transform: "scale(1.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-white" />
            <div className="text-sm font-semibold text-white">
              {touchDragData.section} - {touchDragData.track}
            </div>
          </div>
        </div>
      )}

      <div className="premium-card p-6">
        <h2 className="text-2xl md:text-3xl font-bold premium-text">SmartBridge Style Assembly & Control Center</h2>
        <p className="text-gray-400 mt-2">
          Professional MIDI controller for Tyros5/Genos Style parameters and assembly
        </p>
      </div>

      <Tabs defaultValue="workbench" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border-2 border-amber-500/30 p-1.5 gap-1.5">
          <TabsTrigger
            value="workbench"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-black font-semibold text-xs md:text-sm py-3"
          >
            <span className="hidden sm:inline">Assembly Workbench</span>
            <span className="sm:hidden">Assembly</span>
          </TabsTrigger>
          <TabsTrigger
            value="mix"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-black font-semibold text-xs md:text-sm py-3"
          >
            <span className="hidden sm:inline">Mix & Voice</span>
            <span className="sm:hidden">Mix</span>
          </TabsTrigger>
          <TabsTrigger
            value="chords"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-500 data-[state=active]:text-black font-semibold text-xs md:text-sm py-3"
          >
            <span className="hidden sm:inline">Chord Sequencer</span>
            <span className="sm:hidden">Chords</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workbench" className="mt-6 space-y-6">
          {/* Source Style Preview Panel */}
          <div className="premium-card p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Source Style Preview Panel</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Category</label>
                    <Select
                      value={sourceCategory}
                      onValueChange={(val) => handleSourceStyleChange(val, STYLE_NAMES[val]?.[0] || "")}
                    >
                      <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                        {STYLE_CATEGORIES.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                          >
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Style Name</label>
                    <Select value={sourceStyle} onValueChange={(val) => handleSourceStyleChange(sourceCategory, val)}>
                      <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                        {STYLE_NAMES[sourceCategory]?.map((style) => (
                          <SelectItem
                            key={style}
                            value={style}
                            className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                          >
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handlePlayStop}
                    className={cn(
                      "glossy-button flex items-center gap-2",
                      isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600",
                    )}
                  >
                    {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? "Stop" : "Play"}
                  </Button>
                  <span className="text-sm text-gray-400">Preview the selected style section</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide mb-3">Part Controls</h4>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_TRACKS.map((track) => (
                    <div key={track} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSolo(track)}
                        className={cn(
                          "h-7 px-2 text-xs",
                          soloedTrack === track ? "bg-yellow-500 text-black border-yellow-500" : "border-gray-600",
                        )}
                      >
                        S
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMute(track)}
                        className={cn(
                          "h-7 px-2 text-xs",
                          mutedTracks.has(track) ? "bg-red-500 text-white border-red-500" : "border-gray-600",
                        )}
                      >
                        {mutedTracks.has(track) ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </Button>
                      <span className="text-xs text-gray-300 flex-1 truncate">{track}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assembly Matrix */}
          <div className="premium-card p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <label className="text-sm font-semibold text-gray-300 whitespace-nowrap">Quick Jump to Section:</label>
              <Select value={quickSection} onValueChange={handleQuickSectionChange}>
                <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                  {STYLE_SECTIONS.map((section) => (
                    <SelectItem
                      key={section}
                      value={section}
                      className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                    >
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setExpandedSections(new Set(STYLE_SECTIONS))}
                variant="outline"
                size="sm"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
              >
                Expand All
              </Button>
              <Button
                onClick={() => setExpandedSections(new Set())}
                variant="outline"
                size="sm"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs"
              >
                Collapse All
              </Button>
            </div>

            <div className="space-y-3">
              {STYLE_SECTIONS.map((section) => {
                const isExpanded = expandedSections.has(section)
                return (
                  <div key={section} className="premium-card overflow-hidden">
                    <button
                      onClick={() => toggleSection(section)}
                      className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full" />
                        <h3 className="text-lg md:text-xl font-bold text-amber-400">{section}</h3>
                        <span className="text-xs text-gray-500 hidden sm:inline">({STYLE_TRACKS.length} tracks)</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-amber-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <GripVertical className="w-4 h-4 text-green-400" />
                              <h4 className="text-sm font-bold text-green-400 uppercase tracking-wide">
                                Source: {sourceStyle}
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {STYLE_TRACKS.map((track) => (
                                <div
                                  key={`source-${section}-${track}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, section, track, true)}
                                  onTouchStart={(e) => handleTouchStart(e, section, track, true)}
                                  onTouchMove={handleTouchMove}
                                  onTouchEnd={handleTouchEnd}
                                  className="bg-green-500/20 border-2 border-green-500/40 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-green-500/30 hover:border-green-500/60 hover:scale-105 transition-all active:scale-95"
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    <div className="text-sm font-semibold text-white">{track}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-2">
                              Target: User Style
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {STYLE_TRACKS.map((track) => {
                                const cellId = `${section}-${track}`
                                const isHovered = hoveredCell === cellId
                                const copiedPart = copiedParts[cellId]
                                const hasCopiedPart = !!copiedPart

                                return (
                                  <div
                                    key={`target-${cellId}`}
                                    data-drop-zone="true"
                                    data-section={section}
                                    data-track={track}
                                    onDragOver={(e) => handleDragOver(e, section, track)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, section, track)}
                                    className={cn(
                                      "border-2 border-dashed rounded-lg p-3 transition-all min-h-[52px] flex flex-col items-center justify-center",
                                      isHovered
                                        ? "bg-amber-500/30 border-amber-500 scale-105 shadow-lg shadow-amber-500/20"
                                        : hasCopiedPart
                                          ? "bg-green-500/20 border-green-500/60 hover:border-green-500"
                                          : "bg-zinc-800/50 border-gray-600 hover:border-amber-500/50 hover:bg-zinc-800",
                                    )}
                                  >
                                    {hasCopiedPart ? (
                                      <>
                                        <div className="text-xs font-semibold text-green-400 text-center">
                                          {copiedPart.section}
                                        </div>
                                        <div className="text-xs font-bold text-white text-center">
                                          {copiedPart.track}
                                        </div>
                                        <div className="text-[10px] text-gray-400 text-center mt-0.5">→ {track}</div>
                                      </>
                                    ) : (
                                      <div className="text-sm font-semibold text-gray-400 text-center">
                                        {isHovered ? "Drop Here" : track}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="premium-card p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">SFF Rules & Logic Editor</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Select Track to Edit</label>
                <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                  <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                    {STYLE_TRACKS.map((track) => (
                      <SelectItem
                        key={track}
                        value={track}
                        className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                      >
                        {track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">NTR (Note Transposition Rule)</label>
                  <Select value={ntrRule} onValueChange={handleNTRChange}>
                    <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                      {NTR_OPTIONS.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                        >
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">NTT (Note Transposition Table)</label>
                  <Select value={nttRule} onValueChange={handleNTTChange}>
                    <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                      {NTT_OPTIONS.map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                        >
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">RTR (Re-Trigger Rule)</label>
                  <div className="flex items-center gap-3 h-11 bg-zinc-900/50 border-2 border-amber-500/30 rounded-xl px-4">
                    <Switch checked={rtrEnabled} onCheckedChange={handleRTRChange} />
                    <span className="text-white font-semibold">{rtrEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-300">Note Limit Low: {noteLimitLow}</Label>
                  <Slider
                    value={[noteLimitLow]}
                    onValueChange={(val) => setNoteLimitLow(val[0])}
                    min={0}
                    max={127}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-300">Note Limit High: {noteLimitHigh}</Label>
                  <Slider
                    value={[noteLimitHigh]}
                    onValueChange={(val) => setNoteLimitHigh(val[0])}
                    min={0}
                    max={127}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mix" className="mt-6 space-y-6">
          <div className="premium-card p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-6">Style Mix Console</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {STYLE_TRACKS.map((track, index) => (
                <div key={track} className="flex flex-col items-center gap-3 bg-zinc-800/50 rounded-lg p-4">
                  <span className="text-xs font-bold text-amber-400 text-center">{track}</span>

                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-400">Vol</span>
                    <Slider
                      orientation="vertical"
                      value={[styleVolumes[index]]}
                      onValueChange={(val) => handleStyleVolumeChange(index, val)}
                      min={0}
                      max={127}
                      className="h-32"
                    />
                    <span className="text-xs font-mono text-white">{styleVolumes[index]}</span>
                  </div>

                  <RotaryKnob
                    value={stylePans[index]}
                    min={0}
                    max={127}
                    onChange={(val) => handleStylePanChange(index, val)}
                    label="Pan"
                    displayValue={
                      stylePans[index] === 64
                        ? "C"
                        : stylePans[index] < 64
                          ? `L${64 - stylePans[index]}`
                          : `R${stylePans[index] - 64}`
                    }
                    size="sm"
                  />

                  <RotaryKnob
                    value={styleReverbs[index]}
                    min={0}
                    max={127}
                    onChange={(val) => {
                      const newReverbs = [...styleReverbs]
                      newReverbs[index] = val
                      setStyleReverbs(newReverbs)
                      sendSysEx([0x43, 0x10, 0x4c, 0x22, index, val])
                    }}
                    label="Rev"
                    displayValue={styleReverbs[index].toString()}
                    size="sm"
                  />

                  <RotaryKnob
                    value={styleChorus[index]}
                    min={0}
                    max={127}
                    onChange={(val) => {
                      const newChorus = [...styleChorus]
                      newChorus[index] = val
                      setStyleChorus(newChorus)
                      sendSysEx([0x43, 0x10, 0x4c, 0x23, index, val])
                    }}
                    label="Cho"
                    displayValue={styleChorus[index].toString()}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-6">Keyboard Part Controls</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(["right1", "right2", "right3", "left"] as const).map((part) => (
                <div key={part} className="flex flex-col items-center gap-3 bg-zinc-800/50 rounded-lg p-4">
                  <span className="text-sm font-bold text-blue-400 uppercase">{part.replace(/(\d)/, " $1")}</span>

                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-400">Volume</span>
                    <Slider
                      orientation="vertical"
                      value={[keyboardVolumes[part]]}
                      onValueChange={(val) => {
                        setKeyboardVolumes({ ...keyboardVolumes, [part]: val[0] })
                        sendSysEx([
                          0x43,
                          0x10,
                          0x4c,
                          0x30,
                          ["right1", "right2", "right3", "left"].indexOf(part),
                          val[0],
                        ])
                      }}
                      min={0}
                      max={127}
                      className="h-32"
                    />
                    <span className="text-xs font-mono text-white">{keyboardVolumes[part]}</span>
                  </div>

                  <RotaryKnob
                    value={keyboardPans[part]}
                    min={0}
                    max={127}
                    onChange={(val) => {
                      setKeyboardPans({ ...keyboardPans, [part]: val })
                      sendSysEx([0x43, 0x10, 0x4c, 0x31, ["right1", "right2", "right3", "left"].indexOf(part), val])
                    }}
                    label="Pan"
                    displayValue={
                      keyboardPans[part] === 64
                        ? "C"
                        : keyboardPans[part] < 64
                          ? `L${64 - keyboardPans[part]}`
                          : `R${keyboardPans[part] - 64}`
                    }
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-6">Voice Parameter Controls</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-3">
                <RotaryKnob
                  value={touchSense}
                  min={0}
                  max={127}
                  onChange={(val) => {
                    setTouchSense(val)
                    sendSysEx([0x43, 0x10, 0x4c, 0x40, val])
                  }}
                  label="Touch Sense Depth"
                  displayValue={touchSense.toString()}
                  size="lg"
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                <RotaryKnob
                  value={vibratoSpeed}
                  min={0}
                  max={127}
                  onChange={(val) => {
                    setVibratoSpeed(val)
                    sendSysEx([0x43, 0x10, 0x4c, 0x41, val])
                  }}
                  label="Vibrato Speed"
                  displayValue={vibratoSpeed.toString()}
                  size="lg"
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                <RotaryKnob
                  value={vibratoDelay}
                  min={0}
                  max={127}
                  onChange={(val) => {
                    setVibratoDelay(val)
                    sendSysEx([0x43, 0x10, 0x4c, 0x42, val])
                  }}
                  label="Vibrato Delay"
                  displayValue={vibratoDelay.toString()}
                  size="lg"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chords" className="mt-6 space-y-6">
          {/* Style Setup & MIDI Routing */}
          <div className="premium-card p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">Style Setup & MIDI Routing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Hardware Port</label>
                <Select value={midiPort} onValueChange={setMidiPort}>
                  <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                    <SelectItem
                      value="Digitalworkstation Port 1"
                      className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                    >
                      Digitalworkstation Port 1
                    </SelectItem>
                    <SelectItem
                      value="Digitalworkstation Port 2"
                      className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                    >
                      Digitalworkstation Port 2
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Style Channel Output</label>
                <Select value={styleChannel} onValueChange={setStyleChannel}>
                  <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((ch) => (
                      <SelectItem
                        key={ch}
                        value={ch.toString()}
                        className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                      >
                        Channel {ch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Style Section</label>
                <Select value={selectedSection} onValueChange={handleSectionChange}>
                  <SelectTrigger className="bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                    {STYLE_SECTIONS_FULL.map((section) => (
                      <SelectItem
                        key={section}
                        value={section}
                        className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black"
                      >
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Chord Sequencing Interface */}
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">Chord Progression Timeline</h3>
              <Button onClick={handleExportToDAW} className="glossy-button flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export to DAW
              </Button>
            </div>

            {/* Timeline Grid */}
            <div className="bg-zinc-900/50 rounded-xl p-4 overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Bar numbers */}
                <div className="flex mb-2">
                  {Array.from({ length: timelineLength }, (_, i) => (
                    <div key={i} className="flex-1 text-center text-xs text-gray-400 font-mono">
                      Bar {i + 1}
                    </div>
                  ))}
                </div>

                {/* Timeline grid */}
                <div className="flex border-2 border-amber-500/30 rounded-lg overflow-hidden">
                  {Array.from({ length: timelineLength }, (_, bar) => (
                    <div key={bar} className="flex-1 border-r border-amber-500/20 last:border-r-0">
                      {Array.from({ length: 4 }, (_, beat) => (
                        <div
                          key={beat}
                          onClick={() => handleAddChord(bar + 1, beat + 1)}
                          className="h-20 border-b border-amber-500/10 last:border-b-0 hover:bg-amber-500/10 cursor-pointer transition-colors relative"
                        >
                          {chordEvents
                            .filter((c) => c.bar === bar + 1 && c.beat === beat + 1)
                            .map((chord) => (
                              <div
                                key={chord.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedChordId(chord.id)
                                }}
                                className={cn(
                                  "absolute inset-1 rounded-lg p-2 cursor-pointer transition-all",
                                  selectedChordId === chord.id
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black"
                                    : "bg-blue-500/80 text-white hover:bg-blue-500",
                                )}
                              >
                                <div className="text-xs font-bold">
                                  {chord.root}
                                  {chord.type}
                                </div>
                                <div className="text-[10px]">{chord.inversion}</div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chord Selector & Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Circle of Fifths */}
            <div className="premium-card p-6">
              <h3 className="text-lg font-bold text-amber-400 mb-4">Chord Selector (Circle of Fifths)</h3>
              <div className="grid grid-cols-4 gap-2">
                {CHORD_ROOTS.map((root) => (
                  <Button
                    key={root}
                    onClick={() => setSelectedRoot(root)}
                    className={cn(
                      "h-12 font-bold",
                      selectedRoot === root
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black"
                        : "bg-zinc-800 text-white hover:bg-zinc-700",
                    )}
                  >
                    {root}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chord Voicing/Flavors */}
            <div className="premium-card p-6">
              <h3 className="text-lg font-bold text-amber-400 mb-4">Chord Voicing & Flavors</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">Chord Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHORD_TYPES.map((type) => (
                      <Button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        size="sm"
                        className={cn(
                          "font-semibold",
                          selectedType === type
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black"
                            : "bg-zinc-800 text-white hover:bg-zinc-700",
                        )}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">Inversion</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CHORD_INVERSIONS.map((inv) => (
                      <Button
                        key={inv}
                        onClick={() => setSelectedInversion(inv)}
                        size="sm"
                        className={cn(
                          "font-semibold",
                          selectedInversion === inv
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black"
                            : "bg-zinc-800 text-white hover:bg-zinc-700",
                        )}
                      >
                        {inv}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedChordId && (
                  <Button
                    onClick={() => handleDeleteChord(selectedChordId)}
                    variant="destructive"
                    className="w-full flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected Chord
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <div className="premium-card p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {commitStatus === "ready" && (
                <>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-yellow-400 font-semibold">Ready for Final Commit</span>
                </>
              )}
              {commitStatus === "saving" && (
                <>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-blue-400 font-semibold">Saving to Tyros5...</span>
                </>
              )}
              {commitStatus === "saved" && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Style Assembly Saved!</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleUndo}
                disabled={!lastAction || commitStatus === "saving"}
                className="glossy-button flex items-center gap-2 bg-transparent"
                variant="outline"
              >
                <Undo2 className="w-5 h-5" />
                Undo
              </Button>

              <Button
                onClick={handleCommitSave}
                disabled={assemblyHistory.length === 0 || commitStatus === "saving"}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {commitStatus === "saving" ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 mr-3" />
                    COMMIT & SAVE HYBRID STYLE TO TYROS
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="premium-card p-4 bg-zinc-900/80">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Assembly History:</span>
              <span className="text-amber-400 font-semibold">{assemblyHistory.length} operations</span>
            </div>
            <div className="text-gray-500">
              {commitStatus === "saving" && "Transferring Bulk SysEx..."}
              {commitStatus === "ready" && assemblyHistory.length > 0 && "Ready for Commit"}
              {commitStatus === "saved" && "Changes Saved to Hardware"}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, source: null, target: null })}
      >
        <DialogContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-400">Copy Pattern Confirmation</DialogTitle>
            <DialogDescription className="text-gray-300">
              {confirmDialog.source && confirmDialog.target && (
                <>
                  Copy{" "}
                  <span className="text-green-400 font-semibold">
                    {confirmDialog.source.section} - {confirmDialog.source.track}
                  </span>{" "}
                  to{" "}
                  <span className="text-blue-400 font-semibold">
                    {confirmDialog.target.section} - {confirmDialog.target.track}
                  </span>
                  ?
                  <br />
                  <br />
                  This executes the hardware's internal Style Copy function via MIDI SysEx, transferring the MIDI
                  sequence data and associated SFF rules.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, source: null, target: null })}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmCopy} className="glossy-button">
              Confirm & Execute Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
