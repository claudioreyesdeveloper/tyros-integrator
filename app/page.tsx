"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/tab-navigation"
import { HomeScreen } from "@/components/home/home-screen"
import { VoiceBrowser } from "@/components/voices/voice-browser"
import { MixerInterface } from "@/components/mixer/mixer-interface"
import { RegistrationManager } from "@/components/registration/registration-manager"
import { ConfigPanel } from "@/components/config/config-panel"
import { AssemblyWorkbench } from "@/components/assembly/assembly-workbench"
import { ChordSequencer } from "@/components/chords/chord-sequencer"
import { useLayout } from "@/lib/layout-context" // Import useLayout
import type { Voice } from "@/lib/voice-data"
import type { Tyros5Configuration, ChannelPartConfig } from "@/lib/types"

type Resolution = "whole" | "half" | "quarter"

interface Chord {
  id: string
  symbol: string
  beat: number
  duration: number
}

interface Section {
  id: string
  name: string
  bars: number
  stylePart: string
  color: string
  chords: Chord[]
}

interface ChordState {
  sections: Section[]
  activeSection: string
  resolution: Resolution
  selectedCategory: string
  selectedStyle: string
  tempo: number
  localControl: boolean
  clockSource: "internal" | "external"
  accompaniment: boolean
}

export interface MixerSettings {
  volume: number
  pan: number
  eq: {
    bass: number
    mid: number
    high: number
  }
}

export interface DSPSettings {
  status: "ON" | "OFF"
  unitID_Hex: string
  effectType: {
    name: string
    msb_Dec: number
    lsb_Dec: number
  }
  parameters: Record<string, number>
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")
  const [currentPart, setCurrentPart] = useState<number | null>(null)
  const [previousTab, setPreviousTab] = useState<string>("home")
  const [mixerBank, setMixerBank] = useState(0)
  const [partVoices, setPartVoices] = useState<Record<number, Voice>>({})
  const [channelEffects, setChannelEffects] = useState<Record<number, string>>({})
  const { mixerViewMode } = useLayout() // Get mixer view mode from context

  const [channelMixer, setChannelMixer] = useState<Record<number, MixerSettings>>({})
  const [channelDSP, setChannelDSP] = useState<Record<number, DSPSettings>>({})

  const [globalSettings, setGlobalSettings] = useState({
    masterTranspose: 0,
    tempoLock: false,
    autoPowerOffOverride: true,
  })

  const [globalEffects, setGlobalEffects] = useState({
    masterVolume: 100,
    reverbSendGlobal: 45,
    chorusSendGlobal: 30,
  })

  const [chordState, setChordState] = useState<ChordState>({
    sections: [
      {
        id: "section-1",
        name: "Intro",
        bars: 4,
        stylePart: "Intro 1",
        color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        chords: [] as Chord[], // Explicitly typed as Chord[]
      },
    ],
    activeSection: "section-1",
    resolution: "quarter",
    selectedCategory: "Pop/Rock",
    selectedStyle: "8BeatModern",
    tempo: 120,
    localControl: true,
    clockSource: "internal",
    accompaniment: true,
  })

  const handleSelectVoice = (partNumber: number) => {
    console.log("[v0] Page: handleSelectVoice called for part", partNumber)
    setCurrentPart(partNumber)
    setPreviousTab(activeTab)
    setActiveTab("voices")
    console.log("[v0] Page: Switched to voices tab, currentPart set to", partNumber)
  }

  const handleVoiceAssigned = (voice: Voice) => {
    console.log("[v0] Page: handleVoiceAssigned called with voice", voice, "for part", currentPart)

    if (currentPart !== null) {
      setPartVoices((prev) => {
        const updated = { ...prev, [currentPart]: voice }
        console.log("[v0] Page: Updated partVoices", updated)
        return updated
      })
    } else {
      console.log("[v0] Page: ERROR - currentPart is null!")
    }

    console.log("[v0] Page: Switching back to tab", previousTab)
    setActiveTab(previousTab)
  }

  const handleCancelVoiceSelection = () => {
    console.log("[v0] Page: Voice selection cancelled, returning to", previousTab)
    setActiveTab(previousTab)
  }

  const handleEffectAssigned = (channel: number, effectName: string) => {
    setChannelEffects((prev) => ({ ...prev, [channel]: effectName }))
  }

  const handleLoadConfiguration = (config: Tyros5Configuration) => {
    // Update global settings
    if (config.GlobalSettings) {
      setGlobalSettings({
        masterTranspose: config.GlobalSettings.MasterTranspose || 0,
        tempoLock: config.GlobalSettings.TempoLock || false,
        autoPowerOffOverride: config.GlobalSettings.AutoPowerOffOverride || true,
      })
    }

    // Update global effects
    if (config.GlobalEffects) {
      setGlobalEffects({
        masterVolume: config.GlobalEffects.MasterVolume || 100,
        reverbSendGlobal: config.GlobalEffects.ReverbSendGlobal || 45,
        chorusSendGlobal: config.GlobalEffects.ChorusSendGlobal || 30,
      })
    }

    // Update channel parts
    if (config.ChannelParts) {
      const newPartVoices: Record<number, Voice> = {}
      const newChannelMixer: Record<number, MixerSettings> = {}
      const newChannelDSP: Record<number, DSPSettings> = {}

      config.ChannelParts.forEach((channel: ChannelPartConfig) => {
        const channelID = channel.ChannelID

        // Load voice if present
        if (channel.Voice) {
          newPartVoices[channelID] = {
            category: "",
            sub: "",
            voice: channel.Voice.Name,
            msb: channel.Voice.MSB.toString(),
            lsb: channel.Voice.LSB.toString(),
            prg: channel.Voice.PRG.toString(),
          }
        }

        // Load mixer settings
        if (channel.Mixer) {
          newChannelMixer[channelID] = {
            volume: channel.Mixer.Volume,
            pan: channel.Mixer.Pan,
            eq: {
              bass: channel.Mixer.EQ.Bass,
              mid: channel.Mixer.EQ.Mid,
              high: channel.Mixer.EQ.High,
            },
          }
        }

        // Load DSP settings
        if (channel.DSP) {
          newChannelDSP[channelID] = channel.DSP
        }
      })

      setPartVoices(newPartVoices)
      setChannelMixer(newChannelMixer)
      setChannelDSP(newChannelDSP)
    }
  }

  const handleVoiceAssignedInline = (channel: number, voice: Voice) => {
    console.log("[v0] Page: handleVoiceAssignedInline called for channel", channel, "with voice", voice)
    setPartVoices((prev) => {
      const updated = { ...prev, [channel]: voice }
      console.log("[v0] Page: Updated partVoices inline", updated)
      return updated
    })
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-[oklch(0.14_0.01_270)] to-[oklch(0.10_0.01_270)]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0068-KWOtxG3niqNY0qYM5S7YiwzptMfF9k.png)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.14_0.01_270)]/80 to-[oklch(0.10_0.01_270)]/90 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-[oklch(0.28_0.02_270)]/50 backdrop-blur-xl">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </header>

        <main className="flex-1 overflow-auto">
          {activeTab === "home" && <HomeScreen onSelectVoice={handleSelectVoice} partVoices={partVoices} />}

          {activeTab === "voices" && (
            <VoiceBrowser
              currentPart={currentPart}
              onVoiceAssigned={handleVoiceAssigned}
              onCancel={handleCancelVoiceSelection}
            />
          )}

          {activeTab === "mixer" && (
            <MixerInterface
              onSelectVoice={handleSelectVoice}
              partVoices={partVoices}
              channelEffects={channelEffects}
              onEffectAssigned={handleEffectAssigned}
              currentBank={mixerBank}
              onBankChange={setMixerBank}
              viewMode={mixerViewMode}
              onVoiceAssignedInline={handleVoiceAssignedInline}
            />
          )}

          {activeTab === "registration" && (
            <RegistrationManager
              partVoices={partVoices}
              channelMixer={channelMixer}
              channelDSP={channelDSP}
              channelEffects={channelEffects}
              globalSettings={globalSettings}
              globalEffects={globalEffects}
              onLoadConfiguration={handleLoadConfiguration}
            />
          )}

          {activeTab === "assembly" && <AssemblyWorkbench />}

          {activeTab === "chords" && <ChordSequencer chordState={chordState} setChordState={setChordState} />}

          {activeTab === "config" && <ConfigPanel />}
        </main>
      </div>
    </div>
  )
}
