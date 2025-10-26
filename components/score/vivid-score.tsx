"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  Music,
  Settings,
  Plus,
  Trash2,
  LocateFixed,
} from "lucide-react"

interface Marker {
  id: string
  name: string
  measure: number
  type: "A" | "B" | "custom"
}

interface LoopRegion {
  start: number
  end: number
  enabled: boolean
}

export function VividScore() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [timeSignature, setTimeSignature] = useState("4/4")
  const [keySignature, setKeySignature] = useState("C Major")
  const [followMode, setFollowMode] = useState(true)
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [currentMeasure, setCurrentMeasure] = useState(1)
  const [totalMeasures, setTotalMeasures] = useState(32)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [loopRegion, setLoopRegion] = useState<LoopRegion>({
    start: 1,
    end: 8,
    enabled: false,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [hoveredMeasure, setHoveredMeasure] = useState<number | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentMeasure(1)
  }

  const handleAddMarker = (type: "A" | "B" | "custom") => {
    const newMarker: Marker = {
      id: `marker-${Date.now()}`,
      name: `${type} Marker`,
      measure: currentMeasure,
      type,
    }
    setMarkers([...markers, newMarker])
  }

  const handleRemoveMarker = (id: string) => {
    setMarkers(markers.filter((m) => m.id !== id))
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 50))
  }

  const handleFitWidth = () => {
    setZoom(100)
  }

  const handleJumpToMeasure = (measure: number) => {
    setCurrentMeasure(measure)
  }

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(
        () => {
          setCurrentMeasure((prev) => {
            if (loopRegion.enabled && prev >= loopRegion.end) {
              return loopRegion.start
            }
            return prev < totalMeasures ? prev + 1 : 1
          })
        },
        (60000 / tempo) * 4,
      )

      return () => clearInterval(interval)
    }
  }, [isPlaying, tempo, loopRegion, totalMeasures])

  return (
    <div className="h-full flex flex-col bg-transparent backdrop-blur-sm">
      <div className="border-b border-border/50 bg-black/20 backdrop-blur-sm p-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo/Title */}
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-white">Vivid Score</h1>
          </div>

          {/* Center: Playback Timeline Strip */}
          <div className="flex-1 max-w-2xl">
            <div className="relative h-8 bg-black/30 rounded-full overflow-hidden border border-primary/30">
              {/* Timeline background */}
              <div className="absolute inset-0 flex items-center px-2">
                {Array.from({ length: totalMeasures }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full border-r border-white/10 last:border-r-0"
                    style={{ minWidth: "4px" }}
                  />
                ))}
              </div>
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-lg shadow-primary/50 transition-all duration-300"
                style={{ left: `${(currentMeasure / totalMeasures) * 100}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </div>
              {/* Progress fill */}
              <div
                className="absolute inset-y-0 left-0 bg-primary/20 transition-all duration-300"
                style={{ width: `${(currentMeasure / totalMeasures) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: Zoom, Follow, Measure Locator */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              className="h-8 w-8 border-primary/30 hover:bg-white/10 bg-transparent text-white"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              className="h-8 w-8 border-primary/30 hover:bg-white/10 bg-transparent text-white"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 border border-primary/30 rounded-md bg-black/30">
              <Switch checked={followMode} onCheckedChange={setFollowMode} id="follow-mode-header" />
              <Label htmlFor="follow-mode-header" className="text-xs cursor-pointer text-white">
                Follow
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-primary/30 hover:bg-white/10 bg-transparent text-white"
              onClick={() => {
                const measure = prompt("Jump to measure:", String(currentMeasure))
                if (measure) handleJumpToMeasure(Number(measure))
              }}
            >
              <LocateFixed className="h-3 w-3 mr-1" />M{currentMeasure}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Score Viewport */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-auto bg-black/10">
            <div
              ref={canvasRef}
              className="absolute inset-0 flex flex-col items-center justify-center p-8"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            >
              {/* Placeholder for VexFlow/OpenSheetMusicDisplay */}
              <div className="w-full max-w-5xl glossy-panel p-8">
                <div className="text-center space-y-4">
                  <Music className="h-24 w-24 mx-auto text-gray-600" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-white">No Score Loaded</p>
                    <p className="text-sm text-gray-400">Load a MIDI or MusicXML file to begin</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <div className="h-2 w-48 bg-black/30 rounded-full overflow-hidden border border-primary/30">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(currentMeasure / totalMeasures) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-medium tabular-nums">
                      Measure {currentMeasure} / {totalMeasures}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 bg-black/20 backdrop-blur-sm px-4 py-2">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {Array.from({ length: Math.min(totalMeasures, 16) }).map((_, i) => {
                const measureNum = i + 1
                const isActive = measureNum === currentMeasure
                const isHovered = measureNum === hoveredMeasure
                return (
                  <div
                    key={i}
                    className="relative flex-1 group cursor-pointer"
                    onMouseEnter={() => setHoveredMeasure(measureNum)}
                    onMouseLeave={() => setHoveredMeasure(null)}
                    onClick={() => handleJumpToMeasure(measureNum)}
                  >
                    {/* Tick mark */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-0.5 transition-colors ${
                          isActive ? "bg-primary" : isHovered ? "bg-primary/70" : "bg-white/30"
                        }`}
                      />
                      <span
                        className={`text-xs mt-1 transition-colors ${
                          isActive ? "text-primary font-semibold" : isHovered ? "text-primary/70" : "text-gray-500"
                        }`}
                      >
                        {measureNum}
                      </span>
                    </div>
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded shadow-lg whitespace-nowrap border border-primary/30">
                        Measure {measureNum}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-black/90" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-border/50 bg-black/20 backdrop-blur-sm shadow-sm p-3">
            <div className="flex items-center justify-between gap-6">
              {/* Left: Play, Pause, Stop */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePlayPause}
                  className={`h-9 w-9 ${isPlaying ? "glossy-button" : "border-primary/30 hover:bg-white/10 bg-transparent text-white"}`}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleStop}
                  className="h-9 w-9 border-primary/30 hover:bg-white/10 bg-transparent text-white"
                >
                  <Square className="h-4 w-4" />
                </Button>
              </div>

              {/* Center: Tempo and Time Indicators */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-400">Tempo:</Label>
                  <Input
                    type="number"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="w-16 h-8 text-sm bg-black/30 border-primary/30 text-white"
                    min={40}
                    max={240}
                  />
                  <span className="text-xs text-gray-400">BPM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-400">Time:</Label>
                  <span className="text-sm font-medium text-white">{timeSignature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-400">Key:</Label>
                  <span className="text-sm font-medium text-white">{keySignature}</span>
                </div>
              </div>

              {/* Right: Loop Toggle + Progress */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLoopRegion({ ...loopRegion, enabled: !loopRegion.enabled })}
                  className={`h-8 ${loopRegion.enabled ? "glossy-button" : "border-primary/30 hover:bg-white/10 bg-transparent text-white"}`}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Loop {loopRegion.start}-{loopRegion.end}
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium tabular-nums">
                    {Math.round((currentMeasure / totalMeasures) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l border-border/50 bg-black/20 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold text-white">Score Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="hover:bg-white/10 text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Markers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-white">Markers</Label>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddMarker("A")}
                      className="h-7 px-2 border-primary/30 hover:bg-white/10 bg-transparent text-white"
                    >
                      <Plus className="h-3 w-3 mr-1" />A
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddMarker("B")}
                      className="h-7 px-2 border-primary/30 hover:bg-white/10 bg-transparent text-white"
                    >
                      <Plus className="h-3 w-3 mr-1" />B
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {markers.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No markers added</p>
                  ) : (
                    markers.map((marker) => (
                      <Card key={marker.id} className="p-2 flex items-center justify-between premium-card">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">{marker.name}</span>
                          <span className="text-xs text-gray-400">M{marker.measure}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMarker(marker.id)}
                          className="h-6 w-6 hover:bg-white/10 text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Loop Region */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-white">Loop Region</Label>
                  <Switch
                    checked={loopRegion.enabled}
                    onCheckedChange={(checked) => setLoopRegion({ ...loopRegion, enabled: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-12 text-gray-400">Start:</Label>
                    <Input
                      type="number"
                      value={loopRegion.start}
                      onChange={(e) => setLoopRegion({ ...loopRegion, start: Number(e.target.value) })}
                      className="h-8 bg-black/30 border-primary/30 text-white"
                      min={1}
                      max={totalMeasures}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs w-12 text-gray-400">End:</Label>
                    <Input
                      type="number"
                      value={loopRegion.end}
                      onChange={(e) => setLoopRegion({ ...loopRegion, end: Number(e.target.value) })}
                      className="h-8 bg-black/30 border-primary/30 text-white"
                      min={1}
                      max={totalMeasures}
                    />
                  </div>
                </div>
              </div>

              {/* File Operations */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">File Operations</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-primary/30 hover:bg-white/10 bg-transparent text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Load MIDI/MusicXML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-primary/30 hover:bg-white/10 bg-transparent text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Score
                  </Button>
                </div>
              </div>

              {/* Score Display Settings */}
              {showSettings && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">Display Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Staff Spacing</Label>
                      <Slider defaultValue={[50]} min={20} max={100} step={10} className="w-32" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Show Clefs</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Show Measure Numbers</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Metronome</Label>
                      <Switch checked={metronomeEnabled} onCheckedChange={setMetronomeEnabled} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
