"use client"

import type React from "react"

import { useState, useRef } from "react"
import { MixerChannel } from "./mixer-channel"
import { MixerChannelHorizontal } from "./mixer-channel-horizontal"
import { Download, Upload } from "lucide-react"
import type { Voice } from "@/lib/voice-data"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMIDI } from "@/lib/midi-context"
import { useLayout } from "@/lib/layout-context"

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
  viewMode: externalViewMode,
  onVoiceAssignedInline,
}: MixerInterfaceProps) {
  const { mixerViewMode, setMixerViewMode } = useLayout()
  const viewMode = externalViewMode || mixerViewMode

  const [internalCurrentBank, setInternalCurrentBank] = useState(0)
  const currentBank = externalCurrentBank !== undefined ? externalCurrentBank : internalCurrentBank

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
    <div className="h-full flex flex-col p-4 bg-transparent">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 premium-card px-4 py-3 rounded-lg">
          <Label htmlFor="mixer-view-toggle" className="text-sm font-semibold text-white cursor-pointer">
            Vertical (8)
          </Label>
          <Switch
            id="mixer-view-toggle"
            checked={viewMode === "horizontal"}
            onCheckedChange={(checked) => setMixerViewMode(checked ? "horizontal" : "vertical")}
            className="data-[state=checked]:bg-primary"
          />
          <Label htmlFor="mixer-view-toggle" className="text-sm font-semibold text-white cursor-pointer">
            Horizontal (16)
          </Label>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleOpenMix}
            className="h-10 px-6 gap-2 text-sm font-bold bg-gradient-to-r from-[#f59e0b] to-[#fb923c] hover:from-[#ea8a00] hover:to-[#f97316] text-white border-none"
          >
            <Upload className="w-4 h-4" />
            Open Mix
          </Button>
          <Button
            onClick={handleSaveMix}
            className="h-10 px-6 gap-2 text-sm font-bold bg-gradient-to-r from-[#f59e0b] to-[#fb923c] hover:from-[#ea8a00] hover:to-[#f97316] text-white border-none"
          >
            <Download className="w-4 h-4" />
            Save Mix
          </Button>
        </div>
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
                  currentVoice={partVoices[ch.channel]}
                  voiceSubcategory={partVoices[ch.channel]?.sub || ""}
                  voiceCategory={partVoices[ch.channel]?.category || ""}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto bg-transparent">
            <div className="min-w-max">
              <div className="grid grid-cols-[40px_200px_80px_60px_60px_60px_60px_60px_60px_60px_60px] gap-3 items-center py-3 px-2 bg-transparent backdrop-blur-sm border-b-2 border-[#f59e0b] sticky top-0 z-10">
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">CH</div>
                <div className="text-[#f59e0b] font-bold text-[10px]">Voice</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Vol</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Pan</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Rev</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Cho</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Bright</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Bass</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Mid</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">High</div>
                <div className="text-[#f59e0b] font-bold text-[10px] text-center">Part</div>
              </div>

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
