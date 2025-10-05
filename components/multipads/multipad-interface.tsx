"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useMIDI } from "@/lib/midi-context"
import { Square, Play, Grid3x3, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

interface MultiPad {
  id: number
  name: string
  isPlaying: boolean
  note: number
}

const MULTIPAD_BANKS = [
  {
    id: 1,
    name: "Percussion",
    pads: [
      { id: 1, name: "Tambourine", note: 54 },
      { id: 2, name: "Shaker", note: 55 },
      { id: 3, name: "Cowbell", note: 56 },
      { id: 4, name: "Claps", note: 57 },
    ],
  },
  {
    id: 2,
    name: "DJ Effects",
    pads: [
      { id: 1, name: "Scratch 1", note: 58 },
      { id: 2, name: "Scratch 2", note: 59 },
      { id: 3, name: "Air Horn", note: 60 },
      { id: 4, name: "Siren", note: 61 },
    ],
  },
  {
    id: 3,
    name: "Orchestral",
    pads: [
      { id: 1, name: "Timpani Roll", note: 62 },
      { id: 2, name: "Cymbal Crash", note: 63 },
      { id: 3, name: "Gong", note: 64 },
      { id: 4, name: "Strings Swell", note: 65 },
    ],
  },
  {
    id: 4,
    name: "Vocal",
    pads: [
      { id: 1, name: "Choir Ah", note: 66 },
      { id: 2, name: "Choir Oh", note: 67 },
      { id: 3, name: "Doo Wop", note: 68 },
      { id: 4, name: "Jazz Scat", note: 69 },
    ],
  },
]

// MIDI channels for multi-pads (typically 5-8)
const MULTIPAD_CHANNELS = [5, 6, 7, 8]

export function MultiPadInterface() {
  const { sendNoteOn, sendNoteOff, sendControlChange } = useMIDI()
  const [selectedBank, setSelectedBank] = useState(0)
  const [playingPads, setPlayingPads] = useState<Set<number>>(new Set())
  const [padVolumes, setPadVolumes] = useState<Record<number, number>>({
    1: 100,
    2: 100,
    3: 100,
    4: 100,
  })
  const [stopAll, setStopAll] = useState(false)

  const currentBank = MULTIPAD_BANKS[selectedBank]

  const handlePadPress = (padId: number, note: number) => {
    const channel = MULTIPAD_CHANNELS[padId - 1]
    const velocity = Math.floor((padVolumes[padId] / 100) * 127)

    if (playingPads.has(padId)) {
      // Stop the pad
      sendNoteOff(channel, note)
      setPlayingPads((prev) => {
        const newSet = new Set(prev)
        newSet.delete(padId)
        return newSet
      })
    } else {
      // Start the pad
      sendNoteOn(channel, note, velocity)
      setPlayingPads((prev) => new Set(prev).add(padId))
    }
  }

  const handleStopAll = () => {
    // Send note off for all pads
    playingPads.forEach((padId) => {
      const channel = MULTIPAD_CHANNELS[padId - 1]
      const pad = currentBank.pads.find((p) => p.id === padId)
      if (pad) {
        sendNoteOff(channel, pad.note)
      }
    })
    setPlayingPads(new Set())
    setStopAll(true)
    setTimeout(() => setStopAll(false), 200)
  }

  const handleVolumeChange = (padId: number, value: number[]) => {
    const newVolume = value[0]
    setPadVolumes((prev) => ({ ...prev, [padId]: newVolume }))
    // Send volume CC to the pad's channel
    const channel = MULTIPAD_CHANNELS[padId - 1]
    sendControlChange(channel, 7, Math.floor((newVolume / 100) * 127))
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-balance mb-2">Multi Pads</h2>
          <p className="text-muted-foreground">Trigger percussion, effects, and phrase samples</p>
        </div>
        <Button
          size="lg"
          variant="destructive"
          onClick={handleStopAll}
          disabled={playingPads.size === 0}
          className={cn("px-8 h-12 font-bold shadow-lg", stopAll && "scale-95")}
        >
          <Square className="w-5 h-5 mr-2" />
          Stop All
        </Button>
      </div>

      {/* Bank Selection */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {MULTIPAD_BANKS.map((bank, index) => (
          <Button
            key={bank.id}
            size="lg"
            variant={selectedBank === index ? "default" : "outline"}
            onClick={() => {
              setSelectedBank(index)
              handleStopAll() // Stop all pads when switching banks
            }}
            className={cn(
              "h-16 text-base font-bold transition-all",
              selectedBank === index && "shadow-lg shadow-primary/30",
            )}
          >
            <Grid3x3 className="w-5 h-5 mr-2" />
            Bank {bank.id}: {bank.name}
          </Button>
        ))}
      </div>

      {/* Multi-Pad Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentBank.pads.map((pad) => {
          const isPlaying = playingPads.has(pad.id)
          const volume = padVolumes[pad.id]

          return (
            <div key={pad.id} className="bg-card border-2 border-border rounded-lg p-6 flex flex-col gap-4">
              {/* Pad Button */}
              <button
                onClick={() => handlePadPress(pad.id, pad.note)}
                className={cn(
                  "relative h-40 rounded-xl font-bold text-2xl transition-all duration-200 shadow-lg",
                  "active:scale-95",
                  isPlaying
                    ? "bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-accent/40 animate-pulse"
                    : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground hover:shadow-primary/40 hover:scale-[1.02]",
                )}
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  {isPlaying ? <Square className="w-12 h-12" /> : <Play className="w-12 h-12" />}
                  <span className="text-balance">{pad.name}</span>
                  <span className="text-sm opacity-70">Pad {pad.id}</span>
                </div>
                {isPlaying && (
                  <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse pointer-events-none" />
                )}
              </button>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Volume</label>
                  </div>
                  <span className="text-sm font-mono font-bold text-primary">{volume}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => handleVolumeChange(pad.id, value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Bar */}
      <div className="mt-6 bg-secondary/30 border border-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                playingPads.size > 0 ? "bg-green-500 animate-pulse" : "bg-gray-500",
              )}
            />
            <span className="text-sm font-medium">
              {playingPads.size > 0 ? `${playingPads.size} pad(s) playing` : "No pads playing"}
            </span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Bank:</span>
            <span className="ml-2 font-bold text-primary">{currentBank.name}</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Channels: {MULTIPAD_CHANNELS.join(", ")}</div>
      </div>
    </div>
  )
}
