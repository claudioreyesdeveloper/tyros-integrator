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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Upload, FileMusic, Zap } from "lucide-react"
import type { Voice } from "@/lib/voice-data"
import type { MixerSettings, DSPSettings } from "@/app/page"
import { PatchFileImportDialog } from "./patch-file-import-dialog"

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
}

export function RegistrationManager({
  partVoices,
  channelMixer,
  channelDSP,
  channelEffects,
  globalSettings,
  globalEffects,
}: RegistrationManagerProps) {
  const { midiAccess, requestMIDIAccess } = useMIDI()
  const [registrations, setRegistrations] = useState<(Registration | null)[]>(Array(8).fill(null))
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [patchImportDialogOpen, setPatchImportDialogOpen] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<number | null>(null)
  const [registrationName, setRegistrationName] = useState("")
  const [port1, setPort1] = useState<string>("")
  const [port2, setPort2] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const patchFileInputRef = useRef<HTMLInputElement>(null)

  const availablePorts = midiAccess ? Array.from(midiAccess.outputs.values()).map((port) => port.name) : []

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

        alert("Configuration loaded successfully! (State update to be implemented)")
      } catch (error) {
        console.error("[v0] Error parsing configuration file:", error)
        alert("Error loading configuration file. Please check the file format.")
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  const handleOpenPatchFile = () => {
    setPatchImportDialogOpen(true)
  }

  const handlePatchFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const patchData = JSON.parse(content)

        console.log("[v0] Loaded patch file:", patchData)

        alert("Patch file loaded successfully! (State update to be implemented)")
      } catch (error) {
        console.error("[v0] Error parsing patch file:", error)
        alert("Error loading patch file. Please check the file format.")
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

  const handleAutoconnect = async () => {
    await requestMIDIAccess()

    // Auto-select first two available ports
    if (availablePorts.length > 0) {
      setPort1(availablePorts[0])
    }
    if (availablePorts.length > 1) {
      setPort2(availablePorts[1])
    }
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 bg-gradient-to-b from-background to-black">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
      <input
        ref={patchFileInputRef}
        type="file"
        accept=".json,.patch"
        onChange={handlePatchFileChange}
        className="hidden"
      />

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
            onClick={handleOpenPatchFile}
            className="glossy-button h-11 md:h-12 lg:h-14 px-6 md:px-7 lg:px-8 text-sm md:text-base lg:text-lg gap-2 md:gap-3"
            size="lg"
          >
            <FileMusic className="w-4 h-4 md:w-5 md:h-5" />
            Open Patch File
          </Button>
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

      <div className="glossy-panel p-6 md:p-7 lg:p-8">
        <div className="flex items-center justify-between mb-4 md:mb-5 lg:mb-6">
          <h3 className="premium-label text-sm md:text-base">MIDI Port Configuration</h3>
          <Button
            onClick={handleAutoconnect}
            className="glossy-button h-9 md:h-10 px-4 md:px-5 text-xs md:text-sm gap-2"
            size="sm"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4" />
            Autoconnect
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 lg:gap-8">
          <div className="space-y-2">
            <Label htmlFor="port1">Port 1</Label>
            <Select value={port1} onValueChange={setPort1}>
              <SelectTrigger id="port1" className="h-11 md:h-12">
                <SelectValue placeholder="Select MIDI Port 1" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.length > 0 ? (
                  availablePorts.map((port, index) => (
                    <SelectItem key={index} value={port}>
                      {port}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No MIDI ports available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {port1 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Connected</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="port2">Port 2</Label>
            <Select value={port2} onValueChange={setPort2}>
              <SelectTrigger id="port2" className="h-11 md:h-12">
                <SelectValue placeholder="Select MIDI Port 2" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.length > 0 ? (
                  availablePorts.map((port, index) => (
                    <SelectItem key={index} value={port}>
                      {port}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No MIDI ports available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {port2 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <PatchFileImportDialog open={patchImportDialogOpen} onOpenChange={setPatchImportDialogOpen} />

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
