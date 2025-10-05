"use client"

import { useState } from "react"
import { useMIDI } from "@/lib/midi-context"
import { Button } from "@/components/ui/button"
import { Music, Volume2, Disc } from "lucide-react"
import { cn } from "@/lib/utils"

interface PerformancePartTileProps {
  partNumber: number
  channel: number
  onSelectVoice: () => void
}

export function PerformancePartTile({ partNumber, channel, onSelectVoice }: PerformancePartTileProps) {
  const { sendControlChange } = useMIDI()
  const [volume, setVolume] = useState(100)
  const [pan, setPan] = useState(64)
  const [isEnabled, setIsEnabled] = useState(true)
  const [voiceName, setVoiceName] = useState("Grand Piano")

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    sendControlChange(channel, 7, value)
  }

  const handlePanChange = (value: number) => {
    setPan(value)
    sendControlChange(channel, 10, value)
  }

  const togglePart = () => {
    const newState = !isEnabled
    setIsEnabled(newState)
    sendControlChange(channel, 7, newState ? volume : 0)
  }

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-6 transition-all",
        isEnabled ? "opacity-100" : "opacity-60",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Part {partNumber}</h3>
            <p className="text-xs text-muted-foreground">Channel {channel}</p>
          </div>
        </div>
        <Button size="sm" variant={isEnabled ? "default" : "outline"} onClick={togglePart} className="min-w-[80px]">
          {isEnabled ? "ON" : "OFF"}
        </Button>
      </div>

      <div className="space-y-4">
        <Button variant="secondary" className="w-full justify-start gap-2 h-auto py-3" onClick={onSelectVoice}>
          <Disc className="w-4 h-4" />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">{voiceName}</div>
            <div className="text-xs text-muted-foreground">Tap to change voice</div>
          </div>
        </Button>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Volume
              </label>
              <span className="text-sm text-muted-foreground">{volume}</span>
            </div>
            <input
              type="range"
              min="0"
              max="127"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
              disabled={!isEnabled}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Pan</label>
              <span className="text-sm text-muted-foreground">
                {pan === 64 ? "C" : pan < 64 ? `L${64 - pan}` : `R${pan - 64}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="127"
              value={pan}
              onChange={(e) => handlePanChange(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
              disabled={!isEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
