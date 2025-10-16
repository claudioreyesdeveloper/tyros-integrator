"use client"

import type React from "react"
import { useState, useRef } from "react"
import { GripVertical, Play, Square, Volume2, VolumeX, Check, Undo, Save, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  "Intro 4",
  "Main A",
  "Main B",
  "Main C",
  "Main D",
  "Fill In",
  "Break",
  "Ending 1",
  "Ending 2",
  "Ending 3",
  "Ending 4",
]

const STYLE_TRACKS = ["Rhythm 1", "Rhythm 2", "Bass", "Chord 1", "Chord 2", "Pad", "Phrase 1", "Phrase 2"]

interface DragData {
  section: string
  track: string
}

interface CopiedPattern {
  sourceSection: string
  sourceTrack: string
  targetSection: string
  targetTrack: string
}

export function AssemblyWorkbench() {
  const { api } = useMIDI()
  const { toast } = useToast()

  const [targetSection, setTargetSection] = useState("Main A")
  const [sourceCategory, setSourceCategory] = useState("Pop & Rock")
  const [sourceStyle, setSourceStyle] = useState("Canadian Rock")
  const [sourceSection, setSourceSection] = useState("Main A")

  const [isPlaying, setIsPlaying] = useState(false)
  const [soloedTrack, setSoloedTrack] = useState<string | null>(null)
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set())

  const [pendingCopy, setPendingCopy] = useState<{ source: DragData; target: DragData } | null>(null)
  const [copiedPatterns, setCopiedPatterns] = useState<CopiedPattern[]>([])
  const [assemblyHistory, setAssemblyHistory] = useState<CopiedPattern[][]>([])

  const [draggedItem, setDraggedItem] = useState<DragData | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  const [touchDragData, setTouchDragData] = useState<DragData | null>(null)
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null)
  const touchTargetRef = useRef<{ section: string; track: string } | null>(null)

  const [isSourceExpanded, setIsSourceExpanded] = useState(true)

  const handleSourceStyleChange = (category: string, style: string) => {
    setSourceCategory(category)
    setSourceStyle(style)

    api.sendCommand({
      type: "style",
      action: "select",
      category,
      style,
    })

    toast({
      title: "Source Style Loaded",
      description: `${category} - ${style}`,
    })
  }

  const handlePlayStop = () => {
    if (isPlaying) {
      api.sendCommand({ type: "style", action: "stop" })
      setIsPlaying(false)
    } else {
      api.sendCommand({ type: "style", action: "start" })
      setIsPlaying(true)
    }
  }

  const handleSolo = (track: string) => {
    if (soloedTrack === track) {
      setSoloedTrack(null)
      api.sendCommand({ type: "mixer", action: "solo", channel: null })
    } else {
      setSoloedTrack(track)
      const trackIdx = STYLE_TRACKS.indexOf(track)
      api.sendCommand({ type: "mixer", action: "solo", channel: trackIdx })
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
    api.sendCommand({
      type: "mixer",
      action: "mute",
      channel: trackIdx,
      muted: newMuted.has(track),
    })
  }

  const handleDragStart = (e: React.DragEvent, section: string, track: string) => {
    const data: DragData = { section, track }
    setDraggedItem(data)
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("application/json", JSON.stringify(data))
  }

  const handleDragOver = (e: React.DragEvent, section: string, track: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setHoveredCell(`${section}-${track}`)
  }

  const handleDragLeave = () => {
    setHoveredCell(null)
  }

  const handleDrop = (e: React.DragEvent, section: string, track: string) => {
    e.preventDefault()
    setHoveredCell(null)

    if (draggedItem) {
      const target: DragData = { section, track }
      setPendingCopy({ source: draggedItem, target })
    }
    setDraggedItem(null)
  }

  const handleTouchStart = (e: React.TouchEvent, section: string, track: string) => {
    const touch = e.touches[0]
    const data: DragData = { section, track }
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

  const handleTouchEnd = () => {
    if (!touchDragData || !touchTargetRef.current) {
      setTouchDragData(null)
      setTouchPosition(null)
      setHoveredCell(null)
      touchTargetRef.current = null
      return
    }

    const { section, track } = touchTargetRef.current
    const target: DragData = { section, track }

    setPendingCopy({ source: touchDragData, target })

    setTouchDragData(null)
    setTouchPosition(null)
    setHoveredCell(null)
    touchTargetRef.current = null
  }

  const handleExecute = () => {
    if (!pendingCopy) return

    const { source, target } = pendingCopy
    const pattern: CopiedPattern = {
      sourceSection: source.section,
      sourceTrack: source.track,
      targetSection: target.section,
      targetTrack: target.track,
    }

    setAssemblyHistory((prev) => [...prev, [...copiedPatterns]])
    setCopiedPatterns((prev) => [...prev, pattern])
    setPendingCopy(null)

    toast({
      title: "Pattern Copied",
      description: `${source.section} - ${source.track} → ${target.section} - ${target.track}`,
      duration: 3000,
    })
  }

  const handleUndo = () => {
    if (assemblyHistory.length === 0) return

    const previousState = assemblyHistory[assemblyHistory.length - 1]
    setCopiedPatterns(previousState)
    setAssemblyHistory((prev) => prev.slice(0, -1))

    toast({
      title: "Undo",
      description: "Last operation reverted",
    })
  }

  const handleSave = () => {
    toast({
      title: "Style Saved",
      description: "Your assembled style has been saved",
    })
  }

  const getPatternForCell = (section: string, track: string): CopiedPattern | undefined => {
    return copiedPatterns.find((p) => p.targetSection === section && p.targetTrack === track)
  }

  return (
    <div className="min-h-screen bg-black p-2 sm:p-4 md:p-6">
      {/* Header Controls */}
      <div className="premium-card p-3 sm:p-6 mb-3 sm:mb-4">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white">Style Assembly</h1>
            <p className="text-xs sm:text-base text-gray-400 mt-1">Drag patterns from source to target timeline</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleExecute}
              disabled={!pendingCopy}
              className="glossy-button bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-base font-bold flex-1 sm:flex-none min-w-[120px]"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Execute
            </Button>
            <Button
              onClick={handleUndo}
              disabled={assemblyHistory.length === 0}
              variant="outline"
              className="h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-base font-bold border-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 bg-black/40 flex-1 sm:flex-none min-w-[100px]"
            >
              <Undo className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Undo
            </Button>
            <Button
              onClick={handleSave}
              className="glossy-button bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-base font-bold flex-1 sm:flex-none min-w-[100px]"
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Save
            </Button>
            <Button
              onClick={handlePlayStop}
              className={cn(
                "glossy-button h-10 sm:h-12 px-4 sm:px-6 text-xs sm:text-base font-bold flex-1 sm:flex-none min-w-[100px]",
                isPlaying
                  ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500"
                  : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500",
              )}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Play
                </>
              )}
            </Button>
          </div>

          {pendingCopy && (
            <div className="bg-purple-500/20 border-2 border-purple-500/50 rounded-xl p-3 sm:p-4 animate-pulse">
              <div className="text-xs sm:text-sm font-bold text-purple-300 mb-1">Pending Copy:</div>
              <div className="text-sm sm:text-base font-bold text-white">
                {pendingCopy.source.section} - {pendingCopy.source.track} → {pendingCopy.target.section} -{" "}
                {pendingCopy.target.track}
              </div>
              <div className="text-xs text-purple-400 mt-1">Tap Execute to confirm</div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden space-y-3 sm:space-y-4">
        {/* Source Panel - Mobile */}
        <div className="premium-card overflow-hidden">
          <button
            onClick={() => setIsSourceExpanded(!isSourceExpanded)}
            className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 animate-pulse" />
              <div className="text-left">
                <h2 className="text-lg sm:text-2xl font-bold text-emerald-400">Source Patterns</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                  {sourceCategory} - {sourceStyle} - {sourceSection}
                </p>
              </div>
            </div>
            {isSourceExpanded ? (
              <ChevronUp className="w-6 h-6 text-emerald-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-emerald-400" />
            )}
          </button>

          {isSourceExpanded && (
            <div className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Category</label>
                  <Select
                    value={sourceCategory}
                    onValueChange={(val) => handleSourceStyleChange(val, STYLE_NAMES[val]?.[0] || "")}
                  >
                    <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 text-white font-bold h-10 sm:h-11 rounded-xl text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-2 border-emerald-500/40 text-white">
                      {STYLE_CATEGORIES.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-emerald-500 focus:to-green-500 focus:text-black"
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Style</label>
                  <Select value={sourceStyle} onValueChange={(val) => handleSourceStyleChange(sourceCategory, val)}>
                    <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 text-white font-bold h-10 sm:h-11 rounded-xl text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-2 border-emerald-500/40 text-white">
                      {STYLE_NAMES[sourceCategory]?.map((style) => (
                        <SelectItem
                          key={style}
                          value={style}
                          className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-emerald-500 focus:to-green-500 focus:text-black"
                        >
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Section</label>
                  <Select value={sourceSection} onValueChange={setSourceSection}>
                    <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 text-white font-bold h-10 sm:h-11 rounded-xl text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-2 border-emerald-500/40 text-white">
                      {STYLE_SECTIONS.map((section) => (
                        <SelectItem
                          key={section}
                          value={section}
                          className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-emerald-500 focus:to-green-500 focus:text-black"
                        >
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {STYLE_TRACKS.map((track) => (
                  <div
                    key={`source-${sourceSection}-${track}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, sourceSection, track)}
                    onTouchStart={(e) => handleTouchStart(e, sourceSection, track)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-xl p-3 sm:p-4 cursor-grab active:cursor-grabbing hover:from-emerald-500/30 hover:to-green-500/30 hover:border-emerald-400 active:scale-95 transition-all shadow-lg touch-none"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">{track}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-300 truncate">{sourceSection}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
                {STYLE_TRACKS.map((track) => (
                  <Button
                    key={`control-${track}`}
                    size="sm"
                    variant="outline"
                    onClick={() => (soloedTrack === track ? handleSolo(track) : handleMute(track))}
                    className={cn(
                      "h-9 text-xs font-bold border-2 justify-start",
                      mutedTracks.has(track)
                        ? "bg-red-500/20 border-red-500/50 text-red-400"
                        : soloedTrack === track
                          ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                          : "border-zinc-700 hover:border-emerald-500/50",
                    )}
                  >
                    {mutedTracks.has(track) ? (
                      <VolumeX className="w-3 h-3 mr-2" />
                    ) : (
                      <Volume2 className="w-3 h-3 mr-2" />
                    )}
                    {track}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Target Panel - Mobile */}
        <div className="premium-card p-4 sm:p-6">
          <div className="border-b border-blue-500/30 pb-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-blue-400">Target Timeline</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Drop patterns here</p>
              </div>
              <div className="text-xs sm:text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/30">
                {copiedPatterns.length} copied
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Target Section</label>
            <Select value={targetSection} onValueChange={setTargetSection}>
              <SelectTrigger className="bg-black/60 border-2 border-blue-500/40 text-white font-bold h-10 sm:h-11 rounded-xl text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-2 border-blue-500/40 text-white">
                {STYLE_SECTIONS.map((section) => (
                  <SelectItem
                    key={section}
                    value={section}
                    className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-blue-500 focus:to-cyan-500 focus:text-black"
                  >
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {STYLE_TRACKS.map((track) => {
              const cellId = `${targetSection}-${track}`
              const isHovered = hoveredCell === cellId
              const pattern = getPatternForCell(targetSection, track)
              const hasCopiedPattern = !!pattern
              const isPendingTarget =
                pendingCopy?.target.section === targetSection && pendingCopy?.target.track === track

              return (
                <div
                  key={`target-${cellId}`}
                  data-drop-zone="true"
                  data-section={targetSection}
                  data-track={track}
                  onDragOver={(e) => handleDragOver(e, targetSection, track)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, targetSection, track)}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-3 sm:p-4 transition-all min-h-[70px] sm:min-h-[80px] flex items-center",
                    isHovered
                      ? "bg-amber-500/30 border-amber-400 scale-[1.02] shadow-xl shadow-amber-500/30"
                      : isPendingTarget
                        ? "bg-purple-500/30 border-purple-400 shadow-xl shadow-purple-500/30 animate-pulse"
                        : hasCopiedPattern
                          ? "bg-emerald-500/20 border-emerald-500/60 shadow-lg"
                          : "bg-zinc-900/50 border-zinc-700 hover:border-blue-500/50",
                  )}
                >
                  {hasCopiedPattern ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-wide truncate">
                          {pattern.sourceSection} - {pattern.sourceTrack}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-white truncate">{track}</div>
                      </div>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                    </div>
                  ) : isPendingTarget ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase">Pending</div>
                        <div className="text-xs sm:text-sm font-bold text-white truncate">{track}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse flex-shrink-0" />
                    </div>
                  ) : (
                    <div className="w-full text-center">
                      <div className="text-xs sm:text-sm font-bold text-gray-500">{track}</div>
                      {isHovered && <div className="text-[10px] sm:text-xs text-amber-400 mt-1">Drop Here</div>}
                      {!isHovered && <div className="text-[10px] sm:text-xs text-gray-600 mt-1">Drag pattern here</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-2 gap-4">
        {/* Source Panel - Desktop */}
        <div className="premium-card p-6">
          <div className="border-b border-emerald-500/30 pb-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 animate-pulse" />
              <h2 className="text-2xl font-bold text-emerald-400">Source Patterns</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Category</label>
                <Select
                  value={sourceCategory}
                  onValueChange={(val) => handleSourceStyleChange(val, STYLE_NAMES[val]?.[0] || "")}
                >
                  <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 text-white font-bold h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-2 border-emerald-500/40 text-white">
                    {STYLE_CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-emerald-500 focus:to-green-500 focus:text-black"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Style</label>
                <Select value={sourceStyle} onValueChange={(val) => handleSourceStyleChange(sourceCategory, val)}>
                  <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 text-white font-bold h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-2 border-emerald-500/40 text-white">
                    {STYLE_NAMES[sourceCategory]?.map((style) => (
                      <SelectItem
                        key={style}
                        value={style}
                        className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-emerald-500 focus:to-green-500 focus:text-black"
                      >
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Section</label>
                <Select value={sourceSection} onValueChange={setSourceSection}>
                  <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 text-white font-bold h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-2 border-emerald-500/40 text-white">
                    {STYLE_SECTIONS.map((section) => (
                      <SelectItem
                        key={section}
                        value={section}
                        className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-emerald-500 focus:to-green-500 focus:text-black"
                      >
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {STYLE_TRACKS.map((track) => (
              <div
                key={`source-desktop-${sourceSection}-${track}`}
                draggable
                onDragStart={(e) => handleDragStart(e, sourceSection, track)}
                className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:from-emerald-500/30 hover:to-green-500/30 hover:border-emerald-400 active:scale-95 transition-all shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">{track}</div>
                      <div className="text-xs text-emerald-300">{sourceSection}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSolo(track)
                      }}
                      className={cn(
                        "h-8 w-8 p-0",
                        soloedTrack === track ? "bg-yellow-500/20 text-yellow-400" : "text-gray-400",
                      )}
                    >
                      S
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMute(track)
                      }}
                      className={cn(
                        "h-8 w-8 p-0",
                        mutedTracks.has(track) ? "bg-red-500/20 text-red-400" : "text-gray-400",
                      )}
                    >
                      {mutedTracks.has(track) ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Panel - Desktop */}
        <div className="premium-card p-6">
          <div className="border-b border-blue-500/30 pb-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-400">Target Timeline</h2>
              <div className="text-sm font-bold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30">
                {copiedPatterns.length} patterns copied
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Target Section</label>
              <Select value={targetSection} onValueChange={setTargetSection}>
                <SelectTrigger className="bg-black/60 border-2 border-blue-500/40 text-white font-bold h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-2 border-blue-500/40 text-white">
                  {STYLE_SECTIONS.map((section) => (
                    <SelectItem
                      key={section}
                      value={section}
                      className="text-white font-bold hover:bg-zinc-900 focus:bg-gradient-to-r focus:from-blue-500 focus:to-cyan-500 focus:text-black"
                    >
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {STYLE_TRACKS.map((track) => {
              const cellId = `${targetSection}-${track}`
              const isHovered = hoveredCell === cellId
              const pattern = getPatternForCell(targetSection, track)
              const hasCopiedPattern = !!pattern
              const isPendingTarget =
                pendingCopy?.target.section === targetSection && pendingCopy?.target.track === track

              return (
                <div
                  key={`target-desktop-${cellId}`}
                  data-drop-zone="true"
                  data-section={targetSection}
                  data-track={track}
                  onDragOver={(e) => handleDragOver(e, targetSection, track)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, targetSection, track)}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-4 transition-all min-h-[80px] flex items-center",
                    isHovered
                      ? "bg-amber-500/30 border-amber-400 scale-[1.02] shadow-xl shadow-amber-500/30"
                      : isPendingTarget
                        ? "bg-purple-500/30 border-purple-400 shadow-xl shadow-purple-500/30 animate-pulse"
                        : hasCopiedPattern
                          ? "bg-emerald-500/20 border-emerald-500/60 shadow-lg"
                          : "bg-zinc-900/50 border-zinc-700 hover:border-blue-500/50",
                  )}
                >
                  {hasCopiedPattern ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                          {pattern.sourceSection} - {pattern.sourceTrack}
                        </div>
                        <div className="text-sm font-bold text-white">{track}</div>
                      </div>
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                  ) : isPendingTarget ? (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-purple-400 uppercase">Pending Drop</div>
                        <div className="text-sm font-bold text-white">{track}</div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-full text-center">
                      <div className="text-sm font-bold text-gray-500">{track}</div>
                      {isHovered && <div className="text-xs text-amber-400 mt-1">Drop Here</div>}
                      {!isHovered && <div className="text-xs text-gray-600 mt-1">Drag pattern here</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Touch Drag Preview */}
      {touchDragData && touchPosition && (
        <div
          className="fixed pointer-events-none z-50 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 shadow-2xl border-2 border-emerald-400 opacity-90"
          style={{
            left: touchPosition.x - 60,
            top: touchPosition.y - 30,
            width: "120px",
          }}
        >
          <div className="text-xs font-bold text-white text-center truncate">{touchDragData.track}</div>
          <div className="text-[10px] text-emerald-100 text-center truncate">{touchDragData.section}</div>
        </div>
      )}
    </div>
  )
}
