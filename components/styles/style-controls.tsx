"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useMIDI } from "@/lib/midi-context"
import { Play, Square, Music2, Zap, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function StyleControls() {
  const { sendControlChange, sendProgramChange } = useMIDI()
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
  const [activeVariation, setActiveVariation] = useState<number>(1)
  const [syncStart, setSyncStart] = useState(false)

  // MIDI channel for style control (typically channel 9 or 10 for rhythm)
  const STYLE_CHANNEL = 9

  const handleStartStop = () => {
    if (isPlaying) {
      // Send Stop (CC 85 = 0)
      sendControlChange(STYLE_CHANNEL, 85, 0)
      setIsPlaying(false)
    } else {
      // Send Start (CC 85 = 127)
      sendControlChange(STYLE_CHANNEL, 85, 127)
      setIsPlaying(true)
    }
  }

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0]
    setTempo(newTempo)
    // Send tempo via CC (some keyboards use CC 88 for tempo)
    sendControlChange(STYLE_CHANNEL, 88, Math.floor((newTempo / 300) * 127))
  }

  const handleVariation = (variation: number) => {
    setActiveVariation(variation)
    // Send variation change (CC 86 with different values)
    sendControlChange(STYLE_CHANNEL, 86, (variation - 1) * 32)
  }

  const handleFillIn = (type: "auto" | "break" | "intro" | "ending") => {
    // Different CC values for different fill types
    const fillCodes = {
      intro: 102,
      auto: 103,
      break: 104,
      ending: 105,
    }
    sendControlChange(STYLE_CHANNEL, fillCodes[type], 127)
  }

  const handleSyncStart = () => {
    setSyncStart(!syncStart)
    // CC 87 for sync start
    sendControlChange(STYLE_CHANNEL, 87, syncStart ? 0 : 127)
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-balance mb-2">Style Controls</h2>
        <p className="text-muted-foreground">Control accompaniment styles, tempo, and variations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Transport Controls */}
        <div className="bg-card border-2 border-border rounded-lg p-6 space-y-6">
          <h3 className="font-bold uppercase tracking-wide text-sm mb-4">Transport</h3>

          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              variant={isPlaying ? "destructive" : "default"}
              onClick={handleStartStop}
              className="h-20 text-lg font-bold shadow-lg"
            >
              {isPlaying ? (
                <>
                  <Square className="w-6 h-6 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2" />
                  Start
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant={syncStart ? "default" : "outline"}
              onClick={handleSyncStart}
              className="h-20 text-lg font-bold"
            >
              <Zap className="w-6 h-6 mr-2" />
              Sync Start
            </Button>
          </div>

          {/* Tempo Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium text-sm uppercase tracking-wide">Tempo</label>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold font-mono text-primary">{tempo}</span>
                <span className="text-sm text-muted-foreground">BPM</span>
              </div>
            </div>
            <Slider value={[tempo]} onValueChange={handleTempoChange} min={40} max={300} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>40</span>
              <span>120</span>
              <span>180</span>
              <span>240</span>
              <span>300</span>
            </div>
          </div>

          {/* Quick Tempo Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[80, 100, 120, 140].map((bpm) => (
              <Button key={bpm} variant="outline" size="sm" onClick={() => handleTempoChange([bpm])}>
                {bpm}
              </Button>
            ))}
          </div>
        </div>

        {/* Variation Controls */}
        <div className="bg-card border-2 border-border rounded-lg p-6 space-y-6">
          <h3 className="font-bold uppercase tracking-wide text-sm mb-4">Variations</h3>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((variation) => (
              <Button
                key={variation}
                size="lg"
                variant={activeVariation === variation ? "default" : "outline"}
                onClick={() => handleVariation(variation)}
                className={cn(
                  "h-24 text-xl font-bold transition-all",
                  activeVariation === variation && "shadow-lg shadow-primary/30 scale-105",
                )}
              >
                <Music2 className="w-6 h-6 mr-2" />
                Variation {variation}
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-sm uppercase tracking-wide mb-3">Fill-Ins & Breaks</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="lg" onClick={() => handleFillIn("intro")} className="h-16">
                <ArrowRight className="w-5 h-5 mr-2" />
                Intro
              </Button>
              <Button variant="secondary" size="lg" onClick={() => handleFillIn("ending")} className="h-16">
                <Square className="w-5 h-5 mr-2" />
                Ending
              </Button>
              <Button variant="secondary" size="lg" onClick={() => handleFillIn("auto")} className="h-16">
                <Zap className="w-5 h-5 mr-2" />
                Auto Fill
              </Button>
              <Button variant="secondary" size="lg" onClick={() => handleFillIn("break")} className="h-16">
                <Music2 className="w-5 h-5 mr-2" />
                Break
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Style Status Bar */}
      <div className="mt-6 bg-secondary/30 border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-500")} />
            <span className="text-sm font-medium">{isPlaying ? "Playing" : "Stopped"}</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Variation:</span>
            <span className="ml-2 font-bold text-primary">{activeVariation}</span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Sync Start:</span>
            <span className="ml-2 font-bold">{syncStart ? "ON" : "OFF"}</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Style Channel: {STYLE_CHANNEL}</div>
      </div>
    </div>
  )
}
