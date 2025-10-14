"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Download, Zap } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function MidiLogger() {
  const [port1, setPort1] = useState<string>("Digitalworkstation Port 1")
  const [port2, setPort2] = useState<string>("Digitalworkstation Port 2")

  const defaultPorts = ["Digitalworkstation Port 1", "Digitalworkstation Port 2"]
  const availablePorts = defaultPorts

  const handleExportLogs = () => {
    console.log("[v0] Export logs functionality removed")
  }

  const handleAutoconnect = async () => {
    console.log("[v0] Autoconnect functionality removed")
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="glossy-panel p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">MIDI Port Configuration</h2>
            <p className="text-sm text-gray-300">Configure MIDI input and output ports</p>
          </div>
          <Button
            onClick={handleAutoconnect}
            className="glossy-button h-9 md:h-10 px-4 md:px-5 text-xs md:text-sm gap-2"
            size="sm"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4" />
            Autoconnect
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="port1">Port 1</Label>
            <Select value={port1} onValueChange={setPort1}>
              <SelectTrigger
                id="port1"
                className="w-full bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 md:h-12 rounded-xl transition-all text-sm md:text-base"
              >
                <SelectValue placeholder="Select MIDI Port 1" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                {availablePorts.map((port, index) => (
                  <SelectItem
                    key={index}
                    value={port}
                    className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black text-sm md:text-base"
                  >
                    {port}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="port2">Port 2</Label>
            <Select value={port2} onValueChange={setPort2}>
              <SelectTrigger
                id="port2"
                className="w-full bg-zinc-900/50 border-2 border-amber-500/30 hover:border-amber-500/50 focus:border-amber-500 text-white font-semibold h-11 md:h-12 rounded-xl transition-all text-sm md:text-base"
              >
                <SelectValue placeholder="Select MIDI Port 2" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-2 border-amber-500/30 text-white">
                {availablePorts.map((port, index) => (
                  <SelectItem
                    key={index}
                    value={port}
                    className="text-white font-semibold hover:bg-zinc-800 focus:bg-gradient-to-r focus:from-amber-500 focus:to-yellow-500 focus:text-black text-sm md:text-base"
                  >
                    {port}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="glossy-panel p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">MIDI Activity Log</h2>
            <p className="text-sm text-gray-300">Real-time MIDI message monitoring (disabled)</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportLogs}
              variant="outline"
              size="sm"
              className="glossy-button text-xs md:text-sm bg-transparent"
              disabled
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="glossy-button text-xs md:text-sm bg-transparent" disabled>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <div className="text-center py-8 text-gray-400">
          MIDI functionality has been removed. This is now a UI-only demonstration.
        </div>
      </div>
    </div>
  )
}
