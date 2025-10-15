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
import { Switch } from "@/components/ui/switch"
import { Download, Upload, Save, Snowflake, List, FolderOpen, Trash2 } from "lucide-react"
import type { Voice } from "@/lib/voice-data"
import type { MixerSettings, DSPSettings } from "@/app/page"
import type { Tyros5Configuration } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Registration {
  name: string
  timestamp: string
  data: {
    voices: Voice[]
    mixer: MixerSettings[]
    effects: DSPSettings[]
    style?: string
    tempo?: number
  }
}

type FreezeParameter = "STYLE" | "TEMPO" | "EFFECT" | "TRANSPOSE" | "VOICE" | "MIXER"

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
  onLoadConfiguration: (config: Tyros5Configuration) => void
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
  const { api } = useMIDI()
  const [registrations, setRegistrations] = useState<(Registration | null)[]>(Array(8).fill(null))
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [registrationName, setRegistrationName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentBank, setCurrentBank] = useState("Bank 1")
  const [banks, setBanks] = useState<string[]>(["Bank 1", "Bank 2", "Bank 3"])

  const [freezeEnabled, setFreezeEnabled] = useState(false)
  const [frozenParameters, setFrozenParameters] = useState<Set<FreezeParameter>>(new Set())

  const [sequenceEnabled, setSequenceEnabled] = useState(false)
  const [sequence, setSequence] = useState<number[]>([])
  const [sequenceEnd, setSequenceEnd] = useState<"STOP" | "TOP" | "NEXT_BANK">("STOP")

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
        voices: Object.values(partVoices),
        mixer: Object.values(channelMixer),
        effects: Object.values(channelDSP),
        style: "Current Style", // TODO: Get from style state
        tempo: 120, // TODO: Get from tempo state
      },
    }

    api.sendCommand({
      type: "registration",
      action: "save",
      slot: currentSlot,
      name: registrationName,
      data: newRegistration.data,
    })

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

    // Apply freeze logic - skip frozen parameters
    const dataToLoad = { ...registration.data }
    if (freezeEnabled) {
      if (frozenParameters.has("VOICE")) delete dataToLoad.voices
      if (frozenParameters.has("MIXER")) delete dataToLoad.mixer
      if (frozenParameters.has("EFFECT")) delete dataToLoad.effects
      if (frozenParameters.has("STYLE")) delete dataToLoad.style
      if (frozenParameters.has("TEMPO")) delete dataToLoad.tempo
    }

    api.sendCommand({
      type: "registration",
      action: "load",
      slot: slotNumber,
      data: dataToLoad,
    })

    setSelectedSlot(slotNumber)
    console.log("[v0] Loading registration:", registration.name)
  }

  const handleDelete = (slotNumber: number) => {
    const newRegistrations = [...registrations]
    newRegistrations[slotNumber - 1] = null
    setRegistrations(newRegistrations)
  }

  const toggleFreezeParameter = (param: FreezeParameter) => {
    const newFrozen = new Set(frozenParameters)
    if (newFrozen.has(param)) {
      newFrozen.delete(param)
    } else {
      newFrozen.add(param)
    }
    setFrozenParameters(newFrozen)
  }

  const addToSequence = (slotNumber: number) => {
    setSequence([...sequence, slotNumber])
  }

  const removeFromSequence = (index: number) => {
    setSequence(sequence.filter((_, i) => i !== index))
  }

  const clearSequence = () => {
    setSequence([])
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 bg-gradient-to-b from-background to-black overflow-y-auto">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold premium-text mb-2 bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
            Registration Memory
          </h2>
          <p className="text-sm text-muted-foreground">Save and recall complete performance setups</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleOpenConfiguration} className="glossy-button gap-2" size="lg">
            <Upload className="w-4 h-4" />
            Open Bank
          </Button>
          <Button onClick={handleSaveConfiguration} className="glossy-button gap-2" size="lg">
            <Download className="w-4 h-4" />
            Save Bank
          </Button>
        </div>
      </div>

      <div className="glossy-panel p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <Label className="text-white font-semibold">Current Bank:</Label>
            <Select value={currentBank} onValueChange={setCurrentBank}>
              <SelectTrigger className="w-48 bg-zinc-900/50 border-amber-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Save className="w-4 h-4" />
              New Bank
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10 bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
              Delete Bank
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Registration Slots */}
        <div className="lg:col-span-2">
          <div className="glossy-panel p-6">
            <h3 className="text-xl font-bold text-white mb-4">Registration Slots</h3>
            <div className="grid grid-cols-2 gap-4">
              {registrations.map((registration, index) => (
                <RegistrationSlot
                  key={index}
                  slotNumber={index + 1}
                  registration={registration}
                  isSelected={selectedSlot === index + 1}
                  onSave={() => handleSaveClick(index + 1)}
                  onLoad={() => handleLoad(index + 1)}
                  onDelete={() => handleDelete(index + 1)}
                  onSelect={() => setSelectedSlot(index + 1)}
                  onAddToSequence={() => addToSequence(index + 1)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controls and Data Summary */}
        <div className="space-y-6">
          <div className="glossy-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Freeze</h3>
              </div>
              <Switch checked={freezeEnabled} onCheckedChange={setFreezeEnabled} />
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Protect selected parameters from being overwritten during recall
            </p>
            <div className="space-y-2">
              {(["VOICE", "MIXER", "EFFECT", "STYLE", "TEMPO", "TRANSPOSE"] as FreezeParameter[]).map((param) => (
                <div key={param} className="flex items-center justify-between">
                  <Label className="text-sm text-white">{param}</Label>
                  <Switch
                    checked={frozenParameters.has(param)}
                    onCheckedChange={() => toggleFreezeParameter(param)}
                    disabled={!freezeEnabled}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glossy-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <List className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Sequence</h3>
              </div>
              <Switch checked={sequenceEnabled} onCheckedChange={setSequenceEnabled} />
            </div>
            <p className="text-xs text-muted-foreground mb-4">Program automatic slot recall order</p>

            {sequenceEnabled && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-zinc-900/50 rounded-lg border border-amber-500/30">
                  {sequence.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Click + on slots to add to sequence</span>
                  ) : (
                    sequence.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/50 rounded px-2 py-1"
                      >
                        <span className="text-sm font-bold text-white">{slot}</span>
                        <button onClick={() => removeFromSequence(index)} className="text-red-400 hover:text-red-300">
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-white">Sequence End:</Label>
                  <Select value={sequenceEnd} onValueChange={(v) => setSequenceEnd(v as typeof sequenceEnd)}>
                    <SelectTrigger className="bg-zinc-900/50 border-amber-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STOP">Stop</SelectItem>
                      <SelectItem value="TOP">Loop to Top</SelectItem>
                      <SelectItem value="NEXT_BANK">Next Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" size="sm" onClick={clearSequence} className="w-full bg-transparent">
                  Clear Sequence
                </Button>
              </div>
            )}
          </div>

          {selectedSlot && registrations[selectedSlot - 1] && (
            <div className="glossy-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4">Saved Data Summary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <Label className="text-amber-500 font-semibold">Voices:</Label>
                  <div className="mt-2 space-y-1">
                    {registrations[selectedSlot - 1]?.data.voices.slice(0, 4).map((voice, i) => (
                      <div key={i} className="text-white">
                        {["Right 1", "Right 2", "Right 3", "Left"][i]}: {voice.voice}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-amber-500 font-semibold">Style & Tempo:</Label>
                  <div className="mt-2 text-white">
                    {registrations[selectedSlot - 1]?.data.style || "N/A"} -{" "}
                    {registrations[selectedSlot - 1]?.data.tempo || 120} BPM
                  </div>
                </div>

                <div>
                  <Label className="text-amber-500 font-semibold">Effects:</Label>
                  <div className="mt-2 text-white">
                    {registrations[selectedSlot - 1]?.data.effects.length} DSP effects configured
                  </div>
                </div>

                <div>
                  <Label className="text-amber-500 font-semibold">Mixer:</Label>
                  <div className="mt-2 text-white">
                    {registrations[selectedSlot - 1]?.data.mixer.length} channels configured
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
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
                <li>All voice selections (Right 1/2/3, Left)</li>
                <li>Mixer settings (volume, pan, EQ)</li>
                <li>DSP effect assignments</li>
                <li>Style and tempo settings</li>
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
