"use client"

import type React from "react"
import { useState, useRef } from "react"
import { GripVertical, Play, Square, Volume2, VolumeX, Check, Undo, Save, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      {touchDragData && touchPosition && (
        <div
          className="fixed pointer-events-none z-[10000] bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-emerald-400 rounded-xl p-3 shadow-2xl"
          style={{
            left: touchPosition.x - 60,
            top: touchPosition.y - 30,
            transform: "scale(1.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-white" />
            <div className="text-sm font-bold text-white">
              {touchDragData.section} - {touchDragData.track}
            </div>
          </div>
        </div>
      )}

      <div className="premium-card p-8 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Style Assembly</h1>
            <p className="text-lg text-gray-400">Create hybrid arrangements by mixing patterns from different styles</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleExecute}
              disabled={!pendingCopy}
              className="glossy-button bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed h-12 px-6 text-base font-bold"
            >
              <Check className="w-5 h-5 mr-2" />
              Execute
            </Button>
            <Button
              onClick={handleUndo}
              disabled={assemblyHistory.length === 0}
              variant="outline"
              className="h-12 px-6 text-base font-bold border-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60 disabled:opacity-40 disabled:cursor-not-allowed bg-black/40"
            >
              <Undo className="w-5 h-5 mr-2" />
              Undo
            </Button>
            <Button
              onClick={handleSave}
              className="glossy-button bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 h-12 px-6 text-base font-bold"
            >
              <Save className="w-5 h-5 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {pendingCopy && (
        <div className="premium-card p-6 mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-500/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Source</div>
                <div className="text-base font-bold text-white">
                  {pendingCopy.source.section} - {pendingCopy.source.track}
                </div>
              </div>
              <ArrowRight className="w-8 h-8 text-amber-400" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Target</div>
                <div className="text-base font-bold text-white">
                  {pendingCopy.target.section} - {pendingCopy.target.track}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setPendingCopy(null)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Target Panel (LEFT) */}
        <div className="premium-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-blue-500/30 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-400">Target Style</h2>
              <p className="text-sm text-gray-400 mt-1">Drop patterns here to build your hybrid</p>
            </div>
            <div className="text-sm font-bold text-gray-400 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30">
              {copiedPatterns.length} patterns
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Target Section</label>
            <Select value={targetSection} onValueChange={setTargetSection}>
              <SelectTrigger className="bg-black/60 border-2 border-blue-500/40 hover:border-blue-500/60 focus:border-blue-500 text-white font-bold h-12 rounded-xl text-base">
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

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Target Channels</h3>
            <div className="grid grid-cols-2 gap-3">
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
                      "border-2 border-dashed rounded-xl p-4 transition-all min-h-[90px] flex flex-col items-center justify-center",
                      isHovered
                        ? "bg-amber-500/30 border-amber-400 scale-105 shadow-xl shadow-amber-500/30"
                        : isPendingTarget
                          ? "bg-purple-500/30 border-purple-400 shadow-xl shadow-purple-500/30 animate-pulse"
                          : hasCopiedPattern
                            ? "bg-emerald-500/20 border-emerald-500/60 hover:border-emerald-400 shadow-lg shadow-emerald-500/20"
                            : "bg-zinc-900/50 border-zinc-700 hover:border-blue-500/50 hover:bg-zinc-900",
                    )}
                  >
                    {hasCopiedPattern ? (
                      <>
                        <div className="text-xs font-bold text-emerald-400 text-center uppercase tracking-wide">
                          {pattern.sourceSection}
                        </div>
                        <div className="text-sm font-bold text-white text-center mt-1">{pattern.sourceTrack}</div>
                        <div className="text-xs text-gray-400 text-center mt-1">→ {track}</div>
                      </>
                    ) : isPendingTarget ? (
                      <>
                        <div className="text-xs font-bold text-purple-400 text-center uppercase tracking-wide">
                          Pending
                        </div>
                        <div className="text-sm font-bold text-white text-center mt-1">{track}</div>
                        <div className="text-xs text-purple-300 text-center mt-1">Click Execute</div>
                      </>
                    ) : (
                      <div className="text-sm font-bold text-gray-500 text-center">
                        {isHovered ? "Drop Here" : track}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Source Panel (RIGHT) */}
        <div className="premium-card p-8 space-y-6">
          <div className="border-b border-emerald-500/30 pb-4">
            <h2 className="text-2xl font-bold text-emerald-400">Source Library</h2>
            <p className="text-sm text-gray-400 mt-1">Browse and drag patterns to target</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Category</label>
              <Select
                value={sourceCategory}
                onValueChange={(val) => handleSourceStyleChange(val, STYLE_NAMES[val]?.[0] || "")}
              >
                <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 hover:border-emerald-500/60 focus:border-emerald-500 text-white font-bold h-12 rounded-xl text-base">
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

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Style</label>
              <Select value={sourceStyle} onValueChange={(val) => handleSourceStyleChange(sourceCategory, val)}>
                <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 hover:border-emerald-500/60 focus:border-emerald-500 text-white font-bold h-12 rounded-xl text-base">
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
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Section</label>
            <Select value={sourceSection} onValueChange={setSourceSection}>
              <SelectTrigger className="bg-black/60 border-2 border-emerald-500/40 hover:border-emerald-500/60 focus:border-emerald-500 text-white font-bold h-12 rounded-xl text-base">
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

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Drag Patterns</h3>
            <div className="grid grid-cols-2 gap-3">
              {STYLE_TRACKS.map((track) => (
                <div
                  key={`source-${sourceSection}-${track}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sourceSection, track)}
                  onTouchStart={(e) => handleTouchStart(e, sourceSection, track)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:from-emerald-500/30 hover:to-green-500/30 hover:border-emerald-400 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div className="text-sm font-bold text-white">{track}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-emerald-500/30">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Preview</h3>
            <div className="flex items-center gap-3">
              <Button
                onClick={handlePlayStop}
                className={cn(
                  "glossy-button flex items-center gap-2 h-11 px-5 font-bold",
                  isPlaying
                    ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500",
                )}
              >
                {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? "Stop" : "Play"}
              </Button>
              <span className="text-sm text-gray-400">Preview source pattern</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STYLE_TRACKS.map((track) => (
                <div key={track} className="flex items-center gap-2 bg-black/40 rounded-lg p-2 border border-zinc-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSolo(track)}
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-bold border-2",
                      soloedTrack === track
                        ? "bg-yellow-500 text-black border-yellow-400"
                        : "border-zinc-700 hover:border-yellow-500/50",
                    )}
                  >
                    S
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMute(track)}
                    className={cn(
                      "h-8 w-8 p-0 border-2",
                      mutedTracks.has(track)
                        ? "bg-red-500 text-white border-red-400"
                        : "border-zinc-700 hover:border-red-500/50",
                    )}
                  >
                    {mutedTracks.has(track) ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <span className="text-xs text-gray-300 flex-1 truncate font-medium">{track}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
