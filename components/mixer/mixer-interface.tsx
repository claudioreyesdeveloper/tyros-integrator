"use client"

import type React from "react"

import { useState, useRef } from "react"
import { MixerChannel } from "./mixer-channel"
import { MixerChannelHorizontal } from "./mixer-channel-horizontal"
import { Download, Upload } from "lucide-react"
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
  viewMode?: "vertical" | "horizontal" // Added viewMode prop
  onVoiceAssignedInline?: (channel: number, voice: Voice) => void // Added new prop for inline voice assignment
}

export function MixerInterface({
  onSelectVoice,
  partVoices,
  channelEffects,
  onEffectAssigned,
  currentBank: externalCurrentBank,
  onBankChange,
  viewMode = "vertical",
  onVoiceAssignedInline,
}: MixerInterfaceProps) {
  const [internalCurrentBank, setInternalCurrentBank] = useState(0)
  const currentBank = externalCurrentBank !== undefined ? externalCurrentBank : internalCurrentBank

  const [effectsChannel, setEffectsChannel] = useState<number | null>(null)
  const [masterVolume, setMasterVolume] = useState(100)
  const [globalReverb, setGlobalReverb] = useState(40)
  const [globalChorus, setGlobalChorus] = useState(30)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { api } = useMIDI()

  const channelsPerView = viewMode === "horizontal" ? 16 : 8
  const startChannel = currentBank * channelsPerView + 1
  const channels = Array.from({ length: channelsPerView }, (_, i) => ({
    channel: startChannel + i,
    partName: PART_NAMES[startChannel + i - 1],
  }))

  const bankNames = viewMode === "horizontal" ? ["Channels 1-16", "Channels 17-32"] : BANK_NAMES

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
    <div className="h-full flex flex-col p-4 bg-black">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <div className="mb-4 flex flex-col sm:flex-row justify-end gap-2">
        <Button
          onClick={handleOpenMix}
          className="h-10 px-6 gap-2 text-sm font-bold bg-[#007AFF] hover:bg-[#0051D5] text-white border-none"
        >
          <Upload className="w-4 h-4" />
          Open Mix
        </Button>
        <Button
          onClick={handleSaveMix}
          className="h-10 px-6 gap-2 text-sm font-bold bg-[#007AFF] hover:bg-[#0051D5] text-white border-none"
        >
          <Download className="w-4 h-4" />
          Save Mix
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black border-2 border-zinc-800 rounded-lg p-4">
          <h3 className="text-[#007AFF] font-bold text-xs uppercase tracking-wider mb-3">Master Volume</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="127"
              value={masterVolume}
              onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#007AFF] 
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-[#007AFF] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <span className="text-white font-bold text-lg w-12 text-right">{masterVolume}</span>
          </div>
        </div>

        <div className="bg-black border-2 border-zinc-800 rounded-lg p-4">
          <h3 className="text-[#007AFF] font-bold text-xs uppercase tracking-wider mb-3">Global Reverb</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="127"
              value={globalReverb}
              onChange={(e) => handleGlobalReverbChange(Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#007AFF] 
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-[#007AFF] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <span className="text-white font-bold text-lg w-12 text-right">{globalReverb}</span>
          </div>
        </div>

        <div className="bg-black border-2 border-zinc-800 rounded-lg p-4">
          <h3 className="text-[#007AFF] font-bold text-xs uppercase tracking-wider mb-3">Global Chorus</h3>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="127"
              value={globalChorus}
              onChange={(e) => handleGlobalChorusChange(Number(e.target.value))}
              className="flex-1 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#007AFF] 
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-[#007AFF] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <span className="text-white font-bold text-lg w-12 text-right">{globalChorus}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {bankNames.map((name, index) => (
          <button
            key={index}
            onClick={() => handleBankChange(index)}
            className={`flex-1 px-3 py-3 rounded-lg font-bold text-xs transition-all ${
              currentBank === index ? "bg-[#007AFF] text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            <div className="text-sm">{name}</div>
            <div className="text-[10px] opacity-70 mt-1">
              (Ch {index * channelsPerView + 1}-{index * channelsPerView + channelsPerView})
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === "vertical" ? (
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
        ) : (
          <div className="h-full overflow-auto bg-black">
            <div className="min-w-max">
              <div className="grid grid-cols-[40px_200px_80px_60px_60px_60px_60px_60px_60px_60px_60px] gap-3 items-center py-3 px-2 bg-zinc-900 border-b-2 border-[#007AFF] sticky top-0 z-10">
                <div className="text-[#007AFF] font-bold text-[10px] text-center">CH</div>
                <div className="text-[#007AFF] font-bold text-[10px]">Voice</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Vol</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Pan</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Rev</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Cho</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Bright</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Bass</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Mid</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">High</div>
                <div className="text-[#007AFF] font-bold text-[10px] text-center">Part</div>
              </div>

              {/* Channel Rows */}
              {channels.map((ch) => (
                <MixerChannelHorizontal
                  key={ch.channel}
                  channel={ch.channel}
                  partName={ch.partName}
                  voiceName={partVoices[ch.channel]?.voice || "No Voice"}
                  onSelectVoice={() => onSelectVoice(ch.channel)}
                  onVoiceAssignedInline={onVoiceAssignedInline}
                  currentVoice={partVoices[ch.channel]}
                  voiceSubcategory={partVoices[ch.channel]?.sub || ""}
                  voiceCategory={partVoices[ch.channel]?.category || ""}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
