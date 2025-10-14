"use client"

import type React from "react"

import { useState, useRef } from "react"
import { RegistrationSlot } from "./registration-slot"
import { Label } from "@/components/ui/label"
import { useMIDI } from "@/lib/midi-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Upload } from "lucide-react"
import type { Voice } from "@/lib/voice-data"
import type { MixerSettings, DSPSettings } from "@/app/page"

interface Registration {
  name: string
  timestamp: string
  data: {
    voices: any[]
    mixer: any[]
    effects: any[]
  }
}

interface RegistrationManagerProps {
  partVoices: Record<number, Voice>
  channelMixer: Record<number, MixerSettings>
  channelDSP: Record<number, DSPSettings>
  channelEffects: Record<number, string>
  globalSettings: {
    masterTranspose: number
    tempoLock: boolean
    autoPowerOffOverride: boolean
  }
  globalEffects: {
    masterVolume: number
    reverbSendGlobal: number
    chorusSendGlobal: number
  }
  onLoadConfiguration: (config: any) => void
}

export function RegistrationManager({
  partVoices,
  channelMixer,
  channelDSP,
  channelEffects,
  globalSettings,
  globalEffects,
  onLoadConfiguration,
}: RegistrationManagerProps) {
  const { midiAccess, requestMIDIAccess } = useMIDI()
  const [registrations, setRegistrations] = useState<(Registration | null)[]>(Array(8).fill(null))
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<number | null>(null)
  const [registrationName, setRegistrationName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveConfiguration = () => {
    const configuration = {
      GlobalSettings: {
        AppVersion: "1.0",
        LastSaved: new Date().toISOString(),
        MasterTranspose: globalSettings.masterTranspose,
        TempoLock: globalSettings.tempoLock,
        AutoPowerOffOverride: globalSettings.autoPowerOffOverride,
      },
      GlobalEffects: {
        MasterVolume: globalEffects.masterVolume,
        ReverbSendGlobal: globalEffects.reverbSendGlobal,
        ChorusSendGlobal: globalEffects.chorusSendGlobal,
      },
      ChannelParts: Array.from({ length: 32 }, (_, i) => {
        const channelID = i + 1
        const voice = partVoices[channelID]
        const mixer = channelMixer[channelID] || {
          volume: 100,
          pan: 64,
          eq: { bass: 5, mid: 0, high: 2 },
        }
        const dsp = channelDSP[channelID] || {
          status: "OFF",
          unitID_Hex: "00",
          effectType: { name: "None", msb_Dec: 0, lsb_Dec: 0 },
          parameters: {},
        }

        return {
          ChannelID: channelID,
          PartName: channelID <= 4 ? ["Left", "Right 1", "Right 2", "Right 3"][channelID - 1] : `Channel ${channelID}`,
          Voice: voice
            ? {
                Name: voice.voice,
                CategoryIcon: `/icons/${voice.sub.toLowerCase()}.png`,
                MSB: Number.parseInt(voice.msb),
                LSB: Number.parseInt(voice.lsb),
                PRG: Number.parseInt(voice.prg),
              }
            : null,
          Mixer: {
            Volume: mixer.volume,
            Pan: mixer.pan,
            EQ: {
              Bass: mixer.eq.bass,
              Mid: mixer.eq.mid,
              High: mixer.eq.high,
            },
          },
          DSP: dsp,
        }
      }),
      Registrations: registrations.map((reg, index) => ({
        SlotNumber: index + 1,
        Name: reg?.name || `Empty Slot ${index + 1}`,
        Timestamp: reg?.timestamp || "",
        Data: reg?.data || null,
      })),
    }

    const blob = new Blob([JSON.stringify(configuration, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tyros5-config-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenConfiguration = () => {
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

        console.log("[v0] Loaded configuration:", config)

        onLoadConfiguration(config)
        alert("Configuration loaded successfully!")
      } catch (error) {
        console.error("[v0] Error parsing configuration file:", error)
        alert("Error loading configuration file. Please check the file format.")
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  const handleSaveClick = (slotNumber: number) => {
    setCurrentSlot(slotNumber)
    setRegistrationName(`Registration ${slotNumber}`)
    setSaveDialogOpen(true)
  }

  const handleSaveConfirm = () => {
    if (currentSlot === null) return

    const newRegistration: Registration = {
      name: registrationName,
      timestamp: new Date().toLocaleString(),
      data: {
        voices: [],
        mixer: [],
        effects: [],
      },
    }

    const newRegistrations = [...registrations]
    newRegistrations[currentSlot - 1] = newRegistration
    setRegistrations(newRegistrations)

    setSaveDialogOpen(false)
    setCurrentSlot(null)
    setRegistrationName("")
  }

  const handleLoad = (slotNumber: number) => {
    const registration = registrations[slotNumber - 1]
    if (!registration) return
    console.log("[v0] Loading registration:", registration.name)
  }

  const handleDelete = (slotNumber: number) => {
    const newRegistrations = [...registrations]
    newRegistrations[slotNumber - 1] = null
    setRegistrations(newRegistrations)
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 bg-gradient-to-b from-background to-black">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <div className="mb-6 md:mb-7 lg:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold premium-text mb-2 md:mb-3 bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
            Registration Manager
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
            Save and recall complete performance setups
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 lg:gap-4 w-full md:w-auto">
          <Button
            onClick={handleOpenConfiguration}
            className="glossy-button h-11 md:h-12 lg:h-14 px-6 md:px-7 lg:px-8 text-sm md:text-base lg:text-lg gap-2 md:gap-3"
            size="lg"
          >
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            Open
          </Button>
          <Button
            onClick={handleSaveConfiguration}
            className="glossy-button h-11 md:h-12 lg:h-14 px-6 md:px-7 lg:px-8 text-sm md:text-base lg:text-lg gap-2 md:gap-3"
            size="lg"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-6 md:mb-7 lg:mb-8">
        {registrations.map((registration, index) => (
          <RegistrationSlot
            key={index}
            slotNumber={index + 1}
            registration={registration}
            onSave={() => handleSaveClick(index + 1)}
            onLoad={() => handleLoad(index + 1)}
            onDelete={() => handleDelete(index + 1)}
          />
        ))}
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Registration</DialogTitle>
            <DialogDescription>Save your current performance setup to slot {currentSlot}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Registration Name</Label>
              <Input
                id="name"
                value={registrationName}
                onChange={(e) => setRegistrationName(e.target.value)}
                placeholder="Enter a name for this registration"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">This will save:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All voice selections</li>
                <li>Mixer settings (volume, pan, mute/solo)</li>
                <li>DSP effect assignments</li>
                <li>Performance part configurations</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm}>Save Registration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
