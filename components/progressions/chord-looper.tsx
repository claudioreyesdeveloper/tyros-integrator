"use client"

import { useState } from "react"
import { Play, Square, Circle, RotateCcw, Save, Trash2, Download, Upload, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChordLoop {
  id: number
  name: string
  bars: number
  chords: string[]
  isPlaying: boolean
  isLooping: boolean
}

const MOCK_LOOPS: ChordLoop[] = [
  {
    id: 1,
    name: "Pop Verse",
    bars: 8,
    chords: ["Cmaj7", "Am7", "Dm7", "G7", "Cmaj7", "Fmaj7", "Dm7", "G7"],
    isPlaying: false,
    isLooping: false,
  },
  {
    id: 2,
    name: "Pop Chorus",
    bars: 8,
    chords: ["C", "G", "Am", "F", "C", "G", "F", "G"],
    isPlaying: false,
    isLooping: false,
  },
  {
    id: 3,
    name: "Jazz Loop",
    bars: 8,
    chords: ["Fmaj7", "Bb7", "Gm7", "C7", "Fmaj7", "Ebmaj7", "Dm7", "G7"],
    isPlaying: false,
    isLooping: true,
  },
]

export function ChordLooper() {
  const [loops, setLoops] = useState<ChordLoop[]>([
    ...MOCK_LOOPS,
    ...Array(5)
      .fill(null)
      .map((_, i) => ({
        id: i + 4,
        name: "",
        bars: 0,
        chords: [],
        isPlaying: false,
        isLooping: false,
      })),
  ])
  const [selectedLoop, setSelectedLoop] = useState<ChordLoop | null>(MOCK_LOOPS[0])
  const [isRecording, setIsRecording] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [tempo, setTempo] = useState(96)
  const [key, setKey] = useState("C")
  const [currentBar, setCurrentBar] = useState(0)

  const handleSelectLoop = (loop: ChordLoop) => {
    if (loop.chords.length > 0) {
      setSelectedLoop(loop)
      setCurrentBar(0)
    }
  }

  const handlePlay = () => {
    if (!selectedLoop || selectedLoop.chords.length === 0) return

    setLoops((prev) =>
      prev.map((loop) =>
        loop.id === selectedLoop.id ? { ...loop, isPlaying: !loop.isPlaying } : { ...loop, isPlaying: false },
      ),
    )

    setSelectedLoop((prev) => (prev ? { ...prev, isPlaying: !prev.isPlaying } : null))
  }

  const handleStop = () => {
    setLoops((prev) => prev.map((loop) => ({ ...loop, isPlaying: false })))
    if (selectedLoop) {
      setSelectedLoop({ ...selectedLoop, isPlaying: false })
    }
    setCurrentBar(0)
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      handleStop()
    }
  }

  const handleLoop = () => {
    if (!selectedLoop) return
    const updatedLoop = { ...selectedLoop, isLooping: !selectedLoop.isLooping }
    setSelectedLoop(updatedLoop)
    setLoops((prev) => prev.map((loop) => (loop.id === selectedLoop.id ? updatedLoop : loop)))
  }

  const handleClear = () => {
    if (!selectedLoop) return
    const clearedLoop = { ...selectedLoop, chords: [], bars: 0, isPlaying: false, isLooping: false }
    setSelectedLoop(clearedLoop)
    setLoops((prev) => prev.map((loop) => (loop.id === selectedLoop.id ? clearedLoop : loop)))
    setCurrentBar(0)
  }

  const handleSave = () => {
    if (!selectedLoop) return
    console.log("[v0] Saving loop to persistent storage:", selectedLoop)
    // Future: Save to loops.json
  }

  const handleImportFromLibrary = () => {
    console.log("[v0] Opening Chord Library browser")
    // Future: Open Chord Library modal or switch to Chord Assistant tab
  }

  const handleExportMIDI = () => {
    if (!selectedLoop) return
    console.log("[v0] Exporting loop as MIDI:", selectedLoop)
    // Future: Generate and download .mid file
  }

  const handleSendToStyleEngine = () => {
    if (!selectedLoop) return
    console.log("[v0] Sending loop to Style Engine via SysEx:", selectedLoop)
    // Future: Send via MIDI SysEx to Yamaha keyboard
  }

  const getLoopStatusIcon = (loop: ChordLoop) => {
    if (loop.isPlaying) return "▶"
    if (loop.isLooping) return "🔁"
    return "⏹"
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="premium-card p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Chord Looper</h2>
            <p className="text-sm text-gray-400 mt-1">Record, store, and play back chord progressions in sync</p>
          </div>

          {/* Sync, Tempo, Key Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sync:</span>
              <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
              <span className={`text-sm font-medium ${syncEnabled ? "text-primary" : "text-gray-500"}`}>
                {syncEnabled ? "ON" : "OFF"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Tempo:</span>
              <Input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-20 bg-black/30 border-primary/30 text-white text-center"
                min={40}
                max={240}
              />
              <span className="text-sm text-gray-400">BPM</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Key:</span>
              <Select value={key} onValueChange={setKey}>
                <SelectTrigger className="w-20 bg-black/30 border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30">
                  {["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"].map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Loop Slots Grid */}
      <div className="premium-card p-4 md:p-6">
        <h3 className="text-lg font-bold text-white mb-4">Loop Slots</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {loops.map((loop) => (
            <button
              key={loop.id}
              onClick={() => handleSelectLoop(loop)}
              disabled={loop.chords.length === 0}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${
                  selectedLoop?.id === loop.id
                    ? "bg-primary/20 border-primary"
                    : loop.chords.length > 0
                      ? "bg-black/20 border-primary/30 hover:bg-black/30 hover:border-primary/50"
                      : "bg-black/10 border-primary/10 opacity-50 cursor-not-allowed"
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary">{loop.id}</span>
                {loop.chords.length > 0 && <span className="text-lg">{getLoopStatusIcon(loop)}</span>}
              </div>
              <div className="text-sm font-medium text-white truncate">{loop.name || "Empty Slot"}</div>
              {loop.chords.length > 0 && <div className="text-xs text-gray-400 mt-1">{loop.bars} bars</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Current Loop Display */}
      <div className="premium-card p-4 md:p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{selectedLoop?.name || "No Loop Selected"}</h3>
            {selectedLoop && selectedLoop.chords.length > 0 && (
              <p className="text-sm text-gray-400 mt-1">Length: {selectedLoop.bars} Bars</p>
            )}
          </div>
        </div>

        {/* Chord Timeline */}
        {selectedLoop && selectedLoop.chords.length > 0 ? (
          <div className="bg-black/20 rounded-lg border-2 border-primary/20 p-4 mb-6">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {selectedLoop.chords.map((chord, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg border-2 font-bold text-base md:text-lg
                    ${
                      selectedLoop.isPlaying && index === currentBar
                        ? "bg-primary/30 border-primary text-white animate-pulse"
                        : "bg-black/30 border-primary/30 text-gray-300"
                    }
                  `}
                >
                  <span>{chord}</span>
                  <span className="text-xs text-gray-500 mt-1">Bar {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-black/20 rounded-lg border-2 border-primary/20 p-8 mb-6 flex items-center justify-center">
            <p className="text-gray-500 text-center">
              {isRecording ? "Recording... Play chords on your keyboard" : "Select a loop or start recording"}
            </p>
          </div>
        )}

        {/* Transport Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            onClick={handleRecord}
            className={isRecording ? "glossy-button" : "bg-black/30 border border-primary/30 hover:border-primary/50"}
          >
            <Circle className={`w-4 h-4 mr-2 ${isRecording ? "fill-red-500 text-red-500" : ""}`} />
            Record
          </Button>

          <Button
            onClick={handlePlay}
            disabled={!selectedLoop || selectedLoop.chords.length === 0}
            className={
              selectedLoop?.isPlaying ? "glossy-button" : "bg-black/30 border border-primary/30 hover:border-primary/50"
            }
          >
            <Play className="w-4 h-4 mr-2" />
            Play
          </Button>

          <Button
            onClick={handleStop}
            variant="outline"
            className="bg-black/30 border border-primary/30 hover:border-primary/50"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>

          <Button
            onClick={handleLoop}
            disabled={!selectedLoop || selectedLoop.chords.length === 0}
            className={
              selectedLoop?.isLooping ? "glossy-button" : "bg-black/30 border border-primary/30 hover:border-primary/50"
            }
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Loop
          </Button>

          <Button
            onClick={handleClear}
            disabled={!selectedLoop || selectedLoop.chords.length === 0}
            variant="outline"
            className="bg-black/30 border border-primary/30 hover:border-primary/50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>

          <Button
            onClick={handleSave}
            disabled={!selectedLoop || selectedLoop.chords.length === 0}
            className="glossy-button"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        {/* Import / Export Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleImportFromLibrary}
            variant="outline"
            className="bg-black/30 border border-primary/30 hover:border-primary/50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import from Library
          </Button>

          <Button
            onClick={handleExportMIDI}
            disabled={!selectedLoop || selectedLoop.chords.length === 0}
            variant="outline"
            className="bg-black/30 border border-primary/30 hover:border-primary/50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export MIDI
          </Button>

          <Button
            onClick={handleSendToStyleEngine}
            disabled={!selectedLoop || selectedLoop.chords.length === 0}
            className="glossy-button"
          >
            <Send className="w-4 h-4 mr-2" />
            Send to Style Engine
          </Button>
        </div>
      </div>
    </div>
  )
}
