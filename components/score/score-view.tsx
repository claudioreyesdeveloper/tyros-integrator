"use client"

import { useState } from "react"
import { Play, Square, RotateCcw, Microscope as Metronome, Upload, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Voice } from "@/lib/voice-data"

interface ScoreViewProps {
  partVoices: Record<number, Voice>
}

type ViewMode = "split" | "score-only" | "mixer-only"

export function ScoreView({ partVoices }: ScoreViewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [isLooping, setIsLooping] = useState(false)
  const [metronomeOn, setMetronomeOn] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("split")
  const [showChords, setShowChords] = useState(true)
  const [showLyrics, setShowLyrics] = useState(true)
  const [highlightRightHand, setHighlightRightHand] = useState(true)
  const [muteRightHand, setMuteRightHand] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [songPosition, setSongPosition] = useState(0)

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setSongPosition(0)
  }

  const handleTempoChange = (delta: number) => {
    setTempo((prev) => Math.max(30, Math.min(400, prev + delta)))
  }

  const handleLoadSong = () => {
    console.log("[v0] Load song clicked")
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="premium-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Score & Performance</h2>
            <p className="text-sm text-gray-400">Yamaha Tyros / Genos detected</p>
          </div>
          <Button onClick={handleLoadSong} className="glossy-button">
            <Upload className="w-4 h-4 mr-2" />
            Load Song
          </Button>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <Button
              onClick={handlePlay}
              className={isPlaying ? "glossy-button" : "bg-black/30 border border-primary/30 hover:border-primary/50"}
            >
              {isPlaying ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Start"}
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
              onClick={() => setIsLooping(!isLooping)}
              variant="outline"
              className={isLooping ? "glossy-button" : "bg-black/30 border border-primary/30 hover:border-primary/50"}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Loop
            </Button>
            <Button
              onClick={() => setMetronomeOn(!metronomeOn)}
              variant="outline"
              className={metronomeOn ? "glossy-button" : "bg-black/30 border border-primary/30 hover:border-primary/50"}
            >
              <Metronome className="w-4 h-4 mr-2" />
              Metronome
            </Button>
          </div>

          <div className="h-8 w-px bg-primary/20" />

          {/* Tempo Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Tempo:</span>
            <Button
              onClick={() => handleTempoChange(-5)}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-black/30 border border-primary/30"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-lg font-bold text-primary min-w-[80px] text-center">{tempo} BPM</span>
            <Button
              onClick={() => handleTempoChange(5)}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-black/30 border border-primary/30"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sheet Music Panel */}
        {(viewMode === "split" || viewMode === "score-only") && (
          <div className={`premium-card p-4 flex flex-col ${viewMode === "split" ? "flex-[2]" : "flex-1"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Sheet Music</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-chords"
                    checked={showChords}
                    onCheckedChange={(checked) => setShowChords(checked as boolean)}
                  />
                  <Label htmlFor="show-chords" className="text-sm text-gray-300 cursor-pointer">
                    Show Chords
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-lyrics"
                    checked={showLyrics}
                    onCheckedChange={(checked) => setShowLyrics(checked as boolean)}
                  />
                  <Label htmlFor="show-lyrics" className="text-sm text-gray-300 cursor-pointer">
                    Show Lyrics
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="highlight-right"
                    checked={highlightRightHand}
                    onCheckedChange={(checked) => setHighlightRightHand(checked as boolean)}
                  />
                  <Label htmlFor="highlight-right" className="text-sm text-gray-300 cursor-pointer">
                    Highlight Right Hand
                  </Label>
                </div>
              </div>
            </div>

            {/* Sheet Music Display */}
            <div className="flex-1 bg-black/20 rounded-lg border-2 border-primary/20 p-6 overflow-auto">
              <div className="text-center text-gray-400 py-20">
                <p className="text-lg mb-2">No song loaded</p>
                <p className="text-sm">Load a MIDI or XF file to display sheet music</p>
              </div>
            </div>

            {/* Zoom Control */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-gray-400">Zoom:</span>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={50}
                max={200}
                step={10}
                className="flex-1 max-w-xs"
              />
              <span className="text-sm font-bold text-primary min-w-[50px]">{zoom}%</span>
            </div>
          </div>
        )}

        {/* Compact Mixer Panel */}
        {(viewMode === "split" || viewMode === "mixer-only") && (
          <div className={`premium-card p-4 flex flex-col ${viewMode === "split" ? "flex-1" : "flex-1"}`}>
            <h3 className="text-lg font-bold text-white mb-4">Mixer</h3>

            {/* Channel Strips */}
            <div className="flex-1 flex gap-2 overflow-x-auto">
              {/* Left Channel */}
              <ChannelStrip channel={1} label="Left" voiceName={partVoices[1]?.voice || "No Voice"} />

              {/* Right Channels */}
              <ChannelStrip channel={2} label="Right 1" voiceName={partVoices[2]?.voice || "No Voice"} />
              <ChannelStrip channel={3} label="Right 2" voiceName={partVoices[3]?.voice || "No Voice"} />
              <ChannelStrip channel={4} label="Right 3" voiceName={partVoices[4]?.voice || "No Voice"} />

              {/* Style Channels (grouped) */}
              <div className="flex flex-col gap-2 min-w-[80px]">
                <div className="text-xs font-bold text-center text-gray-400 mb-1">Style 1-8</div>
                <div className="flex-1 bg-black/20 rounded-lg border border-primary/20 p-2 flex flex-col items-center justify-center">
                  <Slider orientation="vertical" defaultValue={[80]} min={0} max={127} className="h-32" />
                  <span className="text-xs text-gray-400 mt-2">80</span>
                </div>
              </div>
            </div>

            {/* Global Controls */}
            <div className="mt-4 pt-4 border-t border-primary/20 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-black/30 border border-primary/30">
                Reset Mix
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-black/30 border border-primary/30">
                Sync to Keyboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="premium-card p-4 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Bar 1</span>
            <span>Bar 32</span>
          </div>
          <Slider
            value={[songPosition]}
            onValueChange={(value) => setSongPosition(value[0])}
            min={0}
            max={100}
            className="w-full"
          />
        </div>

        {/* View Mode and Practice Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">View Mode:</span>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <SelectTrigger className="w-[180px] bg-black/30 border border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 backdrop-blur-md border-2 border-primary/30">
                <SelectItem value="split">Split View</SelectItem>
                <SelectItem value="score-only">Score Only</SelectItem>
                <SelectItem value="mixer-only">Mixer Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="mute-right"
              checked={muteRightHand}
              onCheckedChange={(checked) => setMuteRightHand(checked as boolean)}
            />
            <Label htmlFor="mute-right" className="text-sm text-gray-300 cursor-pointer">
              Mute Right-Hand part (for practice)
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact Channel Strip Component
function ChannelStrip({ channel, label, voiceName }: { channel: number; label: string; voiceName: string }) {
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isSolo, setIsSolo] = useState(false)

  return (
    <div className="flex flex-col gap-2 min-w-[80px]">
      <div className="text-xs font-bold text-center text-gray-400">{label}</div>
      <div className="flex-1 bg-black/20 rounded-lg border border-primary/20 p-2 flex flex-col items-center gap-2">
        {/* Volume Fader */}
        <Slider
          orientation="vertical"
          value={[volume]}
          onValueChange={(value) => setVolume(value[0])}
          min={0}
          max={127}
          className="h-32"
          disabled={isMuted}
        />
        <span className="text-xs text-gray-400">{volume}</span>

        {/* Mute/Solo Buttons */}
        <div className="flex gap-1 w-full">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMuted(!isMuted)}
            className={`flex-1 h-6 text-[10px] p-0 ${isMuted ? "bg-red-500/50 border-red-500" : "bg-black/30 border-primary/30"}`}
          >
            M
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSolo(!isSolo)}
            className={`flex-1 h-6 text-[10px] p-0 ${isSolo ? "bg-primary/50 border-primary" : "bg-black/30 border-primary/30"}`}
          >
            S
          </Button>
        </div>

        {/* Voice Name */}
        <div className="text-[10px] text-center text-gray-400 line-clamp-2 w-full">{voiceName}</div>
      </div>
    </div>
  )
}
