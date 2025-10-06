"use client"

import { useState } from "react"
import { useMIDI } from "@/lib/midi-context"
import { Music, Sliders } from "lucide-react"
import { RotaryKnob } from "@/components/ui/rotary-knob"

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

  const handleBassChange = (value: number) => {
    setBassEQ(value)
    sendControlChange(channel, 70, value) // CC 70 for bass EQ
  }

  const handleMidChange = (value: number) => {
    setMidEQ(value)
    sendControlChange(channel, 71, value) // CC 71 for mid EQ
  }

  const handleHighChange = (value: number) => {
    setHighEQ(value)
    sendControlChange(channel, 72, value) // CC 72 for high EQ
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
        <RotaryKnob
          value={bassEQ}
          onChange={handleBassChange}
          label="Bass"
          displayValue={`${bassEQ - 64 > 0 ? "+" : ""}${bassEQ - 64}`}
          size="md"
        />

        <RotaryKnob
          value={midEQ}
          onChange={handleMidChange}
          label="Mid"
          displayValue={`${midEQ - 64 > 0 ? "+" : ""}${midEQ - 64}`}
          size="md"
        />

        <RotaryKnob
          value={highEQ}
          onChange={handleHighChange}
          label="High"
          displayValue={`${highEQ - 64 > 0 ? "+" : ""}${highEQ - 64}`}
          size="md"
        />

        <RotaryKnob value={reverb} onChange={handleReverbChange} label="Reverb" displayValue={`${reverb}`} size="md" />

        <RotaryKnob value={chorus} onChange={handleChorusChange} label="Chorus" displayValue={`${chorus}`} size="md" />

        <RotaryKnob
          value={brightness}
          onChange={handleBrightnessChange}
          label="Bright"
          displayValue={`${brightness}`}
          size="md"
        />
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
