"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Upload, Download, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Registration {
  id: number
  name: string
  data: any
  timestamp: string
}

export function RegistrationManager() {
  const { toast } = useToast()
  const [currentBank, setCurrentBank] = useState(0)
  const [registrations, setRegistrations] = useState<Record<number, Registration>>({})

  const banks = Array.from({ length: 4 }, (_, i) => i)
  const slotsPerBank = 8
  const slots = Array.from({ length: slotsPerBank }, (_, i) => currentBank * slotsPerBank + i + 1)

  const handleSave = (slotId: number) => {
    const registration: Registration = {
      id: slotId,
      name: `Registration ${slotId}`,
      data: {}, // TODO: Capture current state
      timestamp: new Date().toISOString(),
    }

    setRegistrations((prev) => ({ ...prev, [slotId]: registration }))
    toast({
      title: "Registration Saved",
      description: `Saved to slot ${slotId}`,
    })
  }

  const handleLoad = (slotId: number) => {
    const registration = registrations[slotId]
    if (registration) {
      toast({
        title: "Registration Loaded",
        description: `Loaded from slot ${slotId}`,
      })
    }
  }

  const handleDelete = (slotId: number) => {
    setRegistrations((prev) => {
      const newRegs = { ...prev }
      delete newRegs[slotId]
      return newRegs
    })
    toast({
      title: "Registration Deleted",
      description: `Deleted slot ${slotId}`,
    })
  }

  const handleExport = () => {
    const data = JSON.stringify(registrations, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registrations-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            setRegistrations(data)
            toast({
              title: "Import Successful",
              description: "Registrations imported",
            })
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "Invalid file format",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="premium-card p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Registration Memory</h1>
            <p className="text-gray-400">Save and recall complete keyboard setups</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleImport} variant="outline" className="glossy-button bg-transparent">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleExport} variant="outline" className="glossy-button bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="premium-card p-6 md:p-8 mb-6">
        <div className="flex items-center gap-2 mb-6">
          {banks.map((bank) => (
            <Button
              key={bank}
              onClick={() => setCurrentBank(bank)}
              className={cn(
                "glossy-button flex-1",
                currentBank === bank
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                  : "bg-gradient-to-r from-zinc-700 to-zinc-800",
              )}
            >
              Bank {bank + 1}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {slots.map((slotId) => {
            const registration = registrations[slotId]
            const hasData = !!registration

            return (
              <div
                key={slotId}
                className={cn(
                  "premium-card p-6 space-y-4 transition-all",
                  hasData ? "border-2 border-emerald-500/50" : "border-2 border-zinc-800",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-white">Slot {slotId}</div>
                  {hasData && (
                    <Button
                      onClick={() => handleDelete(slotId)}
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {hasData ? (
                  <div className="space-y-2">
                    <div className="text-sm text-emerald-400 font-semibold">{registration.name}</div>
                    <div className="text-xs text-gray-500">{new Date(registration.timestamp).toLocaleString()}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Empty</div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => handleSave(slotId)} className="glossy-button flex-1 text-xs">
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  {hasData && (
                    <Button
                      onClick={() => handleLoad(slotId)}
                      variant="outline"
                      className="glossy-button flex-1 text-xs"
                    >
                      Load
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
