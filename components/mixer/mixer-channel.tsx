"use client"

import { useState } from "react"
import { useMIDI } from "@/lib/midi-context"
import { RotaryKnob } from "@/components/ui/rotary-knob"
import { VoiceIcon } from "@/components/ui/voice-icon"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Settings } from "lucide-react"

interface MixerChannelProps {
  channel: number
  partName: string
  voiceName: string
  onSelectVoice: () => void
  voiceSubcategory?: string
  voiceCategory?: string
}

export function MixerChannel({
  channel,
  partName,
  voiceName,
  onSelectVoice,
  voiceSubcategory = "",
  voiceCategory = "",
}: MixerChannelProps) {
  const { api } = useMIDI()
  const [showDetails, setShowDetails] = useState(false)

  const [volume, setVolume] = useState(100)
  const [pan, setPan] = useState(64)
  const [reverb, setReverb] = useState(40)
  const [chorus, setChorus] = useState(30)
  const [brightness, setBrightness] = useState(64)
  const [bass, setBass] = useState(64)
  const [mid, setMid] = useState(64)
  const [high, setHigh] = useState(64)

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    api.sendCommand({
      type: "mixer",
      action: "volume",
      channel,
      value,
    })
  }

  const handlePanChange = (value: number) => {
    setPan(value)
    api.sendCommand({
      type: "mixer",
      action: "pan",
      channel,
      value,
    })
  }

  const handleReverbChange = (value: number) => {
    setReverb(value)
    api.sendCommand({
      type: "mixer",
      action: "reverb",
      channel,
      value,
    })
  }

  const handleChorusChange = (value: number) => {
    setChorus(value)
    api.sendCommand({
      type: "mixer",
      action: "chorus",
      channel,
      value,
    })
  }

  const handleBrightnessChange = (value: number) => {
    setBrightness(value)
    api.sendCommand({
      type: "mixer",
      action: "brightness",
      channel,
      value,
    })
  }

  const handleBassChange = (value: number) => {
    setBass(value)
    console.log(`[v0] EQ Bass CH${channel}:`, value)
  }

  const handleMidChange = (value: number) => {
    setMid(value)
    console.log(`[v0] EQ Mid CH${channel}:`, value)
  }

  const handleHighChange = (value: number) => {
    setHigh(value)
    console.log(`[v0] EQ High CH${channel}:`, value)
  }

  return (
    <>
      <div className="premium-card p-3 flex flex-col gap-3 w-[120px]">
        {/* Header */}
        <div className="text-center">
          <div className="premium-label text-xs">CH {channel}</div>
          <div className="premium-text text-xs truncate">{partName}</div>
        </div>

        {/* Voice Display */}
        <button
          onClick={onSelectVoice}
          className="w-full bg-secondary hover:bg-secondary/80 border-2 border-primary/40 hover:border-primary/60 transition-all px-2 py-2 rounded flex flex-col items-center gap-1 font-bold text-xs"
        >
          <VoiceIcon subcategory={voiceSubcategory} category={voiceCategory} size={16} />
          <span className="truncate w-full text-[10px] text-white">{voiceName}</span>
        </button>

        {/* Volume Slider - Vertical */}
        <div className="flex flex-col items-center gap-2 py-3 bg-secondary/50 rounded border border-border">
          <div className="premium-label text-xs">VOL</div>
          <input
            type="range"
            min="0"
            max="127"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="h-32"
            style={{
              WebkitAppearance: "slider-vertical",
              width: "8px",
              background: "oklch(0.14 0 0)",
              borderRadius: "0.5rem",
              border: "2px solid oklch(0.22 0 0)",
              cursor: "pointer",
            }}
          />
          <div className="premium-text text-xs">{volume}</div>
        </div>

        <Button onClick={() => setShowDetails(true)} className="w-full h-9 gap-2 text-xs" size="sm">
          <Settings className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl bg-black/95 border-primary/30">
          <DialogHeader>
            <DialogTitle className="premium-text text-xl">
              Channel {channel} - {partName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <h3 className="premium-label text-sm">Voice</h3>
              <button
                onClick={onSelectVoice}
                className="w-full bg-secondary hover:bg-secondary/80 border-2 border-primary/40 hover:border-primary/60 transition-all px-4 py-3 rounded flex items-center gap-3 font-bold"
              >
                <VoiceIcon subcategory={voiceSubcategory} category={voiceCategory} size={24} />
                <span className="text-base text-white">{voiceName}</span>
              </button>
            </div>

            {/* Main Controls */}
            <div className="space-y-2">
              <h3 className="premium-label text-sm">Main Controls</h3>
              <div className="grid grid-cols-4 gap-4">
                <RotaryKnob value={pan} onChange={handlePanChange} label="Pan" displayValue={`${pan}`} size="md" />
                <RotaryKnob
                  value={reverb}
                  onChange={handleReverbChange}
                  label="Reverb"
                  displayValue={`${reverb}`}
                  size="md"
                />
                <RotaryKnob
                  value={chorus}
                  onChange={handleChorusChange}
                  label="Chorus"
                  displayValue={`${chorus}`}
                  size="md"
                />
                <RotaryKnob
                  value={brightness}
                  onChange={handleBrightnessChange}
                  label="Brightness"
                  displayValue={`${brightness}`}
                  size="md"
                />
              </div>
            </div>

            {/* EQ Controls */}
            <div className="space-y-2">
              <h3 className="premium-label text-sm">Equalizer</h3>
              <div className="grid grid-cols-3 gap-4">
                <RotaryKnob value={bass} onChange={handleBassChange} label="Bass" displayValue={`${bass}`} size="md" />
                <RotaryKnob value={mid} onChange={handleMidChange} label="Mid" displayValue={`${mid}`} size="md" />
                <RotaryKnob value={high} onChange={handleHighChange} label="High" displayValue={`${high}`} size="md" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
