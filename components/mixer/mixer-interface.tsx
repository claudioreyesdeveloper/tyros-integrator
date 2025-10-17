"use client"

import type React from "react"

import { useState, useRef } from "react"
import { MixerChannel } from "./mixer-channel"
import { Volume2, Waves, Sparkles, Download, Upload } from "lucide-react"
import type { Voice } from "@/lib/voice-data"
import { Button } from "@/components/ui/button"
import { useMIDI } from "@/lib/midi-context"

const PART_NAMES = [
  "Left",
  "Right 1",
  "Right 2",
  "Right 3",
  "Multi Pad 1",
  "Multi Pad 2",
  "Multi Pad 3",
  "Multi Pad 4",
  "Rhythm 1",
  "Rhythm 2",
  "Bass",
  "Chord 1",
  "Chord 2",
  "Pad",
  "Phrase 1",
  "Phrase 2",
  "Song 1",
  "Song 2",
  "Song 3",
  "Song 4",
  "Song 5",
  "Song 6",
  "Song 7",
  "Song 8",
  "Song 9",
  "Song 10",
  "Song 11",
  "Song 12",
  "Song 13",
  "Song 14",
  "Song 15",
  "Song 16",
]

const BANK_NAMES = ["Keyboard/Multi Pads", "Style Parts", "Song Tracks 1", "Song Tracks 2"]

interface MixerInterfaceProps {
  onSelectVoice: (partNumber: number) => void
  partVoices: Record<number, Voice>
  channelEffects: Record<number, string>
  onEffectAssigned: (channel: number, effectName: string) => void
  currentBank?: number
  onBankChange?: (bank: number) => void
}

export function MixerInterface({
  onSelectVoice,
  partVoices,
  channelEffects,
  onEffectAssigned,
  currentBank: externalCurrentBank,
  onBankChange,
}: MixerInterfaceProps) {
  const [internalCurrentBank, setInternalCurrentBank] = useState(0)
  const currentBank = externalCurrentBank !== undefined ? externalCurrentBank : internalCurrentBank

  const [effectsChannel, setEffectsChannel] = useState<number | null>(null)
  const [masterVolume, setMasterVolume] = useState(100)
  const [globalReverb, setGlobalReverb] = useState(40)
  const [globalChorus, setGlobalChorus] = useState(30)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { api } = useMIDI()

  const startChannel = currentBank * 8 + 1
  const channels = Array.from({ length: 8 }, (_, i) => ({
    channel: startChannel + i,
    partName: PART_NAMES[startChannel + i - 1],
  }))

  const handleMasterVolumeChange = (value: number) => {
    setMasterVolume(value)
    api.sendCommand({
      type: "mixer",
      action: "master-volume",
      value,
    })
  }

  const handleGlobalReverbChange = (value: number) => {
    setGlobalReverb(value)
    api.sendCommand({
      type: "mixer",
      action: "global-reverb",
      value,
    })
  }

  const handleGlobalChorusChange = (value: number) => {
    setGlobalChorus(value)
    api.sendCommand({
      type: "mixer",
      action: "global-chorus",
      value,
    })
  }

  const handleBankChange = (bank: number) => {
    if (onBankChange) {
      onBankChange(bank)
    } else {
      setInternalCurrentBank(bank)
    }
  }

  const handleSaveMix = () => {
    const mixConfiguration = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      globalSettings: {
        masterVolume,
        globalReverb,
        globalChorus,
      },
      channels: Object.entries(partVoices).map(([channel, voice]) => ({
        channel: Number(channel),
        partName: PART_NAMES[Number(channel) - 1],
        voice: voice,
        effect: channelEffects[Number(channel)] || "None",
      })),
    }

    const blob = new Blob([JSON.stringify(mixConfiguration, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tyros5-mix-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenMix = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const config = JSON.parse(content)

        console.log("[v0] Loaded mix configuration:", config)

        if (config.globalSettings) {
          setMasterVolume(config.globalSettings.masterVolume || 100)
          setGlobalReverb(config.globalSettings.globalReverb || 40)
          setGlobalChorus(config.globalSettings.globalChorus || 30)
        }

        alert("Mix configuration loaded successfully!")
      } catch (error) {
        console.error("[v0] Error parsing mix file:", error)
        alert("Error loading mix file. Please check the file format.")
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  return (
    <div className="h-full flex flex-col p-3 md:p-4 bg-gradient-to-b from-background via-black/95 to-black">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <div className="mb-3 flex flex-col sm:flex-row justify-end gap-2">
        <Button onClick={handleOpenMix} className="glossy-button h-9 px-4 gap-2 text-xs" size="sm">
          <Upload className="w-3.5 h-3.5" />
          Open Mix
        </Button>
        <Button onClick={handleSaveMix} className="glossy-button h-9 px-4 gap-2 text-xs" size="sm">
          <Download className="w-3.5 h-3.5" />
          Save Mix
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="glossy-panel p-2.5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-primary" />
            <h3 className="premium-label text-[10px]">Master Volume</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="127"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
              className="flex-1 slider-horizontal"
            />
            <span className="text-sm font-mono font-bold text-primary w-10 text-right">{masterVolume}</span>
          </div>
        </div>

        <div className="glossy-panel p-2.5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-primary" />
            <h3 className="premium-label text-[10px]">Global Reverb</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="127"
              value={globalReverb}
              onChange={(e) => handleGlobalReverbChange(Number(e.target.value))}
              className="flex-1 slider-horizontal"
            />
            <span className="text-sm font-mono font-bold text-primary w-10 text-right">{globalReverb}</span>
          </div>
        </div>

        <div className="glossy-panel p-2.5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="premium-label text-[10px]">Global Chorus</h3>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="127"
              value={globalChorus}
              onChange={(e) => handleGlobalChorusChange(Number(e.target.value))}
              className="flex-1 slider-horizontal"
            />
            <span className="text-sm font-mono font-bold text-primary w-10 text-right">{globalChorus}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3">
        {BANK_NAMES.map((name, index) => (
          <button
            key={index}
            onClick={() => handleBankChange(index)}
            className={`flex-1 px-2 py-2 rounded font-bold text-[10px] transition-all shadow-md hover:shadow-lg ${
              currentBank === index
                ? "glossy-button text-black"
                : "bg-secondary text-foreground border border-border/40 hover:border-primary/50"
            }`}
          >
            <div className="premium-text text-[11px]">{name}</div>
            <div className="text-[9px] opacity-80 mt-0.5">
              (Ch {index * 8 + 1}-{index * 8 + 8})
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 glossy-panel p-4 shadow-xl overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="flex justify-center gap-3 h-full pb-2 min-w-max">
            {channels.map((ch) => (
              <MixerChannel
                key={ch.channel}
                channel={ch.channel}
                partName={ch.partName}
                voiceName={partVoices[ch.channel]?.voice || "No Voice"}
                onSelectVoice={() => onSelectVoice(ch.channel)}
                voiceSubcategory={partVoices[ch.channel]?.sub || ""}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
