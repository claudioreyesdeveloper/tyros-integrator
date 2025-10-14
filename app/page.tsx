"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/tab-navigation"
import { MIDIStatus } from "@/components/midi-status"
import { HomeScreen } from "@/components/home/home-screen"
import { VoiceBrowser } from "@/components/voices/voice-browser"
import { MixerInterface } from "@/components/mixer/mixer-interface"
import { RegistrationManager } from "@/components/registration/registration-manager"
import { MidiLogger } from "@/components/logging/midi-logger"
import { AssemblyWorkbench } from "@/components/assembly/assembly-workbench"
import { ChordSequencer } from "@/components/chords/chord-sequencer"
import type { Voice } from "@/lib/voice-data"

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

  const handleSelectVoice = (partNumber: number) => {
    setCurrentPart(partNumber)
    setPreviousTab(activeTab)
    setActiveTab("voices")
  }

  const handleVoiceAssigned = (voice: Voice) => {
    if (currentPart !== null) {
      setPartVoices((prev) => ({ ...prev, [currentPart]: voice }))
    }
    setActiveTab(previousTab)
  }

  const handleCancelVoiceSelection = () => {
    setActiveTab(previousTab)
  }

  const handleEffectAssigned = (channel: number, effectName: string) => {
    setChannelEffects((prev) => ({ ...prev, [channel]: effectName }))
  }

  const handleLoadConfiguration = (config: any) => {
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

      config.ChannelParts.forEach((channel: any) => {
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

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0068-KWOtxG3niqNY0qYM5S7YiwzptMfF9k.png)",
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-primary/30">
          <div className="px-4 md:px-6 lg:px-8 py-2 md:py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg">SmartBridge</h1>
              <p className="text-xs md:text-sm text-gray-300 drop-shadow-md">Professional MIDI Controller</p>
            </div>
            <MIDIStatus />
          </div>
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

          {activeTab === "chords" && <ChordSequencer />}

          {activeTab === "logging" && <MidiLogger />}
        </main>
      </div>
    </div>
  )
}
