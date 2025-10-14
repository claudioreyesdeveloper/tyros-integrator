"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/tab-navigation"
import { HomeScreen } from "@/components/home/home-screen"
import { VoiceBrowser } from "@/components/voices/voice-browser"
import { MixerInterface } from "@/components/mixer/mixer-interface"
import { RegistrationManager } from "@/components/registration/registration-manager"
import { MidiLogger } from "@/components/logging/midi-logger"
import { AssemblyWorkbench } from "@/components/assembly/assembly-workbench"
import { ChordSequencer } from "@/components/chords/chord-sequencer"
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
// &lt;/CHANGE&gt;

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
  parameters: Record&lt;string, number&gt;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")
  const [currentPart, setCurrentPart] = useState&lt;number | null&gt;(null)
  const [previousTab, setPreviousTab] = useState&lt;string&gt;("home")
  const [mixerBank, setMixerBank] = useState(0)
  const [partVoices, setPartVoices] = useState&lt;Record&lt;number, Voice&gt;&gt;({})
  const [channelEffects, setChannelEffects] = useState&lt;Record&lt;number, string&gt;&gt;({})

  const [channelMixer, setChannelMixer] = useState&lt;Record&lt;number, MixerSettings&gt;&gt;({})
  const [channelDSP, setChannelDSP] = useState&lt;Record&lt;number, DSPSettings&gt;&gt;({})

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

  const [chordState, setChordState] = useState&lt;ChordState&gt;({
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
  // &lt;/CHANGE&gt;

  const handleSelectVoice = (partNumber: number) =&gt; {
    setCurrentPart(partNumber)
    setPreviousTab(activeTab)
    setActiveTab("voices")
  }

  const handleVoiceAssigned = (voice: Voice) =&gt; {
    if (currentPart !== null) {
      setPartVoices((prev) =&gt; ({ ...prev, [currentPart]: voice }))
    }
    setActiveTab(previousTab)
  }

  const handleCancelVoiceSelection = () =&gt; {
    setActiveTab(previousTab)
  }

  const handleEffectAssigned = (channel: number, effectName: string) =&gt; {
    setChannelEffects((prev) =&gt; ({ ...prev, [channel]: effectName }))
  }

  const handleLoadConfiguration = (config: Tyros5Configuration) =&gt; {
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
      const newPartVoices: Record&lt;number, Voice&gt; = {}
      const newChannelMixer: Record&lt;number, MixerSettings&gt; = {}
      const newChannelDSP: Record&lt;number, DSPSettings&gt; = {}

      config.ChannelParts.forEach((channel: ChannelPartConfig) =&gt; {
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
    &lt;div className="min-h-screen flex flex-col relative"&gt;
      &lt;div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_0068-KWOtxG3niqNY0qYM5S7YiwzptMfF9k.png)",
        }}
      /&gt;
      &lt;div className="absolute inset-0 bg-black/60" /&gt;
      &lt;div className="relative z-10 flex flex-col min-h-screen"&gt;
        &lt;header className="border-b border-primary/30"&gt;
          &lt;div className="px-4 md:px-6 lg:px-8 py-2 md:py-3 flex items-center justify-between"&gt;
            &lt;div&gt;
              &lt;h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg"&gt;SmartBridge&lt;/h1&gt;
              &lt;p className="text-xs md:text-sm text-gray-300 drop-shadow-md"&gt;Professional MIDI Controller&lt;/p&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          &lt;TabNavigation activeTab={activeTab} onTabChange={setActiveTab} /&gt;
        &lt;/header&gt;

        &lt;main className="flex-1 overflow-auto"&gt;
          {activeTab === "home" && &lt;HomeScreen onSelectVoice={handleSelectVoice} partVoices={partVoices} /&gt;}

          {activeTab === "voices" && (
            &lt;VoiceBrowser
              currentPart={currentPart}
              onVoiceAssigned={handleVoiceAssigned}
              onCancel={handleCancelVoiceSelection}
            /&gt;
          )}

          {activeTab === "mixer" && (
            &lt;MixerInterface
              onSelectVoice={handleSelectVoice}
              partVoices={partVoices}
              channelEffects={channelEffects}
              onEffectAssigned={handleEffectAssigned}
              currentBank={mixerBank}
              onBankChange={setMixerBank}
            /&gt;
          )}

          {activeTab === "registration" && (
            &lt;RegistrationManager
              partVoices={partVoices}
              channelMixer={channelMixer}
              channelDSP={channelDSP}
              channelEffects={channelEffects}
              globalSettings={globalSettings}
              globalEffects={globalEffects}
              onLoadConfiguration={handleLoadConfiguration}
            /&gt;
          )}

          {activeTab === "assembly" && &lt;AssemblyWorkbench /&gt;}

          {activeTab === "chords" && &lt;ChordSequencer chordState={chordState} setChordState={setChordState} /&gt;}

          {activeTab === "logging" && &lt;MidiLogger /&gt;}
        &lt;/main&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  )
}
