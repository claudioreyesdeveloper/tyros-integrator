"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, Upload, Download, Trash2 } from "lucide-react"
import type { Voice } from "@/lib/tyros-api"
import type { Tyros5Configuration } from "@/lib/types"

interface RegistrationManagerProps {
  partVoices: Record<number, Voice>
  channelMixer: Record<number, any>
  channelDSP: Record<number, any>
  channelEffects: Record<number, string>
  globalSettings: any
  globalEffects: any
  onLoadConfiguration: (config: Tyros5Configuration) => void
}

interface Registration {
  id: string
  name: string
  bank: number
  number: number
  data: any
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
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedBank, setSelectedBank] = useState(0)
  const [registrationName, setRegistrationName] = useState("")

  const handleSaveRegistration = (number: number) => {
    const newRegistration: Registration = {
      id: `${selectedBank}-${number}`,
      name: registrationName || `Registration ${number}`,
      bank: selectedBank,
      number,
      data: {
        partVoices,
        channelMixer,
        channelDSP,
        channelEffects,
        globalSettings,
        globalEffects,
      },
    }

    setRegistrations((prev) => {
      const filtered = prev.filter((r) => r.id !== newRegistration.id)
      return [...filtered, newRegistration]
    })

    setRegistrationName("")
  }

  const handleLoadRegistration = (registration: Registration) => {
    const config: Tyros5Configuration = {
      GlobalSettings: registration.data.globalSettings,
      GlobalEffects: registration.data.globalEffects,
      ChannelParts: [],
    }
    onLoadConfiguration(config)
  }

  const handleDeleteRegistration = (id: string) => {
    setRegistrations((prev) => prev.filter((r) => r.id !== id))
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(registrations, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "tyros5-registrations.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setRegistrations(imported)
      } catch (error) {
        console.error("Failed to import registrations:", error)
      }
    }
    reader.readAsText(file)
  }

  const bankRegistrations = registrations.filter((r) => r.bank === selectedBank)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registration Memory</h1>
          <p className="text-muted-foreground">Save and recall complete setups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label>
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </Button>
        </div>
      </div>

      {/* Bank Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Label>Bank:</Label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((bank) => (
              <Button
                key={bank}
                variant={selectedBank === bank ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBank(bank)}
              >
                {String.fromCharCode(65 + bank)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Save New Registration */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Save Current Setup</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Registration Name</Label>
            <Input
              placeholder="Enter registration name..."
              value={registrationName}
              onChange={(e) => setRegistrationName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <Button key={num} onClick={() => handleSaveRegistration(num)} className="h-16">
                <Save className="h-4 w-4 mr-2" />
                {num}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Saved Registrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Saved Registrations - Bank {String.fromCharCode(65 + selectedBank)}</h2>
        {bankRegistrations.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No registrations saved in this bank</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {bankRegistrations.map((reg) => (
              <Card key={reg.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="secondary">{reg.number}</Badge>
                    <h3 className="font-semibold text-sm">{reg.name}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteRegistration(reg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => handleLoadRegistration(reg)}
                >
                  Load
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
