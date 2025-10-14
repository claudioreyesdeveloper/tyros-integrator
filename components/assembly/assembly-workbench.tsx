"use client"

import type React from "react"
import { useState, useRef } from "react"
import { GripVertical, ChevronDown, ChevronUp, Play, Square, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
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

interface DragData {
  section: string
  track: string
  isSource: boolean
}

export function AssemblyWorkbench() {
  const { api } = useMIDI()
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

  const [draggedItem, setDraggedItem] = useState<DragData | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Main A"]))
  const [quickSection, setQuickSection] = useState("Main A")

  const [touchDragData, setTouchDragData] = useState<DragData | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)
  const touchTargetRef = useRef<{ section: string; track: string } | null>(null)

  const [copiedParts, setCopiedParts] = useState<Record<string, { section: string; track: string }>>({})

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

    api.style.select(category, style)

    toast({
      title: "Source Style Loaded",
      description: `${category} - ${style} loaded for assembly`,
    })
  }

  const handlePlayStop = () => {
    if (isPlaying) {
      api.style.stop()
      setIsPlaying(false)
    } else {
      api.style.start()
      setIsPlaying(true)
    }
  }

  const handleSolo = (track: string) => {
    if (soloedTrack === track) {
      setSoloedTrack(null)
      api.mixer.setSolo(null)
    } else {
      setSoloedTrack(track)
      const trackIdx = STYLE_TRACKS.indexOf(track)
      api.mixer.setSolo(trackIdx)
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
    api.mixer.setMute(trackIdx, newMuted.has(track))
  }

  const handleNTRChange = (value: string) => {
    setNtrRule(value)
    const trackIdx = STYLE_TRACKS.indexOf(selectedTrack)
    const ruleIdx = NTR_OPTIONS.indexOf(value)
    console.log(`[Assembly] NTR Rule changed: track=${trackIdx}, rule=${ruleIdx}`)
  }

  const handleNTTChange = (value: string) => {
    setNttRule(value)
    const trackIdx = STYLE_TRACKS.indexOf(selectedTrack)
    const ruleIdx = NTT_OPTIONS.indexOf(value)
    console.log(`[Assembly] NTT Rule changed: track=${trackIdx}, rule=${ruleIdx}`)
  }

  const handleRTRChange = (enabled: boolean) => {
    setRtrEnabled(enabled)
    const trackIdx = STYLE_TRACKS.indexOf(selectedTrack)
    console.log(`[Assembly] RTR changed: track=${trackIdx}, enabled=${enabled}`)
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
      executeCopy(draggedItem, target)
    }
    setDraggedItem(null)
  }

  const handleTouchStart = (e: React.TouchEvent, section: string, track: string, isSource: boolean) => {
    if (!isSource) return

    const touch = e.touches[0]
    const data: DragData = { section, track, isSource }
    setTouchDragData(data)
    setTouchPosition({ x: touch.clientX, y: touch.clientY })

    e.preventDefault()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragData) return

    const touch = e.touches[0]
    setTouchPosition({ x: touch.clientX, y: touch.clientY })

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

    executeCopy(touchDragData, target)

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

    console.log(
      `[Assembly] Copy pattern: source=${sourceSectionIdx},${sourceTrackIdx} → target=${targetSectionIdx},${targetTrackIdx}`,
    )

    const targetKey = `${target.section}-${target.track}`
    setCopiedParts((prev) => ({
      ...prev,
      [targetKey]: { section: source.section, track: source.track },
    }))

    toast({
      title: "Pattern Copied",
      description: `${source.section} - ${source.track} → ${target.section} - ${target.track}`,
      duration: 3000,
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
        <h2 className="text-2xl md:text-3xl font-bold premium-text">Assembly Workbench</h2>
        <p className="text-gray-400 mt-2">Drag and drop style parts to create hybrid arrangements</p>
      </div>

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
                                    <div className="text-xs font-bold text-white text-center">{copiedPart.track}</div>
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

      {/* SFF Rules & Logic Editor */}
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
    </div>
  )
}
