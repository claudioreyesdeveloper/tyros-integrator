"use client"

import { useState } from "react"
import { useMIDI } from "@/lib/midi-context"
import { Music, Sliders } from "lucide-react"

interface MixerChannelProps {
  channel: number
  partName: string
  voiceName: string
  insertEffect: string
  onOpenEffects: () => void
  onSelectVoice: () => void
}

export function MixerChannel({
  channel,
  partName,
  voiceName,
  insertEffect,
  onOpenEffects,
  onSelectVoice,
}: MixerChannelProps) {
  const { sendControlChange } = useMIDI()
  const [volume, setVolume] = useState(100)
  const [bassEQ, setBassEQ] = useState(64)
  const [midEQ, setMidEQ] = useState(64)
  const [highEQ, setHighEQ] = useState(64)
  const [reverb, setReverb] = useState(40)
  const [chorus, setChorus] = useState(30)
  const [brightness, setBrightness] = useState(64)

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    sendControlChange(channel, 7, value)
  }

  const handleReverbChange = (value: number) => {
    setReverb(value)
    sendControlChange(channel, 91, value)
  }

  const handleChorusChange = (value: number) => {
    setChorus(value)
    sendControlChange(channel, 93, value)
  }

  const handleBrightnessChange = (value: number) => {
    setBrightness(value)
    sendControlChange(channel, 74, value)
  }

  return (
    <div className="premium-card p-4 flex flex-col items-center gap-4 w-36 min-h-[600px]">
      <button
        onClick={onSelectVoice}
        className="w-full glossy-button px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-black font-bold text-sm"
      >
        <Music className="w-4 h-4" />
        Voice
      </button>

      {/* Track Header */}
      <div className="text-center w-full">
        <div className="text-xs text-primary font-bold">CH {channel}</div>
        <div className="premium-text text-sm mt-1">{partName}</div>
      </div>

      {/* Voice Display */}
      <div className="w-full">
        <div className="flex flex-col items-center gap-2 px-3 py-3 bg-gradient-to-b from-secondary to-secondary/80 rounded-lg border border-border/30">
          <Music className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-center line-clamp-2">{voiceName}</span>
        </div>
      </div>

      <div className="w-full space-y-2">
        <div className="premium-label text-center">Volume</div>
        <input
          type="range"
          min="0"
          max="127"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-full slider-horizontal"
        />
        <div className="text-center text-sm font-mono font-bold text-primary">{volume}</div>
      </div>

      <div className="w-full space-y-4 flex-1">
        <div className="text-center">
          <div className="premium-knob mx-auto flex items-center justify-center relative">
            <input
              type="range"
              min="0"
              max="127"
              value={bassEQ}
              onChange={(e) => setBassEQ(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-primary z-10">
              {bassEQ - 64 > 0 ? "+" : ""}
              {bassEQ - 64}
            </span>
          </div>
          <div className="premium-label mt-2">Bass</div>
        </div>

        <div className="text-center">
          <div className="premium-knob mx-auto flex items-center justify-center relative">
            <input
              type="range"
              min="0"
              max="127"
              value={midEQ}
              onChange={(e) => setMidEQ(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-primary z-10">
              {midEQ - 64 > 0 ? "+" : ""}
              {midEQ - 64}
            </span>
          </div>
          <div className="premium-label mt-2">Mid</div>
        </div>

        <div className="text-center">
          <div className="premium-knob mx-auto flex items-center justify-center relative">
            <input
              type="range"
              min="0"
              max="127"
              value={highEQ}
              onChange={(e) => setHighEQ(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-primary z-10">
              {highEQ - 64 > 0 ? "+" : ""}
              {highEQ - 64}
            </span>
          </div>
          <div className="premium-label mt-2">High</div>
        </div>

        <div className="text-center">
          <div className="premium-knob mx-auto flex items-center justify-center relative">
            <input
              type="range"
              min="0"
              max="127"
              value={reverb}
              onChange={(e) => handleReverbChange(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-primary z-10">{reverb}</span>
          </div>
          <div className="premium-label mt-2">Reverb</div>
        </div>

        <div className="text-center">
          <div className="premium-knob mx-auto flex items-center justify-center relative">
            <input
              type="range"
              min="0"
              max="127"
              value={chorus}
              onChange={(e) => handleChorusChange(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-primary z-10">{chorus}</span>
          </div>
          <div className="premium-label mt-2">Chorus</div>
        </div>

        <div className="text-center">
          <div className="premium-knob mx-auto flex items-center justify-center relative">
            <input
              type="range"
              min="0"
              max="127"
              value={brightness}
              onChange={(e) => handleBrightnessChange(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-sm font-mono font-bold text-primary z-10">{brightness}</span>
          </div>
          <div className="premium-label mt-2">Bright</div>
        </div>
      </div>

      <div className="w-full space-y-2">
        <div className="px-3 py-3 bg-gradient-to-b from-accent/20 to-accent/10 rounded-lg border border-primary/30 text-center">
          <div className="premium-label text-xs">Insert FX</div>
          <div className="text-xs font-semibold mt-1 line-clamp-2">{insertEffect}</div>
        </div>
        <button
          onClick={onOpenEffects}
          className="w-full glossy-button px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-black font-bold text-sm"
        >
          <Sliders className="w-4 h-4" />
          DSP
        </button>
      </div>
    </div>
  )
}
